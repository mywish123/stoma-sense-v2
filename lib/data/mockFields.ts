import { Field, TemporalIndexPoint, FieldPolygon } from '@/types';

// Generate temporal series for a field (mock 5-day Sentinel-2 revisits)
function genSeries(
  plantDate: string,
  peakNDRE: number,
  stressStart: number, // day when stress begins (0 = no stress)
  stressMag: number,   // magnitude of stress dip
  daysActive: number
): TemporalIndexPoint[] {
  const start = new Date(plantDate);
  const points: TemporalIndexPoint[] = [];

  for (let d = 5; d <= daysActive; d += 5) {
    const pct = d / 365;
    const peakPct = 0.55;
    const baseNDRE = pct < peakPct
      ? 0.12 + peakNDRE * Math.sin((pct / peakPct) * (Math.PI / 2))
      : peakNDRE - 0.18 * Math.pow((pct - peakPct) / Math.max(1 - peakPct, 0.01), 1.5);

    // Apply stress dip
    const inStress = stressStart > 0 && d >= stressStart && d <= stressStart + 60;
    const stressDip = inStress ? stressMag * Math.sin(((d - stressStart) / 60) * Math.PI) : 0;

    const ndre = Math.max(0.08, baseNDRE - stressDip);
    const ndvi = Math.min(0.92, ndre * 1.65 + 0.08);
    const gndvi = ndre * 1.35 + 0.05;
    const cire = Math.max(0.4, ndre * 6.5 - stressDip * 4);
    const ndwi = inStress
      ? -0.12 - stressDip * 0.8
      : pct < 0.15 ? -0.04 + pct * 0.4
      : 0.04 + 0.03 * Math.sin(pct * Math.PI) - (pct > 0.7 ? (pct - 0.7) * 0.3 : 0);
    const savi = ndvi * 0.82;

    const date = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);
    points.push({
      date,
      NDVI: parseFloat(Math.min(0.92, ndvi).toFixed(3)),
      NDRE: parseFloat(ndre.toFixed(3)),
      GNDVI: parseFloat(Math.min(0.75, gndvi).toFixed(3)),
      CIRE: parseFloat(cire.toFixed(3)),
      NDWI: parseFloat(ndwi.toFixed(3)),
      SAVI: parseFloat(savi.toFixed(3)),
      cloud_cover: Math.random() < 0.1 ? Math.round(Math.random() * 40 + 10) : 0,
      is_interpolated: Math.random() < 0.08,
    });
  }
  return points;
}

// Create polygon offset from centroid (mock GeoJSON polygon)
function makePolygon(lat: number, lng: number, sizeHa: number): FieldPolygon {
  const d = Math.sqrt(sizeHa) * 0.003; // approximate degree offset
  const r = Math.random() * 0.0005;
  return {
    type: 'Polygon',
    coordinates: [[
      [lng - d + r, lat - d + r],
      [lng + d + r, lat - d - r],
      [lng + d - r, lat + d - r],
      [lng - d - r, lat + d + r],
      [lng - d + r, lat - d + r],
    ]],
  };
}

export const mockFields: Field[] = [
  // ── SS-001: Grand Growth, high water stress ─────────────────────────────────
  {
    field_id: 'SS-001', farm_name: 'Patil Agro Ventures', village: 'Manjari', block: 'Haveli', district: 'Pune', state: 'Maharashtra',
    area_ha: 4.2, crop_age_days: 185, growth_stage: 'Grand Growth', cultivar: 'Co 86032',
    planting_date: '2024-11-10', expected_harvest_date: '2025-11-10', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 6, rainfall_30d_mm: 38, expected_rainfall_30d_mm: 90,
    soil_type: 'Black Cotton', soil_ph: 7.8, organic_carbon: 0.52,
    nitrogen_level: 'Low', phosphorus_level: 'Medium', potassium_level: 'Medium',
    last_fertilizer_date: '2025-02-10', fertilizer_n_kg_ha: 80, fertilizer_p_kg_ha: 40, fertilizer_k_kg_ha: 60,
    historical_yield_tch: 68, historical_stress_frequency: 0.58,
    centroid: { lat: 18.5204, lng: 73.9001 }, polygon: makePolygon(18.5204, 73.9001, 4.2),
    indices: { NDVI: 0.60, NDRE: 0.29, GNDVI: 0.46, CIRE: 1.82, NDWI: -0.24, SAVI: 0.52, MSAVI: 0.50, salinity_index: 0.12, canopy_temp_proxy: 3.8, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-11-10', 0.42, 150, 0.14, 185),
  },
  // ── SS-002: Grand Growth, healthy ──────────────────────────────────────────
  {
    field_id: 'SS-002', farm_name: 'Deshmukh Premium Fields', village: 'Khed', block: 'Khed', district: 'Pune', state: 'Maharashtra',
    area_ha: 6.8, crop_age_days: 220, growth_stage: 'Grand Growth', cultivar: 'CoM 0265',
    planting_date: '2024-10-05', expected_harvest_date: '2025-10-05', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 22, rainfall_30d_mm: 88, expected_rainfall_30d_mm: 90,
    soil_type: 'Alluvial', soil_ph: 7.1, organic_carbon: 0.78,
    nitrogen_level: 'High', phosphorus_level: 'High', potassium_level: 'High',
    last_fertilizer_date: '2025-04-02', fertilizer_n_kg_ha: 120, fertilizer_p_kg_ha: 60, fertilizer_k_kg_ha: 80,
    historical_yield_tch: 87, historical_stress_frequency: 0.18,
    centroid: { lat: 18.5520, lng: 73.9980 }, polygon: makePolygon(18.5520, 73.9980, 6.8),
    indices: { NDVI: 0.79, NDRE: 0.47, GNDVI: 0.63, CIRE: 2.74, NDWI: 0.09, SAVI: 0.73, MSAVI: 0.71, salinity_index: 0.05, canopy_temp_proxy: 0.6, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-10-05', 0.50, 0, 0, 220),
  },
  // ── SS-003: Tillering, nutrient stress ─────────────────────────────────────
  {
    field_id: 'SS-003', farm_name: 'Shinde Family Farms', village: 'Talegaon', block: 'Maval', district: 'Pune', state: 'Maharashtra',
    area_ha: 3.5, crop_age_days: 95, growth_stage: 'Tillering', cultivar: 'Co 0238',
    planting_date: '2025-02-05', expected_harvest_date: '2026-02-05', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 12, rainfall_30d_mm: 55, expected_rainfall_30d_mm: 65,
    soil_type: 'Red Laterite', soil_ph: 6.4, organic_carbon: 0.45,
    nitrogen_level: 'Low', phosphorus_level: 'Low', potassium_level: 'Medium',
    last_fertilizer_date: '2025-03-15', fertilizer_n_kg_ha: 50, fertilizer_p_kg_ha: 25, fertilizer_k_kg_ha: 40,
    historical_yield_tch: 72, historical_stress_frequency: 0.40,
    centroid: { lat: 18.7290, lng: 73.6820 }, polygon: makePolygon(18.7290, 73.6820, 3.5),
    indices: { NDVI: 0.43, NDRE: 0.20, GNDVI: 0.36, CIRE: 1.48, NDWI: -0.05, SAVI: 0.40, MSAVI: 0.38, salinity_index: 0.07, canopy_temp_proxy: 1.2, expected_NDRE: 0.30, expected_CIRE: 1.85, expected_NDWI: -0.01, expected_NDVI: 0.52 },
    temporal_series: genSeries('2025-02-05', 0.35, 60, 0.08, 95),
  },
  // ── SS-004: Maturity, healthy ───────────────────────────────────────────────
  {
    field_id: 'SS-004', farm_name: 'Kulkarni Trust Farms', village: 'Baramati', block: 'Baramati', district: 'Pune', state: 'Maharashtra',
    area_ha: 8.1, crop_age_days: 310, growth_stage: 'Maturity', cultivar: 'Co 86032',
    planting_date: '2024-07-15', expected_harvest_date: '2025-07-15', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 10, rainfall_30d_mm: 50, expected_rainfall_30d_mm: 65,
    soil_type: 'Black Cotton', soil_ph: 7.5, organic_carbon: 0.60,
    nitrogen_level: 'Medium', phosphorus_level: 'Medium', potassium_level: 'High',
    last_fertilizer_date: '2025-01-20', fertilizer_n_kg_ha: 100, fertilizer_p_kg_ha: 50, fertilizer_k_kg_ha: 90,
    historical_yield_tch: 90, historical_stress_frequency: 0.14,
    centroid: { lat: 18.1520, lng: 74.5760 }, polygon: makePolygon(18.1520, 74.5760, 8.1),
    indices: { NDVI: 0.70, NDRE: 0.36, GNDVI: 0.56, CIRE: 2.22, NDWI: -0.02, SAVI: 0.64, MSAVI: 0.62, salinity_index: 0.08, canopy_temp_proxy: 1.1, expected_NDRE: 0.34, expected_CIRE: 2.00, expected_NDWI: -0.06, expected_NDVI: 0.65 },
    temporal_series: genSeries('2024-07-15', 0.52, 0, 0, 310),
  },
  // ── SS-005: Grand Growth, severe water + nutrient combined stress ────────────
  {
    field_id: 'SS-005', farm_name: 'Jadhav Agri Group', village: 'Indapur', block: 'Indapur', district: 'Pune', state: 'Maharashtra',
    area_ha: 5.4, crop_age_days: 160, growth_stage: 'Grand Growth', cultivar: 'CoM 0265',
    planting_date: '2024-12-05', expected_harvest_date: '2025-12-05', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 2, rainfall_30d_mm: 16, expected_rainfall_30d_mm: 80,
    soil_type: 'Sandy Loam', soil_ph: 6.8, organic_carbon: 0.38,
    nitrogen_level: 'Low', phosphorus_level: 'Low', potassium_level: 'Low',
    last_fertilizer_date: '2025-01-05', fertilizer_n_kg_ha: 60, fertilizer_p_kg_ha: 30, fertilizer_k_kg_ha: 40,
    historical_yield_tch: 62, historical_stress_frequency: 0.68,
    centroid: { lat: 18.1120, lng: 75.0220 }, polygon: makePolygon(18.1120, 75.0220, 5.4),
    indices: { NDVI: 0.48, NDRE: 0.22, GNDVI: 0.38, CIRE: 1.58, NDWI: -0.32, SAVI: 0.44, MSAVI: 0.42, salinity_index: 0.13, canopy_temp_proxy: 5.2, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-12-05', 0.38, 120, 0.18, 160),
  },
  // ── SS-006: Initiation, healthy ─────────────────────────────────────────────
  {
    field_id: 'SS-006', farm_name: 'Bhosale Precision Agro', village: 'Shirur', block: 'Shirur', district: 'Pune', state: 'Maharashtra',
    area_ha: 2.8, crop_age_days: 30, growth_stage: 'Initiation', cultivar: 'Co 0238',
    planting_date: '2025-04-14', expected_harvest_date: '2026-04-14', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 18, rainfall_30d_mm: 65, expected_rainfall_30d_mm: 55,
    soil_type: 'Clay Loam', soil_ph: 7.2, organic_carbon: 0.70,
    nitrogen_level: 'Medium', phosphorus_level: 'High', potassium_level: 'Medium',
    last_fertilizer_date: '2025-04-20', fertilizer_n_kg_ha: 40, fertilizer_p_kg_ha: 30, fertilizer_k_kg_ha: 30,
    historical_yield_tch: 78, historical_stress_frequency: 0.22,
    centroid: { lat: 18.8310, lng: 74.3650 }, polygon: makePolygon(18.8310, 74.3650, 2.8),
    indices: { NDVI: 0.30, NDRE: 0.15, GNDVI: 0.24, CIRE: 0.98, NDWI: 0.05, SAVI: 0.30, MSAVI: 0.28, salinity_index: 0.04, canopy_temp_proxy: 0.4, expected_NDRE: 0.14, expected_CIRE: 0.90, expected_NDWI: 0.02, expected_NDVI: 0.28 },
    temporal_series: genSeries('2025-04-14', 0.48, 0, 0, 30),
  },
  // ── SS-007: Grand Growth, salinity + water ───────────────────────────────────
  {
    field_id: 'SS-007', farm_name: 'Lokhande Cane Estate', village: 'Daund', block: 'Daund', district: 'Pune', state: 'Maharashtra',
    area_ha: 7.2, crop_age_days: 195, growth_stage: 'Grand Growth', cultivar: 'CoC 671',
    planting_date: '2024-10-30', expected_harvest_date: '2025-10-30', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 4, rainfall_30d_mm: 28, expected_rainfall_30d_mm: 90,
    soil_type: 'Black Cotton', soil_ph: 8.2, organic_carbon: 0.42,
    nitrogen_level: 'Low', phosphorus_level: 'Medium', potassium_level: 'Low',
    last_fertilizer_date: '2025-01-15', fertilizer_n_kg_ha: 70, fertilizer_p_kg_ha: 35, fertilizer_k_kg_ha: 50,
    historical_yield_tch: 65, historical_stress_frequency: 0.60,
    centroid: { lat: 18.4610, lng: 74.5830 }, polygon: makePolygon(18.4610, 74.5830, 7.2),
    indices: { NDVI: 0.52, NDRE: 0.24, GNDVI: 0.41, CIRE: 1.42, NDWI: -0.35, SAVI: 0.48, MSAVI: 0.46, salinity_index: 0.24, canopy_temp_proxy: 5.8, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-10-30', 0.40, 140, 0.20, 195),
  },
  // ── SS-008: Tillering, healthy ──────────────────────────────────────────────
  {
    field_id: 'SS-008', farm_name: 'Gavhane Green Farms', village: 'Ambegaon', block: 'Ambegaon', district: 'Pune', state: 'Maharashtra',
    area_ha: 4.5, crop_age_days: 75, growth_stage: 'Tillering', cultivar: 'Co 86032',
    planting_date: '2025-02-28', expected_harvest_date: '2026-02-28', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 30, rainfall_30d_mm: 95, expected_rainfall_30d_mm: 80,
    soil_type: 'Alluvial', soil_ph: 6.9, organic_carbon: 0.85,
    nitrogen_level: 'High', phosphorus_level: 'High', potassium_level: 'High',
    last_fertilizer_date: '2025-04-10', fertilizer_n_kg_ha: 90, fertilizer_p_kg_ha: 55, fertilizer_k_kg_ha: 70,
    historical_yield_tch: 88, historical_stress_frequency: 0.16,
    centroid: { lat: 19.0640, lng: 73.7100 }, polygon: makePolygon(19.0640, 73.7100, 4.5),
    indices: { NDVI: 0.60, NDRE: 0.32, GNDVI: 0.48, CIRE: 2.08, NDWI: 0.07, SAVI: 0.56, MSAVI: 0.54, salinity_index: 0.04, canopy_temp_proxy: 0.2, expected_NDRE: 0.30, expected_CIRE: 1.85, expected_NDWI: -0.01, expected_NDVI: 0.52 },
    temporal_series: genSeries('2025-02-28', 0.50, 0, 0, 75),
  },
  // ── SS-009: Grand Growth, severe multi-stress ────────────────────────────────
  {
    field_id: 'SS-009', farm_name: 'Mane Sugar Cooperative', village: 'Phaltan', block: 'Phaltan', district: 'Satara', state: 'Maharashtra',
    area_ha: 9.3, crop_age_days: 240, growth_stage: 'Grand Growth', cultivar: 'CoM 0265',
    planting_date: '2024-09-17', expected_harvest_date: '2025-09-17', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 5, rainfall_30d_mm: 32, expected_rainfall_30d_mm: 85,
    soil_type: 'Black Cotton', soil_ph: 8.0, organic_carbon: 0.48,
    nitrogen_level: 'Low', phosphorus_level: 'Low', potassium_level: 'Medium',
    last_fertilizer_date: '2024-12-10', fertilizer_n_kg_ha: 65, fertilizer_p_kg_ha: 32, fertilizer_k_kg_ha: 55,
    historical_yield_tch: 60, historical_stress_frequency: 0.74,
    centroid: { lat: 17.9870, lng: 74.4360 }, polygon: makePolygon(17.9870, 74.4360, 9.3),
    indices: { NDVI: 0.46, NDRE: 0.20, GNDVI: 0.36, CIRE: 1.38, NDWI: -0.38, SAVI: 0.42, MSAVI: 0.40, salinity_index: 0.30, canopy_temp_proxy: 6.4, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-09-17', 0.38, 160, 0.22, 240),
  },
  // ── SS-010: Kopargaon, Grand Growth, moderate stress ────────────────────────
  {
    field_id: 'SS-010', farm_name: 'Thorat Precision Farms', village: 'Kopargaon', block: 'Kopargaon', district: 'Ahmednagar', state: 'Maharashtra',
    area_ha: 5.6, crop_age_days: 130, growth_stage: 'Grand Growth', cultivar: 'CoC 671',
    planting_date: '2025-01-04', expected_harvest_date: '2026-01-04', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 14, rainfall_30d_mm: 68, expected_rainfall_30d_mm: 80,
    soil_type: 'Alluvial', soil_ph: 7.0, organic_carbon: 0.72,
    nitrogen_level: 'Medium', phosphorus_level: 'Medium', potassium_level: 'High',
    last_fertilizer_date: '2025-03-20', fertilizer_n_kg_ha: 100, fertilizer_p_kg_ha: 50, fertilizer_k_kg_ha: 75,
    historical_yield_tch: 80, historical_stress_frequency: 0.28,
    centroid: { lat: 19.9060, lng: 74.4740 }, polygon: makePolygon(19.9060, 74.4740, 5.6),
    indices: { NDVI: 0.72, NDRE: 0.41, GNDVI: 0.57, CIRE: 2.48, NDWI: 0.04, SAVI: 0.66, MSAVI: 0.64, salinity_index: 0.06, canopy_temp_proxy: 0.8, expected_NDRE: 0.42, expected_CIRE: 2.50, expected_NDWI: 0.04, expected_NDVI: 0.70 },
    temporal_series: genSeries('2025-01-04', 0.48, 90, 0.05, 130),
  },
  // ── SS-011: Grand Growth, moderate nutrient stress ──────────────────────────
  {
    field_id: 'SS-011', farm_name: 'Salve Agro Intelligence', village: 'Rahuri', block: 'Rahuri', district: 'Ahmednagar', state: 'Maharashtra',
    area_ha: 3.9, crop_age_days: 175, growth_stage: 'Grand Growth', cultivar: 'Co 86032',
    planting_date: '2024-11-20', expected_harvest_date: '2025-11-20', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 10, rainfall_30d_mm: 52, expected_rainfall_30d_mm: 85,
    soil_type: 'Sandy Loam', soil_ph: 6.6, organic_carbon: 0.40,
    nitrogen_level: 'Low', phosphorus_level: 'Medium', potassium_level: 'Medium',
    last_fertilizer_date: '2025-02-28', fertilizer_n_kg_ha: 75, fertilizer_p_kg_ha: 38, fertilizer_k_kg_ha: 55,
    historical_yield_tch: 70, historical_stress_frequency: 0.48,
    centroid: { lat: 19.3900, lng: 74.6490 }, polygon: makePolygon(19.3900, 74.6490, 3.9),
    indices: { NDVI: 0.56, NDRE: 0.26, GNDVI: 0.42, CIRE: 1.72, NDWI: -0.20, SAVI: 0.50, MSAVI: 0.48, salinity_index: 0.15, canopy_temp_proxy: 3.5, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-11-20', 0.40, 135, 0.12, 175),
  },
  // ── SS-012: Maturity, moderate water stress ──────────────────────────────────
  {
    field_id: 'SS-012', farm_name: 'Nimkar Cane Collective', village: 'Newasa', block: 'Newasa', district: 'Ahmednagar', state: 'Maharashtra',
    area_ha: 6.1, crop_age_days: 285, growth_stage: 'Maturity', cultivar: 'CoM 0265',
    planting_date: '2024-08-04', expected_harvest_date: '2025-08-04', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 7, rainfall_30d_mm: 42, expected_rainfall_30d_mm: 62,
    soil_type: 'Clay Loam', soil_ph: 7.7, organic_carbon: 0.65,
    nitrogen_level: 'Medium', phosphorus_level: 'High', potassium_level: 'High',
    last_fertilizer_date: '2025-02-01', fertilizer_n_kg_ha: 85, fertilizer_p_kg_ha: 45, fertilizer_k_kg_ha: 80,
    historical_yield_tch: 84, historical_stress_frequency: 0.20,
    centroid: { lat: 19.5580, lng: 74.9940 }, polygon: makePolygon(19.5580, 74.9940, 6.1),
    indices: { NDVI: 0.65, NDRE: 0.33, GNDVI: 0.50, CIRE: 2.08, NDWI: -0.08, SAVI: 0.59, MSAVI: 0.57, salinity_index: 0.10, canopy_temp_proxy: 2.0, expected_NDRE: 0.34, expected_CIRE: 2.00, expected_NDWI: -0.06, expected_NDVI: 0.65 },
    temporal_series: genSeries('2024-08-04', 0.50, 240, 0.08, 285),
  },
  // ── SS-013: Solapur - Grand Growth critical ──────────────────────────────────
  {
    field_id: 'SS-013', farm_name: 'Chavan Agricultural Trust', village: 'Akkalkot', block: 'Akkalkot', district: 'Solapur', state: 'Maharashtra',
    area_ha: 10.4, crop_age_days: 205, growth_stage: 'Grand Growth', cultivar: 'Co 86032',
    planting_date: '2024-10-20', expected_harvest_date: '2025-10-20', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 1, rainfall_30d_mm: 12, expected_rainfall_30d_mm: 88,
    soil_type: 'Vertisol', soil_ph: 8.3, organic_carbon: 0.35,
    nitrogen_level: 'Low', phosphorus_level: 'Low', potassium_level: 'Low',
    last_fertilizer_date: '2025-01-05', fertilizer_n_kg_ha: 55, fertilizer_p_kg_ha: 28, fertilizer_k_kg_ha: 45,
    historical_yield_tch: 58, historical_stress_frequency: 0.78,
    centroid: { lat: 17.5245, lng: 76.1945 }, polygon: makePolygon(17.5245, 76.1945, 10.4),
    indices: { NDVI: 0.44, NDRE: 0.18, GNDVI: 0.34, CIRE: 1.28, NDWI: -0.42, SAVI: 0.40, MSAVI: 0.38, salinity_index: 0.35, canopy_temp_proxy: 7.1, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-10-20', 0.35, 140, 0.24, 205),
  },
  // ── SS-014: Solapur - Tillering, healthy ────────────────────────────────────
  {
    field_id: 'SS-014', farm_name: 'Mhaske Farmer Group', village: 'Pandharpur', block: 'Pandharpur', district: 'Solapur', state: 'Maharashtra',
    area_ha: 4.8, crop_age_days: 88, growth_stage: 'Tillering', cultivar: 'CoC 671',
    planting_date: '2025-02-15', expected_harvest_date: '2026-02-15', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 20, rainfall_30d_mm: 78, expected_rainfall_30d_mm: 72,
    soil_type: 'Black Cotton', soil_ph: 7.4, organic_carbon: 0.62,
    nitrogen_level: 'High', phosphorus_level: 'Medium', potassium_level: 'High',
    last_fertilizer_date: '2025-04-05', fertilizer_n_kg_ha: 85, fertilizer_p_kg_ha: 42, fertilizer_k_kg_ha: 68,
    historical_yield_tch: 82, historical_stress_frequency: 0.24,
    centroid: { lat: 17.6805, lng: 75.3210 }, polygon: makePolygon(17.6805, 75.3210, 4.8),
    indices: { NDVI: 0.55, NDRE: 0.28, GNDVI: 0.44, CIRE: 1.90, NDWI: 0.04, SAVI: 0.52, MSAVI: 0.50, salinity_index: 0.06, canopy_temp_proxy: 0.5, expected_NDRE: 0.30, expected_CIRE: 1.85, expected_NDWI: -0.01, expected_NDVI: 0.52 },
    temporal_series: genSeries('2025-02-15', 0.48, 0, 0, 88),
  },
  // ── SS-015: Kolhapur - Grand Growth, excellent ──────────────────────────────
  {
    field_id: 'SS-015', farm_name: 'Patil Sugar Estates', village: 'Jaysingpur', block: 'Shirol', district: 'Kolhapur', state: 'Maharashtra',
    area_ha: 7.6, crop_age_days: 198, growth_stage: 'Grand Growth', cultivar: 'Co 86032',
    planting_date: '2024-11-01', expected_harvest_date: '2025-11-01', last_satellite_date: '2025-05-14',
    rainfall_7d_mm: 28, rainfall_30d_mm: 105, expected_rainfall_30d_mm: 95,
    soil_type: 'Alluvial', soil_ph: 6.8, organic_carbon: 0.92,
    nitrogen_level: 'High', phosphorus_level: 'High', potassium_level: 'High',
    last_fertilizer_date: '2025-04-15', fertilizer_n_kg_ha: 135, fertilizer_p_kg_ha: 65, fertilizer_k_kg_ha: 92,
    historical_yield_tch: 96, historical_stress_frequency: 0.12,
    centroid: { lat: 16.7880, lng: 74.5560 }, polygon: makePolygon(16.7880, 74.5560, 7.6),
    indices: { NDVI: 0.84, NDRE: 0.52, GNDVI: 0.68, CIRE: 2.98, NDWI: 0.14, SAVI: 0.78, MSAVI: 0.76, salinity_index: 0.03, canopy_temp_proxy: 0.3, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06, expected_NDVI: 0.74 },
    temporal_series: genSeries('2024-11-01', 0.58, 0, 0, 198),
  },
];

export default mockFields;
