'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';
import { EnrichedField } from '@/types';

const TT = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8, padding: '10px 14px' }}>
      {label && <p style={{ color: '#5a7a8a', fontSize: 11, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 12, fontWeight: 700 }}>
          {p.name}: {typeof p.value === 'number' ? (p.value < 2 ? (p.value * 100).toFixed(1) + '%' : p.value.toFixed(1)) : p.value}
        </p>
      ))}
    </div>
  );
};

const AXES = { tick: { fill: '#3d5a6a', fontSize: 10 }, axisLine: false, tickLine: false };

export default function DashboardCharts({ fields }: { fields: EnrichedField[] }) {
  const healthDist = [
    { name: 'Excellent\n≥80', count: fields.filter(f => f.health_score >= 80).length, fill: '#4ade80' },
    { name: 'Good\n65–79', count: fields.filter(f => f.health_score >= 65 && f.health_score < 80).length, fill: '#86efac' },
    { name: 'Watch\n50–64', count: fields.filter(f => f.health_score >= 50 && f.health_score < 65).length, fill: '#facc15' },
    { name: 'Stress\n35–49', count: fields.filter(f => f.health_score >= 35 && f.health_score < 50).length, fill: '#fb923c' },
    { name: 'Critical\n<35', count: fields.filter(f => f.health_score < 35).length, fill: '#f87171' },
  ];

  const stressComp = fields.map(f => ({
    id: f.field_id.replace('SS-', ''),
    water: parseFloat((f.water_stress_probability * 100).toFixed(1)),
    nutrient: parseFloat((f.nutrient_stress_probability * 100).toFixed(1)),
    salinity: parseFloat((f.salinity_risk_probability * 100).toFixed(1)),
  })).sort((a, b) => (b.water + b.nutrient + b.salinity) - (a.water + a.nutrient + a.salinity));

  const tchDist = fields.map(f => ({
    id: f.field_id.replace('SS-', ''),
    tch: f.tch_prediction.predicted_tch,
    historical: f.historical_yield_tch,
  })).sort((a, b) => b.tch - a.tch);

  const stagePie = [
    { name: 'Initiation', value: fields.filter(f => f.growth_stage === 'Initiation').length, fill: '#38bdf8' },
    { name: 'Tillering', value: fields.filter(f => f.growth_stage === 'Tillering').length, fill: '#4ade80' },
    { name: 'Grand Growth', value: fields.filter(f => f.growth_stage === 'Grand Growth').length, fill: '#fb923c' },
    { name: 'Maturity', value: fields.filter(f => f.growth_stage === 'Maturity').length, fill: '#a78bfa' },
  ];

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl p-5" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>{title}</p>
      {children}
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card title="Field Health Score Distribution">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={healthDist} barSize={32}>
            <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
            <XAxis dataKey="name" {...AXES} />
            <YAxis {...AXES} />
            <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="count" name="Fields" radius={[4,4,0,0]}>
              {healthDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Growth Stage Distribution">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={stagePie} dataKey="value" cx="50%" cy="50%" outerRadius={78} innerRadius={42}
              paddingAngle={3} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
              {stagePie.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip content={<TT />} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Stress Probability by Field (%)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stressComp} barCategoryGap="12%" barGap={2}>
            <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
            <XAxis dataKey="id" {...AXES} />
            <YAxis domain={[0, 100]} {...AXES} />
            <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#5a7a8a' }} />
            <Bar dataKey="water" name="Water %" fill="#38bdf8" radius={[2,2,0,0]} stackId="a" />
            <Bar dataKey="nutrient" name="Nutrient %" fill="#4ade80" radius={[0,0,0,0]} stackId="a" />
            <Bar dataKey="salinity" name="Salinity %" fill="#facc15" radius={[2,2,0,0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Predicted vs Historical TCH by Field">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={tchDist} barCategoryGap="18%" barGap={3}>
            <CartesianGrid vertical={false} stroke="#1e2d38" strokeDasharray="3 3" />
            <XAxis dataKey="id" {...AXES} />
            <YAxis domain={[40, 110]} {...AXES} />
            <Tooltip content={<TT />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#5a7a8a' }} />
            <Bar dataKey="tch" name="Predicted TCH" fill="#4ade80" radius={[3,3,0,0]} />
            <Bar dataKey="historical" name="Historical TCH" fill="#1e2d38" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
