'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { EnrichedField } from '@/types';

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

export default function FieldCharts({ field }: { field: EnrichedField }) {
  const data = field.temporal_series.map(t => ({
    date: t.date.slice(5), // MM-DD
    NDRE: t.NDRE,
    NDWI: t.NDWI,
    CIRE: parseFloat((t.CIRE / 6).toFixed(3)), // scale CIRE to 0-1 for display
    NDVI: t.NDVI,
  })).slice(-36); // last ~180 days

  return (
    <div className="space-y-5">
      {/* NDRE / NDVI chart */}
      <div>
        <p className="text-xs font-bold mb-3" style={{ color: '#5a7a8a' }}>NDRE & NDVI Trajectory</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="ndreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#86efac" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#86efac" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2d38" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" {...AXES} interval={4} />
            <YAxis domain={[0, 0.65]} {...AXES} />
            <Tooltip content={<TT />} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#5a7a8a' }} />
            <Area dataKey="NDRE" name="NDRE" stroke="#4ade80" fill="url(#ndreGrad)" strokeWidth={2} dot={false} />
            <Area dataKey="NDVI" name="NDVI" stroke="#86efac" fill="url(#ndviGrad)" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* NDWI chart */}
      <div>
        <p className="text-xs font-bold mb-3" style={{ color: '#5a7a8a' }}>NDWI Water Status Trajectory</p>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="ndwiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e2d38" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" {...AXES} interval={4} />
            <YAxis domain={[-0.5, 0.3]} {...AXES} />
            <Tooltip content={<TT />} />
            <Area dataKey="NDWI" name="NDWI" stroke="#38bdf8" fill="url(#ndwiGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
