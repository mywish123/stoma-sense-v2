'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { EnrichedField } from '@/types';
import { SeverityBadge, PriorityBadge, HealthScore } from '@/components/ui';

const STAGES    = ['All', 'Initiation', 'Tillering', 'Grand Growth', 'Maturity'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];

const inputStyle: React.CSSProperties = {
  background:'#0d1518', border:'1px solid #1c2d38', borderRadius:8,
  color:'#dce8f0', fontSize:13, padding:'8px 12px', outline:'none',
};

const probLevel = (p: number) => p > 0.65 ? 'Critical' : p > 0.5 ? 'High' : p > 0.3 ? 'Moderate' : 'Low';

export default function FieldsTable({ fields }: { fields: EnrichedField[] }) {
  const [search,   setSearch]   = useState('');
  const [stage,    setStage]    = useState('All');
  const [priority, setPriority] = useState('All');
  const [district, setDistrict] = useState('All');
  const districts = useMemo(() => ['All', ...Array.from(new Set(fields.map(f => f.district)))], [fields]);

  const filtered = useMemo(() => fields.filter(f =>
    (!search || [f.field_id, f.farm_name, f.village].some(v => v.toLowerCase().includes(search.toLowerCase()))) &&
    (stage    === 'All' || f.growth_stage === stage) &&
    (priority === 'All' || f.advisory_priority === priority) &&
    (district === 'All' || f.district === district)
  ), [fields, search, stage, priority, district]);

  const ndreColor = (anom: number) => anom < -0.2 ? '#f87171' : anom < -0.05 ? '#facc15' : '#4ade80';

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:16, alignItems:'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search fields, farms, villages…"
          style={{ ...inputStyle, width:260 }}
        />
        {[
          { val:stage,    set:setStage,    opts:STAGES },
          { val:priority, set:setPriority, opts:PRIORITIES },
          { val:district, set:setDistrict, opts:districts },
        ].map((s, i) => (
          <select key={i} value={s.val} onChange={e => s.set(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
            {s.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <div style={{ marginLeft:'auto', fontSize:11, color:'#384e5c' }}>
          {filtered.length} / {fields.length} fields
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:12, overflowX:'auto' }}>
        <table className="data-table" style={{ minWidth:1100 }}>
          <thead>
            <tr>
              {['Field ID','Farm / Village','Area','Stage','Health','NDRE','CIRE','NDWI','Water','Nutrient','Salinity','Pred TCH','Priority',''].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.field_id}>
                <td>
                  <Link href={`/fields/${f.field_id}`} style={{ textDecoration:'none' }}>
                    <div style={{ fontSize:12, fontWeight:800, color:'#4ade80', fontFamily:'monospace' }}>{f.field_id}</div>
                  </Link>
                </td>
                <td>
                  <div style={{ fontSize:13, fontWeight:600, color:'#dce8f0' }}>{f.farm_name}</div>
                  <div style={{ fontSize:11, color:'#6b8fa0', marginTop:1 }}>{f.village}, {f.district}</div>
                </td>
                <td style={{ fontSize:12, color:'#6b8fa0', fontFamily:'monospace', whiteSpace:'nowrap' }}>{f.area_ha} ha</td>
                <td>
                  <span style={{
                    fontSize:11, padding:'3px 8px', borderRadius:4,
                    background:'#172430', color:'#6b8fa0', whiteSpace:'nowrap',
                  }}>
                    {f.growth_stage === 'Grand Growth' ? 'Grand Gwth' : f.growth_stage}
                  </span>
                </td>
                <td><HealthScore score={f.health_score} size={36} /></td>
                <td>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:ndreColor(f.ndre_anomaly) }}>
                    {f.indices.NDRE.toFixed(3)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:ndreColor(f.cire_anomaly) }}>
                    {f.indices.CIRE.toFixed(3)}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:f.indices.NDWI < -0.2 ? '#f87171' : f.indices.NDWI < -0.05 ? '#facc15' : '#4ade80' }}>
                    {f.indices.NDWI.toFixed(3)}
                  </span>
                </td>
                <td><SeverityBadge level={probLevel(f.water_stress_probability)} /></td>
                <td><SeverityBadge level={probLevel(f.nutrient_stress_probability)} /></td>
                <td><SeverityBadge level={probLevel(f.salinity_risk_probability)} /></td>
                <td style={{ fontSize:13, fontWeight:800, fontFamily:'monospace', color:'#dce8f0', whiteSpace:'nowrap' }}>
                  {f.tch_prediction.predicted_tch} TCH
                </td>
                <td><PriorityBadge priority={f.advisory_priority} /></td>
                <td>
                  <Link href={`/fields/${f.field_id}`} style={{
                    fontSize:12, fontWeight:700, color:'#4ade80', textDecoration:'none',
                    padding:'5px 10px', borderRadius:6,
                    background:'rgba(74,222,128,0.07)', border:'1px solid rgba(74,222,128,0.15)',
                    whiteSpace:'nowrap',
                  }}>
                    Detail →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
