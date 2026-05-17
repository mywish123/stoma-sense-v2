import { getEnrichedField } from '@/lib/data/dataService';
import { notFound } from 'next/navigation';
import { IndexCell, AdvisoryCard, ProbBar, HealthScore, SeverityBadge, PriorityBadge, ConfidencePill, PageHeader } from '@/components/ui';
import FieldCharts from './FieldCharts';
import Link from 'next/link';

export default function FieldDetailPage({ params }: { params: { id: string } }) {
  const f = getEnrichedField(params.id);
  if (!f) notFound();

  const dsf = Math.floor((Date.now() - new Date(f.last_fertilizer_date).getTime()) / 86400000);
  const rfPct = Math.round(f.rainfall_adequacy * 100);
  const tchColor = f.tch_prediction.yield_gap >= 0 ? '#4ade80' : '#f87171';

  return (
    <div style={{ maxWidth:1300 }}>
      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, fontSize:12, color:'#384e5c' }}>
        <Link href="/fields" style={{ color:'#6b8fa0', textDecoration:'none' }}>Fields</Link>
        <span>/</span>
        <span style={{ color:'#4ade80', fontFamily:'monospace', fontWeight:700 }}>{f.field_id}</span>
        <span>/</span>
        <span style={{ color:'#6b8fa0' }}>{f.farm_name}</span>
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20, marginBottom:24 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
            <h1 style={{ fontSize:22, fontWeight:900, color:'#dce8f0', letterSpacing:'-0.02em', lineHeight:1.2 }}>{f.farm_name}</h1>
            <PriorityBadge priority={f.advisory_priority} />
            {f.advisories.some(a => a.is_recurring) && (
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, background:'rgba(248,113,113,0.10)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)' }}>
                ↻ Recurring Stress
              </span>
            )}
          </div>
          <p style={{ fontSize:12, color:'#6b8fa0', marginBottom:3 }}>
            {f.field_id} · {f.village}, {f.block}, {f.district} · {f.area_ha} ha · {f.cultivar}
          </p>
          <p style={{ fontSize:11, color:'#384e5c' }}>
            Planted {f.planting_date} · Expected harvest {f.expected_harvest_date} · Age: {f.crop_age_days}d · {f.growth_stage}
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:24, flexShrink:0 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#384e5c', marginBottom:6 }}>Health Score</div>
            <HealthScore score={f.health_score} size={56} />
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#384e5c', marginBottom:4 }}>Predicted TCH</div>
            <div style={{ fontSize:30, fontWeight:900, color:tchColor, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', lineHeight:1 }}>
              {f.tch_prediction.predicted_tch}
            </div>
            <div style={{ fontSize:11, color:tchColor, marginTop:3 }}>
              {f.tch_prediction.yield_gap >= 0 ? '+' : ''}{f.tch_prediction.yield_gap} vs baseline
            </div>
          </div>
        </div>
      </div>

      <div style={{ height:1, background:'linear-gradient(to right, #1c2d38, transparent)', marginBottom:24 }} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>
        {/* Main column */}
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          {/* Index grid */}
          <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:14 }}>
              Current Indices vs Stage Expectation — {f.growth_stage}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:10 }}>
              <IndexCell label="NDRE" value={f.indices.NDRE} expected={f.indices.expected_NDRE} desc="Canopy chlorophyll / biomass" />
              <IndexCell label="CIRE" value={f.indices.CIRE} expected={f.indices.expected_CIRE} desc="Chlorophyll / nutrient stress" />
              <IndexCell label="NDWI" value={f.indices.NDWI} expected={f.indices.expected_NDWI} desc="Crop water / moisture" />
              <IndexCell label="NDVI" value={f.indices.NDVI} expected={f.indices.expected_NDVI} desc="General vegetation vigor" />
              <IndexCell label="GNDVI" value={f.indices.GNDVI} desc="Chlorophyll / N vigor" />
              <IndexCell label="SAVI" value={f.indices.SAVI} desc="Soil-adjusted vegetation" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
              <IndexCell label="MSAVI"   value={f.indices.MSAVI}             desc="Modified soil-adjusted" />
              <IndexCell label="Salinity Index" value={f.indices.salinity_index} desc="Salinity risk proxy" />
              <IndexCell label="Canopy Temp Δ"  value={f.indices.canopy_temp_proxy} desc="°C above ambient (CWSI)" />
            </div>
          </div>

          {/* Temporal charts */}
          <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:14 }}>
              Seasonal Vegetation Trajectory
            </div>
            <FieldCharts field={f} />
          </div>

          {/* Advisories */}
          <div>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:14 }}>
              Generated Advisories ({f.advisories.length})
            </div>
            {f.advisories.length === 0 ? (
              <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:14, padding:'40px', textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
                <div style={{ fontWeight:700, color:'#4ade80', marginBottom:4 }}>No active advisories</div>
                <div style={{ fontSize:12, color:'#6b8fa0' }}>All indices within acceptable stage range.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {f.advisories.map(a => <AdvisoryCard key={a.id} adv={a} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Stress probs */}
          <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:14 }}>
              Stress Probabilities
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <ProbBar value={f.water_stress_probability}    label="💧 Water Stress" />
              <ProbBar value={f.nutrient_stress_probability} label="🌿 Nutrient Stress" />
              <ProbBar value={f.salinity_risk_probability}   label="⚗️ Salinity Risk" />
            </div>
            <div style={{ height:1, background:'#1c2d38', margin:'14px 0' }} />
            {[
              ['Confidence Level', <ConfidencePill key="c" value={f.confidence_level} />],
              ['Growth Score', <span key="g" style={{ fontSize:11, fontWeight:700, color:'#dce8f0', fontFamily:'monospace' }}>{f.growth_performance_score}/100</span>],
            ].map(([k, v]) => (
              <div key={String(k)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'#6b8fa0' }}>{k}</span>
                {v}
              </div>
            ))}
          </div>

          {/* TCH */}
          <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:14 }}>
              Yield Intelligence (ML)
            </div>
            <div style={{ textAlign:'center', marginBottom:14 }}>
              <div style={{ fontSize:32, fontWeight:900, color:tchColor, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>
                {f.tch_prediction.predicted_tch} <span style={{ fontSize:14, fontWeight:600 }}>TCH</span>
              </div>
              <div style={{ fontSize:11, color:'#6b8fa0', marginTop:4 }}>
                [{f.tch_prediction.confidence_interval[0]} – {f.tch_prediction.confidence_interval[1]}] 90% CI
              </div>
              <div style={{ marginTop:8 }}>
                <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:14, background:'rgba(74,222,128,0.08)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.18)' }}>
                  {f.tch_prediction.productivity_bucket}
                </span>
              </div>
            </div>
            <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:10 }}>
              Top SHAP Features
            </div>
            {f.tch_prediction.top_features.map((feat, i) => (
              <div key={i} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, gap:8 }}>
                  <span style={{ fontSize:11, color:'#6b8fa0', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{feat.feature}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:feat.direction === 'positive' ? '#4ade80' : '#f87171', flexShrink:0 }}>
                    {feat.direction === 'positive' ? '+' : '-'}{feat.impact.toFixed(1)}
                  </span>
                </div>
                <div style={{ height:3, borderRadius:3, background:'#1c2d38' }}>
                  <div style={{ height:'100%', borderRadius:3, width:`${Math.min((feat.impact/25)*100,100)}%`, background:feat.direction==='positive'?'#4ade80':'#f87171' }} />
                </div>
              </div>
            ))}
            <p style={{ fontSize:11, lineHeight:1.55, color:'#6b8fa0', marginTop:10 }}>{f.tch_prediction.explanation}</p>
          </div>

          {/* Rainfall */}
          <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:12 }}>Rainfall Status</div>
            {[['7-day', `${f.rainfall_7d_mm} mm`],['30-day', `${f.rainfall_30d_mm} mm`],['Expected 30d', `${f.expected_rainfall_30d_mm} mm`]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:11, color:'#6b8fa0' }}>{k}</span>
                <span style={{ fontSize:11, fontWeight:700, color:'#dce8f0', fontFamily:'monospace' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop:10 }}><ProbBar value={rfPct/100} label={`Adequacy (${rfPct}%)`} /></div>
          </div>

          {/* Soil */}
          <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:12 }}>Soil & Fertilizer</div>
            {[
              ['Soil Type', f.soil_type],['pH', String(f.soil_ph)],['Organic C', `${f.organic_carbon}%`],
              ['N / P / K', `${f.fertilizer_n_kg_ha}/${f.fertilizer_p_kg_ha}/${f.fertilizer_k_kg_ha} kg/ha`],
              ['Last Fertilizer', `${dsf}d ago`],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, gap:10 }}>
                <span style={{ fontSize:11, color:'#6b8fa0', flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:11, color:'#dce8f0', fontFamily:'monospace', textAlign:'right' }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:11, color:'#6b8fa0' }}>Nitrogen</span>
              <SeverityBadge level={f.nitrogen_level === 'Low' ? 'High' : f.nitrogen_level === 'Medium' ? 'Moderate' : 'Low'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
