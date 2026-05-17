import { Field, StressScores, AdvisoryPriority, StressLevel } from '@/types';
import { clamp, calcNDREAnomaly, calcCIREAnomaly, calcNDWIAnomaly } from './indices';

export const rainfallAdequacy = (f: Field) =>
  f.expected_rainfall_30d_mm > 0 ? f.rainfall_30d_mm / f.expected_rainfall_30d_mm : 1;

export const daysSinceFertilizer = (f: Field) =>
  Math.floor((Date.now() - new Date(f.last_fertilizer_date).getTime()) / 86400000);

/**
 * Nutrient Stress Probability
 *
 * Agronomic rule:
 * - Low CIRE + low NDWI → water stress more likely (uptake limitation), discount nutrient attribution
 * - Low CIRE + normal NDWI + adequate rainfall + poor fertilizer/soil → nutrient stress likely
 */
export function nutrientStressProb(f: Field): number {
  const cireAnom = calcCIREAnomaly(f.indices);
  const ndreAnom = calcNDREAnomaly(f.indices);
  const ndwiAnom = calcNDWIAnomaly(f.indices);
  const rfAdequacy = rainfallAdequacy(f);
  const dsf = daysSinceFertilizer(f);

  let score = 0;

  // CIRE deficit — main chlorophyll signal
  if (cireAnom < -0.08) score += clamp(Math.abs(cireAnom) * 2.2, 0, 0.30);

  // NDRE deficit in late stages
  if (['Grand Growth', 'Maturity'].includes(f.growth_stage) && ndreAnom < -0.08)
    score += clamp(Math.abs(ndreAnom) * 1.8, 0, 0.22);

  // If NDWI is severely low → water stress is primary cause → discount nutrient attribution
  const waterPenalty = ndwiAnom < -0.6 ? 0.45 : ndwiAnom < -0.35 ? 0.70 : 1.0;

  // Rainfall adequacy factor
  const rfFactor = rfAdequacy >= 0.70 ? 1.0 : clamp(rfAdequacy + 0.3, 0.3, 1.0);

  score *= waterPenalty * rfFactor;

  // Soil nitrogen
  if (f.indices.NDRE < 0.25 && f.nitrogen_level === 'Low') score += 0.18;
  else if (f.nitrogen_level === 'Low') score += 0.12;
  else if (f.nitrogen_level === 'Medium') score += 0.05;

  // Delayed fertilizer application
  if (dsf > 100) score += 0.15;
  else if (dsf > 70) score += 0.09;
  else if (dsf > 50) score += 0.04;

  // Historical stress
  score += f.historical_stress_frequency * 0.08;

  return clamp(score, 0, 1);
}

/**
 * Water Stress Probability
 */
export function waterStressProb(f: Field): number {
  const ndwiAnom = calcNDWIAnomaly(f.indices);
  const rfAdequacy = rainfallAdequacy(f);
  let score = 0;

  if (ndwiAnom < -0.25) score += clamp(Math.abs(ndwiAnom) / 1.8, 0, 0.35);
  if (rfAdequacy < 0.55) score += clamp((0.55 - rfAdequacy) * 1.8, 0, 0.30);
  else if (rfAdequacy < 0.75) score += 0.10;

  if (f.indices.canopy_temp_proxy > 4.5) score += 0.28;
  else if (f.indices.canopy_temp_proxy > 2.5) score += 0.15;
  else if (f.indices.canopy_temp_proxy > 1.5) score += 0.06;

  score += f.historical_stress_frequency * 0.10;
  if (f.rainfall_7d_mm < 5) score += 0.08;

  return clamp(score, 0, 1);
}

/**
 * Salinity Risk Probability
 */
export function salinityRiskProb(f: Field): number {
  let score = 0;
  const si = f.indices.salinity_index;

  if (si > 0.32) score += 0.42;
  else if (si > 0.22) score += 0.26;
  else if (si > 0.14) score += 0.12;

  if (f.indices.NDVI < 0.50 && f.growth_stage === 'Grand Growth') score += 0.18;
  if (f.soil_type === 'Black Cotton' || f.soil_type === 'Vertisol') score += 0.12;
  if (f.soil_ph > 8.2) score += 0.12;
  else if (f.soil_ph > 7.8) score += 0.06;

  score += f.historical_stress_frequency * 0.08;
  return clamp(score, 0, 1);
}

/**
 * Growth Performance Score (0–100)
 */
export function growthPerformanceScore(f: Field): number {
  const ndreAnom = calcNDREAnomaly(f.indices);
  const cireAnom = calcCIREAnomaly(f.indices);
  let score = 62;
  score += clamp(ndreAnom * 45, -32, 22);
  score += clamp(cireAnom * 18, -14, 10);
  score += clamp((f.historical_yield_tch - 65) / 35 * 10, -10, 10);
  return clamp(Math.round(score), 0, 100);
}

/**
 * Health Score (0–100)
 */
export function healthScore(nutrient: number, water: number, salinity: number, growth: number): number {
  const penalty = nutrient * 22 + water * 30 + salinity * 18;
  return clamp(Math.round(growth * 0.28 + 72 - penalty), 0, 100);
}

/**
 * Advisory Priority
 */
export function advisoryPriority(
  f: Field, nutrient: number, water: number, salinity: number
): { score: number; label: AdvisoryPriority } {
  const maxStress = Math.max(nutrient, water, salinity);
  const stageSens: Record<string, number> = {
    Initiation: 0.55, Tillering: 0.75, 'Grand Growth': 1.0, Maturity: 0.82,
  };
  const sens = stageSens[f.growth_stage] ?? 0.8;
  const areaFactor = clamp(f.area_ha / 10, 0.3, 1.0);
  const score = clamp(Math.round(maxStress * 62 * sens + areaFactor * 20 + f.historical_stress_frequency * 18), 0, 100);
  const label: AdvisoryPriority = score >= 75 ? 'Urgent' : score >= 52 ? 'High' : score >= 32 ? 'Medium' : 'Low';
  return { score, label };
}

/**
 * Confidence Level (0–1)
 */
export function confidenceLevel(f: Field): number {
  const daysSinceSat = Math.floor((Date.now() - new Date(f.last_satellite_date).getTime()) / 86400000);
  let c = 0.94;
  if (daysSinceSat > 14) c -= 0.15;
  else if (daysSinceSat > 7) c -= 0.06;
  if (f.growth_stage === 'Initiation') c -= 0.10;
  if (f.historical_stress_frequency > 0.6) c -= 0.05;
  return clamp(c, 0.50, 0.97);
}

export function probToLevel(p: number): StressLevel {
  if (p >= 0.75) return 'Critical';
  if (p >= 0.55) return 'High';
  if (p >= 0.35) return 'Moderate';
  if (p >= 0.15) return 'Low';
  return 'None';
}

/**
 * Full score pipeline
 */
export function scoreField(f: Field): StressScores {
  const nutrient = nutrientStressProb(f);
  const water = waterStressProb(f);
  const salinity = salinityRiskProb(f);
  const growth = growthPerformanceScore(f);
  const health = healthScore(nutrient, water, salinity, growth);
  const { score: priScore, label: priLabel } = advisoryPriority(f, nutrient, water, salinity);
  const confidence = confidenceLevel(f);
  const rfAdeq = rainfallAdequacy(f);

  return {
    nutrient_stress_probability: nutrient,
    water_stress_probability: water,
    salinity_risk_probability: salinity,
    growth_performance_score: growth,
    health_score: health,
    advisory_priority_score: priScore,
    advisory_priority: priLabel,
    confidence_level: confidence,
    ndre_anomaly: calcNDREAnomaly(f.indices),
    cire_anomaly: calcCIREAnomaly(f.indices),
    ndwi_anomaly: calcNDWIAnomaly(f.indices),
    rainfall_adequacy: rfAdeq,
  };
}
