import { Field, PhenologyMetrics, TemporalIndexPoint } from '@/types';

/** Generate smooth phenological curve for a field (mock Sentinel-2 seasonal trajectory) */
export function computePhenology(f: Field): PhenologyMetrics {
  const series = f.temporal_series;
  if (!series.length) {
    return {
      SOS: f.planting_date, POS: '', EOS: f.expected_harvest_date,
      AUC: 0, peak_NDRE: 0, peak_NDWI: 0,
      growth_rate: 0, senescence_rate: 0, amplitude: 0,
      green_up_days: 0, stress_days: 0, stress_persistence: 0,
    };
  }

  const ndreVals = series.map(t => t.NDRE);
  const peakNDRE = Math.max(...ndreVals);
  const peakNDWI = Math.max(...series.map(t => t.NDWI));
  const peakIdx = ndreVals.indexOf(peakNDRE);
  const peakDate = series[peakIdx]?.date ?? '';

  // AUC (trapezoidal)
  let auc = 0;
  for (let i = 1; i < series.length; i++) {
    auc += ((ndreVals[i] + ndreVals[i - 1]) / 2) * 5; // 5-day spacing
  }

  // Green-up: days from SOS to peak
  const sosDays = 0;
  const greenUpDays = Math.round(peakIdx * 5);

  // Stress days: days where NDWI < -0.15 or NDRE < 0.22
  const stressDays = series.filter(t => t.NDWI < -0.15 || t.NDRE < 0.22).length * 5;

  // Growth rate: NDRE units per day (green-up phase)
  const growthRate = greenUpDays > 0 ? peakNDRE / greenUpDays : 0;

  // Senescence: decline from peak
  const postPeak = ndreVals.slice(peakIdx);
  const senRate = postPeak.length > 1
    ? (peakNDRE - postPeak[postPeak.length - 1]) / ((postPeak.length - 1) * 5)
    : 0;

  const amplitude = peakNDRE - (ndreVals[0] ?? 0);
  const stressPersistence = stressDays / (series.length * 5);

  return {
    SOS: f.planting_date,
    POS: peakDate,
    EOS: f.expected_harvest_date,
    AUC: parseFloat(auc.toFixed(2)),
    peak_NDRE: parseFloat(peakNDRE.toFixed(3)),
    peak_NDWI: parseFloat(peakNDWI.toFixed(3)),
    growth_rate: parseFloat(growthRate.toFixed(5)),
    senescence_rate: parseFloat(senRate.toFixed(5)),
    amplitude: parseFloat(amplitude.toFixed(3)),
    green_up_days: greenUpDays,
    stress_days: stressDays,
    stress_persistence: parseFloat(stressPersistence.toFixed(3)),
  };
}

/** Generate expected phenological trajectory for comparison */
export function expectedCurve(plantingDate: string, harvestDate: string): { date: string; NDRE: number; NDWI: number; CIRE: number }[] {
  const start = new Date(plantingDate);
  const end = new Date(harvestDate);
  const totalDays = (end.getTime() - start.getTime()) / 86400000;
  const points: { date: string; NDRE: number; NDWI: number; CIRE: number }[] = [];

  for (let d = 0; d <= totalDays; d += 15) {
    const pct = d / totalDays;
    const date = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);

    // Gaussian-shaped NDRE trajectory for sugarcane
    const peakPct = 0.55; // peak at ~55% of season
    const ndre = pct < peakPct
      ? 0.12 + 0.36 * Math.sin((pct / peakPct) * (Math.PI / 2))
      : 0.48 - 0.18 * Math.pow((pct - peakPct) / (1 - peakPct), 1.5);

    const ndwi = pct < 0.15 ? -0.05 + pct * 0.4
      : pct < 0.65 ? 0.05 + 0.04 * Math.sin(pct * Math.PI)
      : 0.05 - (pct - 0.65) * 0.3;

    const cire = ndre * 6.2; // rough proportional relationship

    points.push({
      date,
      NDRE: parseFloat(Math.max(0.10, ndre).toFixed(3)),
      NDWI: parseFloat(ndwi.toFixed(3)),
      CIRE: parseFloat(Math.max(0.5, cire).toFixed(3)),
    });
  }
  return points;
}
