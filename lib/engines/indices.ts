import { RemoteSensingIndices, GrowthStage } from '@/types';

// ── Index Formulas ─────────────────────────────────────────────────────────────
// In production these would be computed from Sentinel-2 band reflectances

/** NDVI = (NIR - Red) / (NIR + Red) */
export const ndvi = (nir: number, red: number) => (nir - red) / (nir + red);

/** NDRE = (NIR - RedEdge) / (NIR + RedEdge) */
export const ndre = (nir: number, re: number) => (nir - re) / (nir + re);

/** GNDVI = (NIR - Green) / (NIR + Green) */
export const gndvi = (nir: number, green: number) => (nir - green) / (nir + green);

/** CIRE = (NIR / RedEdge) - 1 */
export const cire = (nir: number, re: number) => (nir / re) - 1;

/** NDWI = (Green - NIR) / (Green + NIR) */
export const ndwi = (green: number, nir: number) => (green - nir) / (green + nir);

/** SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L), L = 0.5 */
export const savi = (nir: number, red: number, L = 0.5) =>
  ((nir - red) / (nir + red + L)) * (1 + L);

/** MSAVI = (2*NIR + 1 - sqrt((2*NIR+1)^2 - 8*(NIR-Red))) / 2 */
export const msavi = (nir: number, red: number) =>
  (2 * nir + 1 - Math.sqrt(Math.pow(2 * nir + 1, 2) - 8 * (nir - red))) / 2;

// ── Stage-Expected Trajectories ────────────────────────────────────────────────
/** Expected index values by growth stage, based on empirical sugarcane models */
export const STAGE_EXPECTED: Record<GrowthStage, Partial<RemoteSensingIndices>> = {
  Initiation: { expected_NDVI: 0.28, expected_NDRE: 0.14, expected_CIRE: 0.90, expected_NDWI: 0.02 },
  Tillering:  { expected_NDVI: 0.52, expected_NDRE: 0.30, expected_CIRE: 1.85, expected_NDWI: -0.01 },
  'Grand Growth': { expected_NDVI: 0.74, expected_NDRE: 0.45, expected_CIRE: 2.65, expected_NDWI: 0.06 },
  Maturity:   { expected_NDVI: 0.65, expected_NDRE: 0.34, expected_CIRE: 2.00, expected_NDWI: -0.06 },
};

// ── Anomaly Calculations ───────────────────────────────────────────────────────
export const anomaly = (actual: number, expected: number): number =>
  expected !== 0 ? (actual - expected) / Math.abs(expected) : 0;

export const calcNDREAnomaly = (indices: RemoteSensingIndices) =>
  anomaly(indices.NDRE, indices.expected_NDRE);

export const calcCIREAnomaly = (indices: RemoteSensingIndices) =>
  anomaly(indices.CIRE, indices.expected_CIRE);

export const calcNDWIAnomaly = (indices: RemoteSensingIndices) =>
  anomaly(indices.NDWI, indices.expected_NDWI !== 0 ? indices.expected_NDWI : 0.01);

// ── Classification ─────────────────────────────────────────────────────────────
export const classifyNDVI = (v: number, stage: GrowthStage): string => {
  if (stage === 'Grand Growth' || stage === 'Maturity') return 'Use NDRE — NDVI may saturate';
  return v >= 0.65 ? 'High' : v >= 0.45 ? 'Moderate' : 'Low';
};

export const classifyNDRE = (v: number): string =>
  v >= 0.40 ? 'Vigorous' : v >= 0.28 ? 'Adequate' : v >= 0.18 ? 'Below Target' : 'Critical Low';

export const classifyNDWI = (v: number): string =>
  v >= 0.05 ? 'Well Watered' : v >= -0.10 ? 'Moderate' : v >= -0.20 ? 'Deficit' : 'Severe Deficit';

export const classifyCIRE = (v: number, stage: GrowthStage): string => {
  const exp = STAGE_EXPECTED[stage]?.expected_CIRE ?? 2.0;
  const ratio = v / exp;
  return ratio >= 0.92 ? 'Adequate' : ratio >= 0.78 ? 'Mild Reduction' : ratio >= 0.60 ? 'Deficient' : 'Severely Deficient';
};

// ── Utility ───────────────────────────────────────────────────────────────────
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const normalize = (v: number, min: number, max: number) => clamp((v - min) / (max - min), 0, 1);

export const INDEX_META = {
  NDVI:  { label: 'NDVI',  name: 'Normalized Difference Vegetation Index', range: '-1 to 1', unit: '', color: '#4ade80', desc: 'General vegetation vigor. Saturates in dense canopy — prefer NDRE for Grand Growth+.' },
  NDRE:  { label: 'NDRE',  name: 'Normalized Difference Red Edge Index',   range: '0 to 0.6', unit: '', color: '#34d399', desc: 'Chlorophyll and biomass in dense canopy. Primary index for Grand Growth & Maturity.' },
  GNDVI: { label: 'GNDVI', name: 'Green Normalized Difference Vegetation Index', range: '0 to 0.75', unit: '', color: '#6ee7b7', desc: 'Chlorophyll and nitrogen-related vigor. Useful from Tillering onward.' },
  CIRE:  { label: 'CIRE',  name: 'Chlorophyll Index Red Edge',             range: '0 to 5', unit: '', color: '#a3e635', desc: 'Primary chlorophyll/nutrient stress indicator. Interpret with NDWI to separate water vs nutrient stress.' },
  NDWI:  { label: 'NDWI',  name: 'Normalized Difference Water Index',      range: '-1 to 1', unit: '', color: '#38bdf8', desc: 'Crop water content and moisture stress. Negative = water deficit.' },
  SAVI:  { label: 'SAVI',  name: 'Soil-Adjusted Vegetation Index',         range: '-1 to 1', unit: '', color: '#fb923c', desc: 'Accounts for soil background. Best for Initiation and early Tillering.' },
  MSAVI: { label: 'MSAVI', name: 'Modified Soil-Adjusted Vegetation Index', range: '-1 to 1', unit: '', color: '#fbbf24', desc: 'Improved SAVI with dynamic L factor. Better for very sparse canopy.' },
};
