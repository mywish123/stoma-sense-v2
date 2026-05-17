import { EnrichedField, DashboardStats, Alert, User } from '@/types';
import mockFields from './mockFields';
import { scoreField } from '../engines/stressEngine';
import { generateAdvisories } from '../engines/advisoryEngine';
import { buildFeatureVector, predictTCH } from '../engines/mlEngine';
import { computePhenology } from '../engines/phenologyEngine';

let _cache: EnrichedField[] | null = null;

export function getEnrichedFields(): EnrichedField[] {
  if (_cache) return _cache;
  _cache = mockFields.map(field => {
    const scores = scoreField(field);
    const advisories = generateAdvisories(field, scores);
    const ml = buildFeatureVector(field, scores);
    const tch = predictTCH(field, scores, ml);
    const phenology = computePhenology(field);

    // Primary recommended action
    let recommended_action = 'Continue monitoring. Field is within acceptable range.';
    let stress_summary = 'No significant stress detected.';

    if (scores.water_stress_probability > 0.55) {
      recommended_action = 'URGENT: Initiate irrigation review within 48 hours.';
      stress_summary = `Active water stress (${(scores.water_stress_probability * 100).toFixed(0)}% probability). Canopy temperature elevated.`;
    } else if (scores.nutrient_stress_probability > 0.50) {
      recommended_action = 'Conduct field inspection for nutrient deficiency. Schedule corrective nutrition after validation.';
      stress_summary = `Likely nutrient stress (${(scores.nutrient_stress_probability * 100).toFixed(0)}% probability). CIRE/NDRE below stage expectation.`;
    } else if (scores.salinity_risk_probability > 0.40) {
      recommended_action = 'Collect soil EC samples. Do not apply fertilizer without confirmed salinity assessment.';
      stress_summary = `Elevated salinity risk (${(scores.salinity_risk_probability * 100).toFixed(0)}% probability). EC testing required.`;
    }

    return {
      ...field,
      ...scores,
      advisories,
      tch_prediction: tch,
      phenology,
      ml_features: ml,
      recommended_action,
      stress_summary,
    };
  });
  return _cache;
}

export function getEnrichedField(id: string): EnrichedField | undefined {
  return getEnrichedFields().find(f => f.field_id === id);
}

export function getDashboardStats(): DashboardStats {
  const fields = getEnrichedFields();
  const allAdvisories = fields.flatMap(f => f.advisories);

  return {
    total_area_ha: parseFloat(fields.reduce((s, f) => s + f.area_ha, 0).toFixed(1)),
    field_count: fields.length,
    avg_health_score: parseFloat((fields.reduce((s, f) => s + f.health_score, 0) / fields.length).toFixed(1)),
    high_water_stress: fields.filter(f => f.water_stress_probability > 0.50).length,
    high_nutrient_stress: fields.filter(f => f.nutrient_stress_probability > 0.48).length,
    high_salinity_risk: fields.filter(f => f.salinity_risk_probability > 0.38).length,
    urgent_advisories: fields.filter(f => f.advisory_priority === 'Urgent' || f.advisory_priority === 'High').length,
    active_alerts: allAdvisories.filter(a => a.severity === 'Critical' || a.severity === 'High').length,
    avg_tch_predicted: parseFloat((fields.reduce((s, f) => s + f.tch_prediction.predicted_tch, 0) / fields.length).toFixed(1)),
    last_satellite_date: '2025-05-14',
    coverage_pct: 94,
    districts_covered: Array.from(new Set(fields.map(f => f.district))).length,
  };
}

export function getAlerts(): Alert[] {
  const fields = getEnrichedFields();
  const alerts: Alert[] = [];
  let id = 0;

  fields.forEach(f => {
    if (f.water_stress_probability > 0.65) {
      alerts.push({
        id: `ALT-${++id}`, field_id: f.field_id, field_name: f.farm_name,
        type: 'irrigation_deficit',
        message: `Critical water stress in ${f.farm_name} (${f.field_id}). NDWI ${(f.ndwi_anomaly * 100).toFixed(0)}% below expectation.`,
        severity: 'Critical', created_at: new Date().toISOString(), acknowledged: false,
      });
    }
    if (f.salinity_risk_probability > 0.45) {
      alerts.push({
        id: `ALT-${++id}`, field_id: f.field_id, field_name: f.farm_name,
        type: 'high_risk',
        message: `Elevated salinity risk in ${f.farm_name}. Salinity index: ${f.indices.salinity_index.toFixed(2)}. EC testing required.`,
        severity: 'High', created_at: new Date().toISOString(), acknowledged: false,
      });
    }
    if (f.ndre_anomaly < -0.35 && f.growth_stage === 'Grand Growth') {
      alerts.push({
        id: `ALT-${++id}`, field_id: f.field_id, field_name: f.farm_name,
        type: 'rapid_decline',
        message: `Rapid NDRE decline in ${f.farm_name} — ${(Math.abs(f.ndre_anomaly) * 100).toFixed(0)}% below stage trajectory.`,
        severity: 'High', created_at: new Date().toISOString(), acknowledged: false,
      });
    }
  });

  return alerts.slice(0, 12);
}

// Mock users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Priya Sharma', email: 'priya@stomasense.ai', role: 'Admin', organization: 'STOMA SENSE HQ', avatar_initials: 'PS' },
  { id: 'u2', name: 'Rahul Deshmukh', email: 'rahul@stomasense.ai', role: 'Agronomist', district: 'Pune', organization: 'STOMA SENSE Field', avatar_initials: 'RD' },
  { id: 'u3', name: 'Meera Kulkarni', email: 'meera@stomasense.ai', role: 'Mill Manager', district: 'Satara', organization: 'Satara Sugar Mills', avatar_initials: 'MK' },
  { id: 'u4', name: 'Suresh Patil', email: 'suresh@stomasense.ai', role: 'FPO Operator', district: 'Ahmednagar', organization: 'Ahmednagar FPO', avatar_initials: 'SP' },
  { id: 'u5', name: 'Anita Mane', email: 'anita@stomasense.ai', role: 'Field Officer', district: 'Solapur', organization: 'Solapur Extension Office', avatar_initials: 'AM' },
];
