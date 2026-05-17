'use client';
import { getEnrichedFields } from '@/lib/data/dataService';
import { INDEX_META } from '@/lib/engines/indices';
import { MetricCard } from '@/components/ui';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';

const TT = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8, padding: '10px 14px' }}>
      {label && <p style={{ color: '#5a7a8a', fontSize: 10, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#e2eaf0', fontSize: 11, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
        </p>
      ))}
    </div>
  );
};

const AXES = { tick: { fill: '#3d5a6a', fontSize: 10 }, axisLine: false, tickLine: false };

function AnalyticsContent() {
  const fields = getEnrichedFields();

  const indexCompare = fields.map(f => ({
    id: f.field_id.replace('SS-', ''),
    NDRE: f.indices.NDRE,
    CIRE: f.indices.CIRE,
    NDWI: f.indices.NDWI,
    NDVI: f.indices.NDVI,
    expNDRE: f.indices.expected_NDRE,
    expCIRE: f.indices.expected_CIRE,
  }));

  const radarAvg = [
    { index: 'NDVI', value: fields.reduce((s, f) => s + f.indices.NDVI, 0) / fields.length * 100 },
    { index: 'NDRE', value: fields.reduce((s, f) => s + f.indices.NDRE, 0) / fields.length * 200 },
    { index: 'CIRE', value: fields.reduce((s, f) => s + f.indices.CIRE, 0) / fields.length * 30 },
    { index: 'NDWI', value: Math.max(0, (fields.reduce((s, f) => s + f.indices.NDWI, 0) / fields.length + 0.3) * 100) },
    { index: 'GNDVI', value: fields.reduce((s, f) => s + f.indices.GNDVI, 0) / fields.length * 133 },
    { index: 'SAVI', value: fields.reduce((s, f) => s + f.indices.SAVI, 0) / fields.length * 100 },
  ];

  const scatter = fields.map(f => ({
    x: f.indices.NDRE,
    y: f.indices.NDWI,
    z: f.health_score,
    name: f.field_id,
  }));

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>{title}</p>
      {children}
    </div>
  );

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>SPECTRAL INTELLIGENCE</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Index Analytics</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>Vegetation index reference, platform-wide distribution, and field-level comparison</p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      {/* Index reference cards */}
      <div className="mb-8">
        <h2 className="text-sm font-bold mb-4" style={{ color: '#e2eaf0' }}>Index Reference Guide</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.values(INDEX_META).map(m => (
            <div key={m.label} className="rounded-xl p-4" style={{ background: '#0c1318', border: `1px solid ${m.color}22` }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: m.color }} />
                <p className="text-xs font-black tracking-widest uppercase" style={{ color: m.color }}>{m.label}</p>
              </div>
              <p className="text-xs font-medium mb-2" style={{ color: '#e2eaf0' }}>{m.name}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#5a7a8a' }}>{m.desc}</p>
              <p className="text-xs mt-2 mono" style={{ color: '#3d5a6a' }}>Range: {m.range}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        <Card title="NDRE vs Expected by Field">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={indexCompare} barCategoryGap="18%" barGap={3}>
              <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
              <XAxis dataKey="id" {...AXES} />
              <YAxis domain={[0, 0.6]} {...AXES} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#5a7a8a' }} />
              <Bar dataKey="NDRE" name="Actual NDRE" fill="#4ade80" radius={[3,3,0,0]} />
              <Bar dataKey="expNDRE" name="Expected NDRE" fill="#1e2d38" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Portfolio Index Radar (Normalized)">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarAvg}>
              <PolarGrid stroke="#1e2d38" />
              <PolarAngleAxis dataKey="index" tick={{ fill: '#5a7a8a', fontSize: 11 }} />
              <Radar name="Portfolio Avg" dataKey="value" stroke="#4ade80" fill="#4ade80" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="NDRE vs CIRE by Field">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={indexCompare}>
              <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
              <XAxis dataKey="id" {...AXES} />
              <YAxis yAxisId="l" domain={[0, 0.6]} {...AXES} />
              <YAxis yAxisId="r" orientation="right" domain={[0, 3.5]} {...AXES} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#5a7a8a' }} />
              <Bar yAxisId="l" dataKey="NDRE" name="NDRE" fill="#4ade80" radius={[3,3,0,0]} />
              <Bar yAxisId="r" dataKey="CIRE" name="CIRE" fill="#a3e635" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="NDRE vs NDWI Scatter (size = health score)">
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid stroke="#1e2d38" strokeDasharray="3 3" />
              <XAxis dataKey="x" name="NDRE" domain={[0.1, 0.6]} {...AXES} />
              <YAxis dataKey="y" name="NDWI" domain={[-0.5, 0.2]} {...AXES} />
              <ZAxis dataKey="z" range={[40, 200]} name="Health" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>{d.name}</p>
                    <p style={{ color: '#5a7a8a', fontSize: 10 }}>NDRE: {d.x.toFixed(3)} | NDWI: {d.y.toFixed(3)}</p>
                    <p style={{ color: '#5a7a8a', fontSize: 10 }}>Health: {d.z}</p>
                  </div>
                );
              }} />
              <Scatter data={scatter} fill="#4ade80" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Agronomic interpretation table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2d38' }}>
              {['Field', 'NDRE Δ%', 'CIRE Δ%', 'NDWI', 'Nutrient', 'Water', 'Interpretation'].map(h => (
                <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d5a6a' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(f => {
              const ndreD = ((f.indices.NDRE - f.indices.expected_NDRE) / (f.indices.expected_NDRE || 0.01) * 100);
              const cireD = ((f.indices.CIRE - f.indices.expected_CIRE) / (f.indices.expected_CIRE || 0.01) * 100);
              const interp = ndreD < -25 && f.indices.NDWI > -0.15 ? '🌿 Likely nutrient stress'
                : f.water_stress_probability > 0.6 ? '💧 Active water stress'
                : f.salinity_risk_probability > 0.4 ? '⚗️ Salinity risk'
                : ndreD > 0 ? '✅ Above expectation'
                : '🟡 Monitoring';
              return (
                <tr key={f.field_id} style={{ borderBottom: '1px solid #111b22' }} className="hover:bg-[#111b22] transition-colors">
                  <td className="px-4 py-3 text-xs font-bold mono" style={{ color: '#4ade80' }}>{f.field_id}</td>
                  <td className="px-4 py-3 text-xs mono font-bold" style={{ color: ndreD < -20 ? '#f87171' : ndreD < -5 ? '#facc15' : '#4ade80' }}>{ndreD.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs mono font-bold" style={{ color: cireD < -20 ? '#f87171' : cireD < -5 ? '#facc15' : '#4ade80' }}>{cireD.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-xs mono" style={{ color: f.indices.NDWI < -0.2 ? '#f87171' : '#e2eaf0' }}>{f.indices.NDWI.toFixed(3)}</td>
                  <td className="px-4 py-3 text-xs mono">{(f.nutrient_stress_probability * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-xs mono">{(f.water_stress_probability * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#5a7a8a' }}>{interp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnalyticsContent;
