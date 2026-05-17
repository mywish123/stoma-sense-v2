'use client';
import { getEnrichedFields } from '@/lib/data/dataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';

const TT = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8, padding: '10px 14px' }}>
      {label && <p style={{ color: '#5a7a8a', fontSize: 10, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#e2eaf0', fontSize: 11, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

const AXES = { tick: { fill: '#3d5a6a', fontSize: 10 }, axisLine: false, tickLine: false };

export default function IntelligencePage() {
  const fields = getEnrichedFields();
  const sorted = [...fields].sort((a, b) => b.tch_prediction.predicted_tch - a.tch_prediction.predicted_tch);

  const tchData = sorted.map(f => ({
    id: f.field_id.replace('SS-', ''),
    predicted: f.tch_prediction.predicted_tch,
    historical: f.historical_yield_tch,
    gap: f.tch_prediction.yield_gap,
  }));

  const bucketCounts = ['High', 'Above Average', 'Average', 'Below Average', 'Low'].map(b => ({
    bucket: b,
    count: fields.filter(f => f.tch_prediction.productivity_bucket === b).length,
    fill: b === 'High' ? '#4ade80' : b === 'Above Average' ? '#86efac' : b === 'Average' ? '#facc15' : b === 'Below Average' ? '#fb923c' : '#f87171',
  }));

  const scatter = fields.map(f => ({
    x: f.health_score,
    y: f.tch_prediction.predicted_tch,
    z: Math.round(f.area_ha * 3),
    name: f.field_id,
    stage: f.growth_stage,
  }));

  const Card = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
    <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>{title}</p>
      {sub && <p className="text-xs mb-4" style={{ color: '#5a7a8a' }}>{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </div>
  );

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>ML YIELD PIPELINE</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Yield Intelligence</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>CatBoost-ready feature vectors, SHAP-style explainability, TCH prediction and productivity classification</p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      {/* Platform summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Predicted TCH', value: `${(fields.reduce((s, f) => s + f.tch_prediction.predicted_tch, 0) / fields.length).toFixed(1)}`, sub: 'Platform mean', color: '#4ade80' },
          { label: 'Above Baseline', value: `${fields.filter(f => f.tch_prediction.yield_gap >= 0).length}`, sub: 'Fields with positive gap', color: '#4ade80' },
          { label: 'Below Baseline', value: `${fields.filter(f => f.tch_prediction.yield_gap < 0).length}`, sub: 'Fields at risk', color: '#f87171' },
          { label: 'Harvest Ready', value: `${fields.filter(f => f.tch_prediction.harvest_readiness_score >= 55).length}`, sub: 'Score ≥ 55', color: '#fb923c' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#5a7a8a', letterSpacing: '0.1em' }}>{s.label}</p>
            <p className="text-3xl font-black mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#3d5a6a' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <Card title="Predicted vs Historical TCH" sub="Sorted by predicted yield">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tchData} barGap={3}>
              <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
              <XAxis dataKey="id" {...AXES} />
              <YAxis domain={[30, 110]} {...AXES} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#5a7a8a' }} />
              <Bar dataKey="predicted" name="Predicted TCH" fill="#4ade80" radius={[3,3,0,0]} />
              <Bar dataKey="historical" name="Historical TCH" fill="#1e2d38" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Productivity Bucket Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bucketCounts} barSize={40}>
              <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
              <XAxis dataKey="bucket" {...AXES} />
              <YAxis {...AXES} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="count" name="Fields" radius={[4,4,0,0]}>
                {bucketCounts.map((d, i) => (
                  <rect key={i} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Health Score vs Predicted TCH" sub="Bubble size = area (ha)">
          <ResponsiveContainer width="100%" height={220}>
            <ScatterChart>
              <CartesianGrid stroke="#1e2d38" strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Health Score" domain={[20, 100]} {...AXES} />
              <YAxis dataKey="y" name="Predicted TCH" domain={[40, 110]} {...AXES} />
              <ZAxis dataKey="z" range={[40, 200]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8, padding: '8px 12px' }}>
                    <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>{d.name}</p>
                    <p style={{ color: '#5a7a8a', fontSize: 10 }}>Health: {d.x} | TCH: {d.y}</p>
                    <p style={{ color: '#5a7a8a', fontSize: 10 }}>{d.stage}</p>
                  </div>
                );
              }} />
              <Scatter data={scatter} fill="#4ade80" fillOpacity={0.65} />
            </ScatterChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Yield Gap by Field (TCH vs historical)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tchData.map(d => ({ ...d, color: d.gap >= 0 ? '#4ade80' : '#f87171' }))}>
              <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
              <XAxis dataKey="id" {...AXES} />
              <YAxis domain={[-30, 30]} {...AXES} />
              <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="gap" name="Yield Gap (TCH)" fill="#4ade80" radius={[3,3,0,0]}
                label={false} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* SHAP table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1e2d38' }}>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>
            SHAP-Style Feature Contributions by Field
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2d38' }}>
                {['Field', 'Predicted TCH', 'Confidence', 'Top Feature 1', 'Top Feature 2', 'Explanation'].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d5a6a', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(f => {
                const t = f.tch_prediction;
                const gap = t.yield_gap;
                return (
                  <tr key={f.field_id} style={{ borderBottom: '1px solid #111b22' }} className="hover:bg-[#111b22] transition-colors">
                    <td className="px-4 py-3 text-xs font-bold mono" style={{ color: '#4ade80' }}>{f.field_id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-black mono" style={{ color: '#e2eaf0' }}>{t.predicted_tch}</p>
                      <p className="text-xs" style={{ color: gap >= 0 ? '#4ade80' : '#f87171' }}>
                        [{t.confidence_interval[0]}–{t.confidence_interval[1]}]
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs mono font-bold" style={{ color: t.confidence >= 0.85 ? '#4ade80' : '#facc15' }}>
                      {(t.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#5a7a8a' }}>
                      {t.top_features[0] && (
                        <>
                          <span style={{ color: t.top_features[0].direction === 'positive' ? '#4ade80' : '#f87171' }}>
                            {t.top_features[0].direction === 'positive' ? '↑' : '↓'}{t.top_features[0].impact.toFixed(1)}
                          </span>
                          {' '}{t.top_features[0].feature}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#5a7a8a' }}>
                      {t.top_features[1] && (
                        <>
                          <span style={{ color: t.top_features[1].direction === 'positive' ? '#4ade80' : '#f87171' }}>
                            {t.top_features[1].direction === 'positive' ? '↑' : '↓'}{t.top_features[1].impact.toFixed(1)}
                          </span>
                          {' '}{t.top_features[1].feature}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs leading-snug" style={{ color: '#5a7a8a', maxWidth: 280 }}>
                      {t.explanation.slice(0, 120)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
