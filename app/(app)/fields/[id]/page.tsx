import { getEnrichedField } from '@/lib/data/dataService';
import { notFound } from 'next/navigation';
import { IndexCell, AdvisoryCard, ProbBar, HealthScore, SeverityBadge, PriorityBadge, ConfidencePill } from '@/components/ui';
import FieldCharts from './FieldCharts';
import Link from 'next/link';

export default function FieldDetailPage({ params }: { params: { id: string } }) {
  const f = getEnrichedField(params.id);
  if (!f) notFound();

  const dsf = Math.floor((Date.now() - new Date(f.last_fertilizer_date).getTime()) / 86400000);
  const rfPct = Math.round(f.rainfall_adequacy * 100);

  const tchColor = f.tch_prediction.yield_gap >= 0 ? '#4ade80' : '#f87171';

  return (
    <div className="animate-fade-up max-w-screen-xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs" style={{ color: '#3d5a6a' }}>
        <Link href="/fields" className="hover:text-green-400">Fields</Link>
        <span>/</span>
        <span style={{ color: '#4ade80' }}>{f.field_id}</span>
        <span>/</span>
        <span style={{ color: '#5a7a8a' }}>{f.farm_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>{f.farm_name}</h1>
            <PriorityBadge priority={f.advisory_priority} />
            {f.advisories.some(a => a.is_recurring) && (
              <span className="text-xs px-2 py-0.5 rounded font-bold"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                ↻ Recurring Stress
              </span>
            )}
          </div>
          <p className="text-sm mb-1" style={{ color: '#5a7a8a' }}>
            {f.field_id} · {f.village}, {f.block}, {f.district} · {f.area_ha} ha · {f.cultivar}
          </p>
          <p className="text-xs" style={{ color: '#3d5a6a' }}>
            Planted: {f.planting_date} · Expected harvest: {f.expected_harvest_date} · Age: {f.crop_age_days} days · Stage: {f.growth_stage}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#3d5a6a' }}>Health Score</p>
            <HealthScore score={f.health_score} size={60} />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#3d5a6a' }}>Predicted TCH</p>
            <p className="text-3xl font-black mono" style={{ color: tchColor }}>{f.tch_prediction.predicted_tch}</p>
            <p className="text-xs" style={{ color: tchColor }}>
              {f.tch_prediction.yield_gap >= 0 ? '+' : ''}{f.tch_prediction.yield_gap} vs baseline
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main column */}
        <div className="col-span-2 space-y-6">
          {/* Index values */}
          <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>
              Current Index Values vs Stage Expectation ({f.growth_stage})
            </p>
            <div className="grid grid-cols-3 gap-3">
              <IndexCell label="NDRE" value={f.indices.NDRE} expected={f.indices.expected_NDRE} desc="Canopy chlorophyll / biomass" />
              <IndexCell label="CIRE" value={f.indices.CIRE} expected={f.indices.expected_CIRE} desc="Chlorophyll / nutrient stress" />
              <IndexCell label="NDWI" value={f.indices.NDWI} expected={f.indices.expected_NDWI} desc="Crop water / moisture" />
              <IndexCell label="NDVI" value={f.indices.NDVI} expected={f.indices.expected_NDVI} desc="General vegetation vigor" />
              <IndexCell label="GNDVI" value={f.indices.GNDVI} desc="Chlorophyll / N vigor" />
              <IndexCell label="SAVI" value={f.indices.SAVI} desc="Soil-adjusted vegetation" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <IndexCell label="MSAVI" value={f.indices.MSAVI} desc="Modified soil-adjusted" />
              <IndexCell label="Salinity Index" value={f.indices.salinity_index} desc="Salinity risk proxy" />
              <IndexCell label="Canopy Temp Proxy" value={f.indices.canopy_temp_proxy} desc="°C above ambient (CWSI)" />
            </div>
          </div>

          {/* Temporal charts */}
          <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>
              Seasonal Vegetation Trajectory
            </p>
            <FieldCharts field={f} />
          </div>

          {/* Advisories */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>
              Generated Advisories ({f.advisories.length})
            </p>
            {f.advisories.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold" style={{ color: '#4ade80' }}>No active advisories</p>
                <p className="text-sm mt-1" style={{ color: '#5a7a8a' }}>All indices within acceptable stage range.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {f.advisories.map(a => <AdvisoryCard key={a.id} adv={a} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Stress probabilities */}
          <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>Stress Probabilities</p>
            <div className="space-y-4">
              <ProbBar value={f.water_stress_probability} label="💧 Water Stress" />
              <ProbBar value={f.nutrient_stress_probability} label="🌿 Nutrient Stress" />
              <ProbBar value={f.salinity_risk_probability} label="⚗️ Salinity Risk" />
            </div>
            <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid #1e2d38' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: '#5a7a8a' }}>Confidence Level</span>
                <ConfidencePill value={f.confidence_level} />
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: '#5a7a8a' }}>Growth Score</span>
                <span className="mono font-bold" style={{ color: '#e2eaf0' }}>{f.growth_performance_score}/100</span>
              </div>
            </div>
          </div>

          {/* TCH Prediction */}
          <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>Yield Intelligence (ML)</p>
            <div className="text-center mb-4">
              <p className="text-3xl font-black mono mb-1" style={{ color: tchColor }}>{f.tch_prediction.predicted_tch} TCH</p>
              <p className="text-xs" style={{ color: '#5a7a8a' }}>
                [{f.tch_prediction.confidence_interval[0]} – {f.tch_prediction.confidence_interval[1]}] 90% CI
              </p>
              <div className="mt-2">
                <span className="text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                  {f.tch_prediction.productivity_bucket}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: '#3d5a6a' }}>Top SHAP Features</p>
              {f.tch_prediction.top_features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#5a7a8a' }}>{feat.feature}</span>
                      <span style={{ color: feat.direction === 'positive' ? '#4ade80' : '#f87171' }}>
                        {feat.direction === 'positive' ? '+' : '-'}{feat.impact.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-1 rounded-full" style={{ background: '#1e2d38' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min((feat.impact / 25) * 100, 100)}%`,
                        background: feat.direction === 'positive' ? '#4ade80' : '#f87171',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed mt-3" style={{ color: '#5a7a8a' }}>{f.tch_prediction.explanation}</p>
          </div>

          {/* Rainfall */}
          <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>Rainfall Status</p>
            <div className="space-y-2 text-xs">
              {[
                ['7-day rainfall', `${f.rainfall_7d_mm} mm`],
                ['30-day rainfall', `${f.rainfall_30d_mm} mm`],
                ['30-day expected', `${f.expected_rainfall_30d_mm} mm`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span style={{ color: '#5a7a8a' }}>{k}</span>
                  <span className="mono font-bold" style={{ color: '#e2eaf0' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <ProbBar value={rfPct / 100} label={`Rainfall Adequacy`} />
            </div>
          </div>

          {/* Soil */}
          <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>Soil & Fertilizer</p>
            <div className="space-y-2 text-xs">
              {[
                ['Soil Type', f.soil_type],
                ['pH', String(f.soil_ph)],
                ['Organic Carbon', `${f.organic_carbon}%`],
                ['Last Fertilizer', `${f.last_fertilizer_date} (${dsf}d ago)`],
                ['N Applied', `${f.fertilizer_n_kg_ha} kg/ha`],
                ['P Applied', `${f.fertilizer_p_kg_ha} kg/ha`],
                ['K Applied', `${f.fertilizer_k_kg_ha} kg/ha`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span style={{ color: '#5a7a8a' }}>{k}</span>
                  <span className="mono text-right" style={{ color: '#e2eaf0' }}>{v}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span style={{ color: '#5a7a8a' }}>Nitrogen</span>
                <SeverityBadge level={f.nitrogen_level === 'Low' ? 'High' : f.nitrogen_level === 'Medium' ? 'Moderate' : 'Low'} />
              </div>
            </div>
          </div>

          {/* Phenology */}
          <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>Phenology Metrics</p>
            <div className="space-y-2 text-xs">
              {[
                ['SOS', f.phenology.SOS],
                ['Peak NDRE', f.phenology.peak_NDRE.toFixed(3)],
                ['AUC', f.phenology.AUC.toFixed(1)],
                ['Green-up days', `${f.phenology.green_up_days}d`],
                ['Stress days', `${f.phenology.stress_days}d`],
                ['Stress persistence', `${(f.phenology.stress_persistence * 100).toFixed(0)}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span style={{ color: '#5a7a8a' }}>{k}</span>
                  <span className="mono font-bold" style={{ color: '#e2eaf0' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
