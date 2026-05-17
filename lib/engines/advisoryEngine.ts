import { Field, StressScores, Advisory, AdvisoryType, StressLevel } from '@/types';
import { daysSinceFertilizer, rainfallAdequacy, probToLevel } from './stressEngine';

let counter = 0;
const makeId = () => `ADV-${String(++counter).padStart(5, '0')}`;

function toUrgency(p: number): StressLevel { return probToLevel(p); }

// ── Water Stress Advisory ──────────────────────────────────────────────────────
function waterAdvisory(f: Field, s: StressScores): Advisory | null {
  if (s.water_stress_probability < 0.28) return null;
  const rfPct = Math.round(s.rainfall_adequacy * 100);
  return {
    id: makeId(), field_id: f.field_id,
    type: 'Water Stress',
    issue: 'Active Water Stress Detected',
    evidence: [
      `NDWI: ${f.indices.NDWI.toFixed(3)} vs expected ≥ ${f.indices.expected_NDWI.toFixed(3)} for ${f.growth_stage}`,
      `NDWI deviation: ${(s.ndwi_anomaly * 100).toFixed(1)}% below stage expectation`,
      `30-day rainfall: ${f.rainfall_30d_mm} mm (${rfPct}% of ${f.expected_rainfall_30d_mm} mm expected)`,
      `Canopy temperature proxy: +${f.indices.canopy_temp_proxy.toFixed(1)}°C above ambient`,
      `Historical water stress frequency: ${(f.historical_stress_frequency * 100).toFixed(0)}% of monitored seasons`,
    ],
    possible_causes: [
      'Insufficient rainfall or irrigation during critical growth window',
      'High evapotranspiration due to elevated canopy temperature',
      'Restricted root-zone water availability (soil type/compaction)',
    ],
    confidence: s.confidence_level,
    severity: toUrgency(s.water_stress_probability),
    expected_impact: `Water stress during ${f.growth_stage} suppresses internode elongation and photosynthesis. Unresolved, this may reduce TCH by 15–25%.`,
    recommended_action: `Initiate irrigation review within 48 hours. Inspect soil moisture at 30 cm and 60 cm depth. If below field capacity, schedule irrigation before applying any fertilizer correction.`,
    agronomy_notes: `Do not apply nitrogen fertilizer under active water stress — uptake will be severely impaired. Prioritize moisture restoration, then reassess chlorophyll status 10–14 days post-irrigation.`,
    ground_validation_required: true,
    created_at: new Date().toISOString(),
    resolved: false,
    is_recurring: f.historical_stress_frequency > 0.45,
    recurrence_count: Math.round(f.historical_stress_frequency * 5),
    explanation: `Water stress probability is ${(s.water_stress_probability * 100).toFixed(0)}% because NDWI is ${(Math.abs(s.ndwi_anomaly) * 100).toFixed(0)}% below the ${f.growth_stage} stage expectation, rainfall adequacy is only ${rfPct}%, and canopy temperature is elevated by ${f.indices.canopy_temp_proxy.toFixed(1)}°C — indicating stomatal closure and active stress response.`,
  };
}

// ── Nutrient Stress Advisory ───────────────────────────────────────────────────
function nutrientAdvisory(f: Field, s: StressScores): Advisory | null {
  if (s.nutrient_stress_probability < 0.30) return null;
  const dsf = daysSinceFertilizer(f);
  const isWaterConfounded = s.water_stress_probability > 0.45;
  return {
    id: makeId(), field_id: f.field_id,
    type: 'Nutrient Stress',
    issue: isWaterConfounded ? 'Possible Nutrient-Water Combined Stress' : 'High Nutrient Stress Probability',
    evidence: [
      `CIRE: ${f.indices.CIRE.toFixed(3)} vs expected ${f.indices.expected_CIRE.toFixed(3)} for ${f.growth_stage} (${(s.cire_anomaly * 100).toFixed(1)}% deviation)`,
      `NDRE: ${f.indices.NDRE.toFixed(3)} vs expected ${f.indices.expected_NDRE.toFixed(3)} (${(s.ndre_anomaly * 100).toFixed(1)}% deviation)`,
      `NDWI: ${f.indices.NDWI > -0.08 ? 'Adequate — water uptake not primary constraint' : 'Mildly reduced — consider combined stress'}`,
      `Soil nitrogen: ${f.nitrogen_level} | Last fertilizer: ${dsf} days ago`,
      `Applied nitrogen: ${f.fertilizer_n_kg_ha} kg N/ha`,
    ],
    possible_causes: [
      'Inadequate nitrogen supply relative to crop demand at this stage',
      'Nitrogen leaching due to prior excess rainfall',
      isWaterConfounded ? 'Water-stress-induced nutrient uptake limitation' : 'Delayed split application of N fertilizer',
    ],
    confidence: isWaterConfounded ? s.confidence_level * 0.80 : s.confidence_level,
    severity: toUrgency(s.nutrient_stress_probability),
    expected_impact: `Chlorophyll deficiency at ${f.growth_stage} reduces photosynthetic capacity. Can reduce CCS and final TCH by 10–18% if not addressed within 2–3 weeks.`,
    recommended_action: isWaterConfounded
      ? `Resolve moisture deficit first. Once NDWI recovers to ≥ ${f.indices.expected_NDWI.toFixed(2)}, reassess chlorophyll response before scheduling nutrient correction.`
      : `Conduct field inspection to confirm chlorophyll deficiency symptoms (interveinal chlorosis, yellowing). If validated, schedule split N application. Field validation mandatory before any corrective fertilizer application.`,
    agronomy_notes: `Low CIRE combined with adequate NDWI and rainfall is the most reliable signal for true nutrient stress in sugarcane. NDRE weakness in Grand Growth stage carries higher diagnostic weight than NDVI.`,
    ground_validation_required: true,
    created_at: new Date().toISOString(),
    resolved: false,
    is_recurring: f.nitrogen_level === 'Low' && f.historical_stress_frequency > 0.4,
    recurrence_count: Math.round(f.historical_stress_frequency * 4),
    explanation: `Nutrient stress probability is ${(s.nutrient_stress_probability * 100).toFixed(0)}% because CIRE is ${(Math.abs(s.cire_anomaly) * 100).toFixed(0)}% below the ${f.growth_stage} stage trajectory, NDRE shows similar chlorophyll suppression, while NDWI and rainfall${s.rainfall_adequacy >= 0.70 ? ' are adequate — eliminating water-induced uptake limitation' : ' are moderately reduced — some water confounding is possible'}. Soil nitrogen is ${f.nitrogen_level.toLowerCase()} and fertilizer was applied ${dsf} days ago.`,
  };
}

// ── Salinity Advisory ─────────────────────────────────────────────────────────
function salinityAdvisory(f: Field, s: StressScores): Advisory | null {
  if (s.salinity_risk_probability < 0.25) return null;
  return {
    id: makeId(), field_id: f.field_id,
    type: 'Salinity Stress',
    issue: 'Elevated Salinity Risk Detected',
    evidence: [
      `Salinity proxy index: ${f.indices.salinity_index.toFixed(3)} (alert threshold: > 0.15)`,
      `Soil pH: ${f.soil_ph} | Soil type: ${f.soil_type}`,
      `NDVI suppression: ${f.indices.NDVI.toFixed(3)} vs expected for ${f.growth_stage}`,
      `Historical stress frequency: ${(f.historical_stress_frequency * 100).toFixed(0)}%`,
    ],
    possible_causes: [
      'Sodium accumulation in root zone from poor-quality irrigation water',
      'Salt-retentive soil type (Black Cotton / Vertisol)',
      'Inadequate drainage causing salt concentration',
    ],
    confidence: s.confidence_level * 0.82,
    severity: toUrgency(s.salinity_risk_probability),
    expected_impact: `Soil EC > 3 dS/m can reduce germination rate and root development. Sustained salinity suppression in ${f.growth_stage} may reduce TCH by 20–30%.`,
    recommended_action: `Collect soil samples at 0–30 cm and 30–60 cm for EC and pH testing. Confirm EC before any corrective action. If EC > 3 dS/m, initiate leaching irrigation with good-quality water.`,
    agronomy_notes: `Do not apply potassic fertilizers under unconfirmed salinity conditions. Avoid furrow irrigation with high-EC water until EC is measured and managed.`,
    ground_validation_required: true,
    created_at: new Date().toISOString(),
    resolved: false,
    is_recurring: f.soil_type === 'Black Cotton' && f.historical_stress_frequency > 0.4,
    recurrence_count: Math.round(f.historical_stress_frequency * 3),
    explanation: `Salinity risk is ${(s.salinity_risk_probability * 100).toFixed(0)}% based on elevated salinity proxy index (${f.indices.salinity_index.toFixed(3)}), soil pH of ${f.soil_ph}, ${f.soil_type} soil type (salt-retentive), and suppressed vegetation indices. This is a proxy-based signal — ground EC confirmation is mandatory.`,
  };
}

// ── Growth Suppression Advisory ────────────────────────────────────────────────
function growthAdvisory(f: Field, s: StressScores): Advisory | null {
  if (s.growth_performance_score > 62) return null;
  return {
    id: makeId(), field_id: f.field_id,
    type: 'Growth Suppression',
    issue: 'Below-Expected Growth Performance',
    evidence: [
      `Growth performance score: ${s.growth_performance_score}/100`,
      `NDRE: ${f.indices.NDRE.toFixed(3)} vs expected ${f.indices.expected_NDRE.toFixed(3)} for ${f.growth_stage}`,
      `Crop age: ${f.crop_age_days} days | Stage: ${f.growth_stage}`,
      `Historical yield baseline: ${f.historical_yield_tch} TCH`,
    ],
    possible_causes: [
      'Combined water and nutrient stress suppressing canopy development',
      'Suboptimal agronomic management for current stage',
      'Genetic or cultivar-related limitation',
    ],
    confidence: s.confidence_level * 0.88,
    severity: s.growth_performance_score < 40 ? 'High' : 'Moderate',
    expected_impact: `Growth deficit at ${f.growth_stage} will limit internode count and stalk weight. Current trajectory may yield below the ${f.historical_yield_tch} TCH historical baseline.`,
    recommended_action: `Conduct full agronomic field inspection within 7 days. Review irrigation, fertilizer stage-alignment, and pest/disease status. Monitor NDRE trend across next 2 satellite cycles.`,
    agronomy_notes: `Growth suppression in Grand Growth stage is most critical. NDRE improvement of > 0.04 units over 14 days following corrective action indicates positive response.`,
    ground_validation_required: true,
    created_at: new Date().toISOString(),
    resolved: false,
    is_recurring: f.historical_stress_frequency > 0.5,
    recurrence_count: Math.round(f.historical_stress_frequency * 4),
    explanation: `Growth performance score is ${s.growth_performance_score}/100 because NDRE is ${(Math.abs(s.ndre_anomaly) * 100).toFixed(0)}% below the ${f.growth_stage} stage expectation. This indicates canopy biomass is accumulating slower than expected for this crop age.`,
  };
}

// ── Harvest Readiness Advisory ────────────────────────────────────────────────
function harvestAdvisory(f: Field, s: StressScores): Advisory | null {
  if (f.growth_stage !== 'Maturity') return null;
  const daysToHarvest = Math.floor((new Date(f.expected_harvest_date).getTime() - Date.now()) / 86400000);
  if (daysToHarvest > 55) return null;
  return {
    id: makeId(), field_id: f.field_id,
    type: 'Harvest Readiness',
    issue: 'Harvest Window Approaching',
    evidence: [
      `Crop age: ${f.crop_age_days} days — Maturity stage`,
      `Expected harvest: ${f.expected_harvest_date} (${daysToHarvest} days)`,
      `NDRE: ${f.indices.NDRE.toFixed(3)} — natural senescence ${f.indices.NDRE < f.indices.expected_NDRE ? 'progressing' : 'not yet initiated'}`,
      `Health score: ${s.health_score}/100`,
    ],
    possible_causes: [],
    confidence: s.confidence_level,
    severity: daysToHarvest < 28 ? 'High' : 'Moderate',
    expected_impact: `Harvesting beyond peak sucrose window risks sucrose inversion and dry matter loss.`,
    recommended_action: `Schedule Brix and CCS sampling in the next 2 weeks. Coordinate harvest logistics with mill. If water stress is present, prioritize harvest to arrest quality degradation.`,
    agronomy_notes: `Optimal CCS window is typically when NDRE decline rate plateaus. Avoid nitrogen application in final 45 days before harvest.`,
    ground_validation_required: true,
    created_at: new Date().toISOString(),
    resolved: false,
    is_recurring: false,
    recurrence_count: 0,
    explanation: `Harvest readiness advisory triggered because the field is in Maturity stage with ${daysToHarvest} days to expected harvest. Satellite-derived NDRE trend can help identify peak sucrose window.`,
  };
}

// ── Main Entry ─────────────────────────────────────────────────────────────────
export function generateAdvisories(f: Field, s: StressScores): Advisory[] {
  const list: Advisory[] = [];
  const w = waterAdvisory(f, s); if (w) list.push(w);
  const n = nutrientAdvisory(f, s); if (n) list.push(n);
  const sal = salinityAdvisory(f, s); if (sal) list.push(sal);
  const g = growthAdvisory(f, s); if (g) list.push(g);
  const h = harvestAdvisory(f, s); if (h) list.push(h);
  return list;
}
