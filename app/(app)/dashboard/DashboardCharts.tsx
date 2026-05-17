'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, Legend,
} from 'recharts';
import { EnrichedField } from '@/types';
import { ChartTip } from '@/components/ui';

const AXES = {
  tick: { fill: '#384e5c', fontSize: 10, fontFamily: 'monospace' },
  axisLine: false as const,
  tickLine: false as const,
};

export default function DashboardCharts({ fields }: { fields: EnrichedField[] }) {
  const healthDist = [
    { name: '≥80', label:'Excellent', count: fields.filter(f => f.health_score >= 80).length, fill:'#4ade80' },
    { name: '65–79', label:'Good',    count: fields.filter(f => f.health_score >= 65 && f.health_score < 80).length, fill:'#86efac' },
    { name: '50–64', label:'Watch',   count: fields.filter(f => f.health_score >= 50 && f.health_score < 65).length, fill:'#facc15' },
    { name: '35–49', label:'Stress',  count: fields.filter(f => f.health_score >= 35 && f.health_score < 50).length, fill:'#fb923c' },
    { name: '<35',   label:'Critical',count: fields.filter(f => f.health_score < 35).length, fill:'#f87171' },
  ];

  const stressComp = fields.map(f => ({
    id: f.field_id.replace('SS-', ''),
    water:    parseFloat((f.water_stress_probability * 100).toFixed(1)),
    nutrient: parseFloat((f.nutrient_stress_probability * 100).toFixed(1)),
    salinity: parseFloat((f.salinity_risk_probability * 100).toFixed(1)),
  })).sort((a, b) => (b.water + b.nutrient + b.salinity) - (a.water + a.nutrient + a.salinity));

  const tchData = fields.map(f => ({
    id: f.field_id.replace('SS-', ''),
    tch: f.tch_prediction.predicted_tch,
    hist: f.historical_yield_tch,
  })).sort((a, b) => b.tch - a.tch);

  const stagePie = [
    { name: 'Initiation',   value: fields.filter(f => f.growth_stage === 'Initiation').length,    fill:'#38bdf8' },
    { name: 'Tillering',    value: fields.filter(f => f.growth_stage === 'Tillering').length,     fill:'#4ade80' },
    { name: 'Grand Growth', value: fields.filter(f => f.growth_stage === 'Grand Growth').length,  fill:'#fb923c' },
    { name: 'Maturity',     value: fields.filter(f => f.growth_stage === 'Maturity').length,      fill:'#a78bfa' },
  ];

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:12, padding:'18px 20px' }}>
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.13em', textTransform:'uppercase', color:'#384e5c', marginBottom:14 }}>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
      <Card title="Field Health Score Distribution">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={healthDist} barSize={34}>
            <CartesianGrid vertical={false} stroke="#1c2d38" strokeDasharray="3 3" />
            <XAxis dataKey="name" {...AXES} />
            <YAxis {...AXES} />
            <Tooltip content={<ChartTip />} cursor={{ fill:'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="count" name="Fields" radius={[4,4,0,0]}>
              {healthDist.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Growth Stage Distribution">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={stagePie} dataKey="value" cx="45%" cy="50%" outerRadius={76} innerRadius={40} paddingAngle={3}>
              {stagePie.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip content={<ChartTip />} />
            <Legend
              wrapperStyle={{ fontSize:11, color:'#6b8fa0' }}
              formatter={(value) => <span style={{ color:'#6b8fa0', fontSize:11 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Stress Probability by Field (%)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stressComp} barCategoryGap="15%" barGap={2}>
            <CartesianGrid vertical={false} stroke="#1c2d38" strokeDasharray="3 3" />
            <XAxis dataKey="id" {...AXES} />
            <YAxis domain={[0, 100]} {...AXES} />
            <Tooltip content={<ChartTip />} cursor={{ fill:'rgba(255,255,255,0.02)' }} />
            <Legend wrapperStyle={{ fontSize:11, color:'#6b8fa0' }} formatter={(v) => <span style={{ color:'#6b8fa0', fontSize:11 }}>{v}</span>} />
            <Bar dataKey="water"    name="Water %"    fill="#38bdf8" stackId="a" />
            <Bar dataKey="nutrient" name="Nutrient %"  fill="#4ade80" stackId="a" />
            <Bar dataKey="salinity" name="Salinity %"  fill="#facc15" stackId="a" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Predicted vs Historical TCH">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={tchData} barCategoryGap="20%" barGap={3}>
            <CartesianGrid vertical={false} stroke="#1c2d38" strokeDasharray="3 3" />
            <XAxis dataKey="id" {...AXES} />
            <YAxis domain={[40, 110]} {...AXES} />
            <Tooltip content={<ChartTip />} cursor={{ fill:'rgba(255,255,255,0.02)' }} />
            <Legend wrapperStyle={{ fontSize:11 }} formatter={(v) => <span style={{ color:'#6b8fa0', fontSize:11 }}>{v}</span>} />
            <Bar dataKey="tch"  name="Predicted TCH"  fill="#4ade80" radius={[3,3,0,0]} />
            <Bar dataKey="hist" name="Historical TCH" fill="#243848" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
