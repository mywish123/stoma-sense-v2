// ── Enums & Unions ─────────────────────────────────────────────────────────────
export type GrowthStage = 'Initiation' | 'Tillering' | 'Grand Growth' | 'Maturity';
export type StressLevel = 'None' | 'Low' | 'Moderate' | 'High' | 'Critical';
export type AdvisoryPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type SoilType = 'Sandy Loam' | 'Clay Loam' | 'Black Cotton' | 'Red Laterite' | 'Alluvial' | 'Vertisol';
export type NutrientLevel = 'Low' | 'Medium' | 'High';
export type AdvisoryType =
  | 'Nutrient Stress'
  | 'Water Stress'
  | 'Salinity Stress'
  | 'Growth Suppression'
  | 'Delayed Growth'
  | 'Poor Recovery'
  | 'Irrigation Misalignment'
  | 'Harvest Readiness'
  | 'Chlorophyll Decline'
  | 'Persistent Underperformance';

export type UserRole = 'Admin' | 'Agronomist' | 'Mill Manager' | 'FPO Operator' | 'Field Officer';
export type MapLayer = 'ndvi' | 'ndre' | 'ndwi' | 'nutrient' | 'water' | 'salinity' | 'growth' | 'advisory';

// ── Geometry ───────────────────────────────────────────────────────────────────
export interface LatLng { lat: number; lng: number; }
export interface FieldPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [lng, lat] pairs per GeoJSON
}

// ── Remote Sensing Indices ─────────────────────────────────────────────────────
export interface RemoteSensingIndices {
  NDVI: number;
  NDRE: number;
  GNDVI: number;
  CIRE: number;
  NDWI: number;
  SAVI: number;
  MSAVI: number;
  salinity_index: number;
  canopy_temp_proxy: number;
  // Expected for current stage
  expected_NDRE: number;
  expected_CIRE: number;
  expected_NDWI: number;
  expected_NDVI: number;
}

// ── Temporal Data Point ────────────────────────────────────────────────────────
export interface TemporalIndexPoint {
  date: string;
  NDVI: number;
  NDRE: number;
  GNDVI: number;
  CIRE: number;
  NDWI: number;
  SAVI: number;
  cloud_cover: number;
  is_interpolated: boolean;
}

// ── Phenology ─────────────────────────────────────────────────────────────────
export interface PhenologyMetrics {
  SOS: string; // start of season date
  POS: string; // peak of season date
  EOS: string; // end of season date
  AUC: number; // area under curve (total productivity proxy)
  peak_NDRE: number;
  peak_NDWI: number;
  growth_rate: number; // NDRE units / day
  senescence_rate: number;
  amplitude: number; // peak - baseline
  green_up_days: number;
  stress_days: number; // days below threshold
  stress_persistence: number; // 0-1
}

// ── ML Features ───────────────────────────────────────────────────────────────
export interface MLFeatureVector {
  field_id: string;
  // Anomaly features
  ndre_anomaly: number;
  cire_anomaly: number;
  ndwi_anomaly: number;
  ndvi_anomaly: number;
  // Temporal features
  ndre_7d_change: number;
  ndwi_7d_change: number;
  cire_7d_change: number;
  ndre_30d_auc: number;
  // Stress scores
  chlorophyll_suppression_score: number;
  water_deficit_score: number;
  salinity_suppression_score: number;
  growth_consistency_score: number;
  // Environmental
  rainfall_adequacy: number;
  cumulative_rainfall_30d: number;
  cumulative_stress_days: number;
  // Soil
  soil_n_encoded: number; // Low=0, Med=0.5, High=1
  days_since_fertilizer: number;
  // Historical
  historical_productivity_alignment: number;
  historical_stress_frequency: number;
  crop_age_days: number;
  stage_encoded: number;
}

// ── TCH Prediction ────────────────────────────────────────────────────────────
export interface TCHPrediction {
  predicted_tch: number;
  confidence_interval: [number, number];
  confidence: number;
  productivity_bucket: 'Low' | 'Below Average' | 'Average' | 'Above Average' | 'High';
  yield_gap: number; // vs historical baseline
  harvest_readiness_score: number; // 0-100
  top_features: { feature: string; impact: number; direction: 'positive' | 'negative' }[];
  explanation: string;
}

// ── Stress Scores ──────────────────────────────────────────────────────────────
export interface StressScores {
  nutrient_stress_probability: number;
  water_stress_probability: number;
  salinity_risk_probability: number;
  growth_performance_score: number;
  health_score: number;
  advisory_priority_score: number;
  advisory_priority: AdvisoryPriority;
  confidence_level: number;
  // Anomalies
  ndre_anomaly: number;
  cire_anomaly: number;
  ndwi_anomaly: number;
  rainfall_adequacy: number;
}

// ── Field ─────────────────────────────────────────────────────────────────────
export interface Field {
  field_id: string;
  farm_name: string;
  village: string;
  block: string;
  district: string;
  state: string;
  area_ha: number;
  crop_age_days: number;
  growth_stage: GrowthStage;
  cultivar: string;
  planting_date: string;
  expected_harvest_date: string;
  last_satellite_date: string;
  // Location
  centroid: LatLng;
  polygon: FieldPolygon;
  // Rainfall
  rainfall_7d_mm: number;
  rainfall_30d_mm: number;
  expected_rainfall_30d_mm: number;
  // Soil
  soil_type: SoilType;
  soil_ph: number;
  organic_carbon: number;
  nitrogen_level: NutrientLevel;
  phosphorus_level: NutrientLevel;
  potassium_level: NutrientLevel;
  // Fertilizer
  last_fertilizer_date: string;
  fertilizer_n_kg_ha: number;
  fertilizer_p_kg_ha: number;
  fertilizer_k_kg_ha: number;
  // Historical
  historical_yield_tch: number;
  historical_stress_frequency: number;
  // Current indices
  indices: RemoteSensingIndices;
  // Temporal series (mocked)
  temporal_series: TemporalIndexPoint[];
}

// ── Advisory ──────────────────────────────────────────────────────────────────
export interface Advisory {
  id: string;
  field_id: string;
  type: AdvisoryType;
  issue: string;
  evidence: string[];
  possible_causes: string[];
  confidence: number;
  severity: StressLevel;
  expected_impact: string;
  recommended_action: string;
  agronomy_notes: string;
  ground_validation_required: boolean;
  created_at: string;
  resolved: boolean;
  is_recurring: boolean;
  recurrence_count: number;
  explanation: string; // Natural language WHY
}

// ── Enriched Field (full computed) ────────────────────────────────────────────
export interface EnrichedField extends Field, StressScores {
  advisories: Advisory[];
  tch_prediction: TCHPrediction;
  phenology: PhenologyMetrics;
  ml_features: MLFeatureVector;
  recommended_action: string;
  stress_summary: string;
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  field_id: string;
  field_name: string;
  type: 'rapid_decline' | 'irrigation_deficit' | 'high_risk' | 'unresolved_stress' | 'harvest_window';
  message: string;
  severity: StressLevel;
  created_at: string;
  acknowledged: boolean;
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  district?: string;
  organization: string;
  avatar_initials: string;
}

// ── Dashboard Stats ────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_area_ha: number;
  field_count: number;
  avg_health_score: number;
  high_water_stress: number;
  high_nutrient_stress: number;
  high_salinity_risk: number;
  urgent_advisories: number;
  active_alerts: number;
  avg_tch_predicted: number;
  last_satellite_date: string;
  coverage_pct: number;
  districts_covered: number;
}
