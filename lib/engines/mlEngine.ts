import { Field, StressScores, TCHPrediction, MLFeatureVector } from '@/types';
import { clamp, calcNDREAnomaly, calcCIREAnomaly, calcNDWIAnomaly } from './indices';
import { rainfallAdequacy, daysSinceFertilizer } from './stressEngine';

/** Build ML feature vector (CatBoost-ready structure) */
export function buildFeatureVector(f: Field, s: StressScores): MLFeatureVector {
  const stageEnc: Record<string, number> = {
    Initiation: 0, Tillering: 0.33, 'Grand Growth': 0.67, Maturity: 1,
  };
  const nlEnc: Record<string, number> = { Low: 0, Medium: 0.5, High: 1 };

  // Temporal variability: use standard deviation proxy from temporal_series
  const ndreVals = f.temporal_series.slice(-6).map(t => t.NDRE);
  const mean = ndreVals.reduce((a, b) => a + b, 0) / (ndreVals.length || 1);
  const variance = ndreVals.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / (ndreVals.length || 1);

  const ndreChange7d = f.temporal_series.length >= 2
    ? f.temporal_series[f.temporal_series.length - 1].NDRE - f.temporal_series[f.temporal_series.length - 2].NDRE
    : 0;
  const ndwiChange7d = f.temporal_series.length >= 2
    ? f.temporal_series[f.temporal_series.length - 1].NDWI - f.temporal_series[f.temporal_series.length - 2].NDWI
    : 0;

  return {
    field_id: f.field_id,
    ndre_anomaly: s.ndre_anomaly,
    cire_anomaly: s.cire_anomaly,
    ndwi_anomaly: s.ndwi_anomaly,
    ndvi_anomaly: (f.indices.NDVI - f.indices.expected_NDVI) / Math.abs(f.indices.expected_NDVI || 0.01),
    ndre_7d_change: ndreChange7d,
    ndwi_7d_change: ndwiChange7d,
    cire_7d_change: 0, // simplified
    ndre_30d_auc: mean * 30,
    chlorophyll_suppression_score: clamp(-s.cire_anomaly * 100, 0, 100),
    water_deficit_score: clamp(-s.ndwi_anomaly * 100, 0, 100),
    salinity_suppression_score: f.indices.salinity_index * 100,
    growth_consistency_score: 100 - Math.sqrt(variance) * 500,
    rainfall_adequacy: s.rainfall_adequacy,
    cumulative_rainfall_30d: f.rainfall_30d_mm,
    cumulative_stress_days: Math.round(f.historical_stress_frequency * f.crop_age_days),
    soil_n_encoded: nlEnc[f.nitrogen_level] ?? 0.5,
    days_since_fertilizer: daysSinceFertilizer(f),
    historical_productivity_alignment: f.historical_yield_tch / 90, // normalize to 90 tch max
    historical_stress_frequency: f.historical_stress_frequency,
    crop_age_days: f.crop_age_days,
    stage_encoded: stageEnc[f.growth_stage] ?? 0.5,
  };
}

/**
 * Mock CatBoost-style TCH prediction.
 * In production: POST features to /api/ml/predict
 */
export function predictTCH(f: Field, s: StressScores, features: MLFeatureVector): TCHPrediction {
  // Weighted formula approximating a regression model
  let base = f.historical_yield_tch;

  // NDRE is the strongest predictor of final biomass
  base += s.ndre_anomaly * 18;

  // CIRE impacts sugar accumulation in maturity
  base += s.cire_anomaly * 10;

  // Water stress directly limits internode elongation
  base -= s.water_stress_probability * 22;

  // Nutrient stress impacts photosynthesis
  base -= s.nutrient_stress_probability * 14;

  // Salinity suppression
  base -= s.salinity_risk_probability * 12;

  // Growth consistency bonus
  base += (s.growth_performance_score - 60) * 0.2;

  const predicted = clamp(Math.round(base * 10) / 10, 30, 120);
  const uncertainty = clamp(15 - s.confidence_level * 10, 4, 15);
  const yield_gap = parseFloat((predicted - f.historical_yield_tch).toFixed(1));

  const bucket =
    predicted >= 95 ? 'High' :
    predicted >= 82 ? 'Above Average' :
    predicted >= 68 ? 'Average' :
    predicted >= 52 ? 'Below Average' : 'Low';

  const harvestScore = clamp(
    (f.growth_stage === 'Maturity' ? 50 : f.growth_stage === 'Grand Growth' ? 20 : 0)
    + s.health_score * 0.35 + (1 - s.water_stress_probability) * 20,
    0, 100
  );

  // SHAP-style top features
  const shapFeatures = [
    { feature: 'NDRE vs Stage Expected', impact: Math.abs(s.ndre_anomaly * 18), direction: s.ndre_anomaly >= 0 ? 'positive' : 'negative' as 'positive' | 'negative' },
    { feature: 'Water Stress Level', impact: s.water_stress_probability * 22, direction: 'negative' as 'negative' },
    { feature: 'Nutrient Status (CIRE)', impact: Math.abs(s.cire_anomaly * 10), direction: s.cire_anomaly >= 0 ? 'positive' : 'negative' as 'positive' | 'negative' },
    { feature: 'Historical Yield Baseline', impact: f.historical_yield_tch * 0.1, direction: 'positive' as 'positive' },
    { feature: 'Growth Performance Score', impact: Math.abs((s.growth_performance_score - 60) * 0.2), direction: s.growth_performance_score >= 60 ? 'positive' : 'negative' as 'positive' | 'negative' },
    { feature: 'Salinity Risk', impact: s.salinity_risk_probability * 12, direction: 'negative' as 'negative' },
  ].sort((a, b) => b.impact - a.impact).slice(0, 4);

  return {
    predicted_tch: predicted,
    confidence_interval: [
      parseFloat((predicted - uncertainty).toFixed(1)),
      parseFloat((predicted + uncertainty).toFixed(1)),
    ],
    confidence: s.confidence_level,
    productivity_bucket: bucket,
    yield_gap,
    harvest_readiness_score: Math.round(harvestScore),
    top_features: shapFeatures,
    explanation: `Predicted TCH of ${predicted} is based on NDRE performance (${(s.ndre_anomaly * 100 > 0 ? '+' : '') + (s.ndre_anomaly * 100).toFixed(0)}% vs stage), water stress level (${(s.water_stress_probability * 100).toFixed(0)}% probability), and chlorophyll status. ${yield_gap >= 0 ? `Estimated yield is ${yield_gap} TCH above historical baseline.` : `Estimated yield is ${Math.abs(yield_gap)} TCH below historical baseline — corrective action may partially recover productivity.`}`,
  };
}
