'use client';
import { getEnrichedFields } from '@/lib/data/dataService';
import { expectedCurve } from '@/lib/engines/phenologyEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TT = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8, padding: '10px 14px' }}>
      {label && <p style={{ color: '#5a7a8a', fontSize: 10, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 11, fontWeight: 700 }}>
          {p.name}: {p.value?.toFixed(3)}
        </p>
      ))}
    </div>
  );
};

const AXES = { tick: { fill: '#3d5a6a', fontSize: 9 }, axisLine: false, tickLine: false };

export default function PhenologyPage() {
  const fields = getEnrichedFields();

  // Show 4 interesting fields
  const showcaseFields = [
    fields.find(f => f.field_id === 'SS-015')!,
    fields.find(f => f.field_id === 'SS-001')!,
    fields.find(f => f.field_id === 'SS-013')!,
    fields.find(f => f.field_id === 'SS-004')!,
  ].filter(Boolean);

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>TEMPORAL ANALYSIS</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Phenology Engine</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>
          Seasonal vegetation trajectory analysis — actual vs expected curves, anomaly detection, and phenological metrics
        </p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      {/* Phenology metrics table */}
      <div className="rounded-xl overflow-hidden mb-8" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1e2d38' }}>
              {['Field', 'District', 'Stage', 'SOS', 'Peak NDRE', 'AUC', 'Green-up', 'Stress Days', 'Persistence', 'Growth Rate'].map(h => (
                <th key={h} className="px-3 py-3 text-left" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d5a6a', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map(f => (
              <tr key={f.field_id} style={{ borderBottom: '1px solid #111b22' }} className="hover:bg-[#111b22] transition-colors">
                <td className="px-3 py-2.5 text-xs font-bold mono" style={{ color: '#4ade80' }}>{f.field_id}</td>
                <td className="px-3 py-2.5 text-xs" style={{ color: '#5a7a8a' }}>{f.district}</td>
                <td className="px-3 py-2.5">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1e2d38', color: '#5a7a8a' }}>
                    {f.growth_stage === 'Grand Growth' ? 'Grd Gwth' : f.growth_stage}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-xs mono" style={{ color: '#5a7a8a' }}>{f.phenology.SOS}</td>
                <td className="px-3 py-2.5 text-xs mono font-bold" style={{ color: f.phenology.peak_NDRE > 0.42 ? '#4ade80' : '#facc15' }}>{f.phenology.peak_NDRE.toFixed(3)}</td>
                <td className="px-3 py-2.5 text-xs mono" style={{ color: '#e2eaf0' }}>{f.phenology.AUC.toFixed(1)}</td>
                <td className="px-3 py-2.5 text-xs mono" style={{ color: '#e2eaf0' }}>{f.phenology.green_up_days}d</td>
                <td className="px-3 py-2.5 text-xs mono" style={{ color: f.phenology.stress_days > 30 ? '#f87171' : '#e2eaf0' }}>{f.phenology.stress_days}d</td>
                <td className="px-3 py-2.5 text-xs mono" style={{ color: f.phenology.stress_persistence > 0.25 ? '#f87171' : f.phenology.stress_persistence > 0.12 ? '#facc15' : '#4ade80' }}>
                  {(f.phenology.stress_persistence * 100).toFixed(0)}%
                </td>
                <td className="px-3 py-2.5 text-xs mono" style={{ color: '#5a7a8a' }}>
                  {(f.phenology.growth_rate * 1000).toFixed(2)}‰/d
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Individual field trajectory charts */}
      <div className="grid grid-cols-2 gap-5">
        {showcaseFields.map(f => {
          const curve = expectedCurve(f.planting_date, f.expected_harvest_date);
          const actual = f.temporal_series;

          // Merge on date
          const merged: { date: string; actual_NDRE?: number; exp_NDRE?: number; actual_NDWI?: number }[] = [];
          const maxLen = Math.max(actual.length, curve.length);

          for (let i = 0; i < Math.min(maxLen, 50); i++) {
            const d: { date: string; actual_NDRE?: number; exp_NDRE?: number; actual_NDWI?: number } = { date: '' };
            if (i < actual.length) { d.date = actual[i].date.slice(5); d.actual_NDRE = actual[i].NDRE; d.actual_NDWI = actual[i].NDWI; }
            if (i < curve.length) { if (!d.date) d.date = curve[i].date.slice(5); d.exp_NDRE = curve[i].NDRE; }
            merged.push(d);
          }

          const stressFlag = f.water_stress_probability > 0.5 || f.nutrient_stress_probability > 0.5;

          return (
            <div key={f.field_id} className="rounded-xl p-5" style={{
              background: '#0c1318',
              border: `1px solid ${stressFlag ? 'rgba(248,113,113,0.25)' : '#1e2d38'}`,
            }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-black mono" style={{ color: stressFlag ? '#f87171' : '#4ade80' }}>{f.field_id}</p>
                  <p className="text-xs font-bold" style={{ color: '#e2eaf0' }}>{f.farm_name}</p>
                  <p className="text-xs" style={{ color: '#5a7a8a' }}>{f.growth_stage} · {f.crop_age_days}d</p>
                </div>
                <div className="text-right text-xs">
                  <p style={{ color: '#5a7a8a' }}>AUC: <span className="mono font-bold" style={{ color: '#e2eaf0' }}>{f.phenology.AUC.toFixed(1)}</span></p>
                  <p style={{ color: '#5a7a8a' }}>Stress: <span className="mono font-bold" style={{ color: f.phenology.stress_days > 30 ? '#f87171' : '#4ade80' }}>{f.phenology.stress_days}d</span></p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={merged}>
                  <defs>
                    <linearGradient id={`g1-${f.field_id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e2d38" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" {...AXES} interval={7} />
                  <YAxis domain={[0, 0.6]} {...AXES} />
                  <Tooltip content={<TT />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: '#5a7a8a' }} />
                  <Area dataKey="exp_NDRE" name="Expected NDRE" stroke="#2d4455" fill="none" strokeDasharray="4 3" strokeWidth={1.5} dot={false} connectNulls />
                  <Area dataKey="actual_NDRE" name="Actual NDRE" stroke="#4ade80" fill={`url(#g1-${f.field_id})`} strokeWidth={2} dot={false} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
