'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { EnrichedField } from '@/types';
import { SeverityBadge, PriorityBadge, ProbBar, HealthScore } from '@/components/ui';

const STAGES = ['All', 'Initiation', 'Tillering', 'Grand Growth', 'Maturity'];
const PRIORITIES = ['All', 'Urgent', 'High', 'Medium', 'Low'];
const DISTRICTS = (fields: EnrichedField[]) => ['All', ...Array.from(new Set(fields.map(f => f.district)))];

export default function FieldsTable({ fields }: { fields: EnrichedField[] }) {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('All');
  const [priority, setPriority] = useState('All');
  const [district, setDistrict] = useState('All');
  const [sortKey, setSortKey] = useState<keyof EnrichedField>('advisory_priority_score');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  const filtered = useMemo(() => fields
    .filter(f =>
      (!search || [f.field_id, f.farm_name, f.village, f.cultivar].some(v => v.toLowerCase().includes(search.toLowerCase()))) &&
      (stage === 'All' || f.growth_stage === stage) &&
      (priority === 'All' || f.advisory_priority === priority) &&
      (district === 'All' || f.district === district)
    )
    .sort((a, b) => {
      const av = a[sortKey] as number, bv = b[sortKey] as number;
      return sortDir === 'desc' ? bv - av : av - bv;
    }),
    [fields, search, stage, priority, district, sortKey, sortDir]
  );

  const handleSort = (k: keyof EnrichedField) => {
    if (k === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const inputStyle = {
    background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8,
    color: '#e2eaf0', fontSize: 13, padding: '8px 12px', outline: 'none',
  };

  const Th = ({ label, k }: { label: string; k?: keyof EnrichedField }) => (
    <th onClick={() => k && handleSort(k)} style={{
      padding: '12px 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: '#3d5a6a', borderBottom: '1px solid #1e2d38',
      cursor: k ? 'pointer' : 'default', textAlign: 'left',
      whiteSpace: 'nowrap' as const,
    }}>
      {label}{k === sortKey ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
    </th>
  );

  const probLevel = (p: number) =>
    p > 0.65 ? 'Critical' : p > 0.5 ? 'High' : p > 0.3 ? 'Moderate' : 'Low';

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search fields, farms, villages..." style={{ ...inputStyle, width: 260 }}
        />
        {[
          { label: 'Stage', val: stage, set: setStage, opts: STAGES },
          { label: 'Priority', val: priority, set: setPriority, opts: PRIORITIES },
          { label: 'District', val: district, set: setDistrict, opts: DISTRICTS(fields) },
        ].map(s => (
          <select key={s.label} value={s.val} onChange={e => s.set(e.target.value)}
            style={{ ...inputStyle, paddingRight: 20 }}>
            {s.opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
        <div className="ml-auto text-xs" style={{ color: '#3d5a6a' }}>
          {filtered.length}/{fields.length} fields
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
        <table className="w-full" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <Th label="Field ID" />
              <Th label="Farm / Location" />
              <Th label="Area" k="area_ha" />
              <Th label="Stage" />
              <Th label="Health" k="health_score" />
              <Th label="NDRE"  />
              <Th label="CIRE"  />
              <Th label="NDWI"  />
              <Th label="Water" k="water_stress_probability" />
              <Th label="Nutrient" k="nutrient_stress_probability" />
              <Th label="Salinity" k="salinity_risk_probability" />
              <Th label="TCH Est."  />
              <Th label="Priority" k="advisory_priority_score" />
              <Th label="" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.field_id} style={{ borderBottom: '1px solid #111b22' }}
                className="hover:bg-[#111b22] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/fields/${f.field_id}`}>
                    <span className="text-xs font-bold mono" style={{ color: '#4ade80' }}>{f.field_id}</span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-medium" style={{ color: '#e2eaf0' }}>{f.farm_name}</p>
                  <p className="text-xs" style={{ color: '#5a7a8a' }}>{f.village}, {f.district}</p>
                </td>
                <td className="px-4 py-3 text-xs mono" style={{ color: '#5a7a8a' }}>{f.area_ha} ha</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1e2d38', color: '#5a7a8a' }}>
                    {f.growth_stage === 'Grand Growth' ? 'Grd Gwth' : f.growth_stage}
                  </span>
                </td>
                <td className="px-4 py-3"><HealthScore score={f.health_score} size={36} /></td>
                <td className="px-4 py-3">
                  <span className="text-xs mono font-bold"
                    style={{ color: f.ndre_anomaly < -0.2 ? '#f87171' : f.ndre_anomaly < -0.05 ? '#facc15' : '#4ade80' }}>
                    {f.indices.NDRE.toFixed(3)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs mono font-bold"
                    style={{ color: f.cire_anomaly < -0.2 ? '#f87171' : f.cire_anomaly < -0.05 ? '#facc15' : '#4ade80' }}>
                    {f.indices.CIRE.toFixed(3)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs mono font-bold"
                    style={{ color: f.indices.NDWI < -0.2 ? '#f87171' : f.indices.NDWI < -0.05 ? '#facc15' : '#4ade80' }}>
                    {f.indices.NDWI.toFixed(3)}
                  </span>
                </td>
                <td className="px-4 py-3"><SeverityBadge level={probLevel(f.water_stress_probability)} /></td>
                <td className="px-4 py-3"><SeverityBadge level={probLevel(f.nutrient_stress_probability)} /></td>
                <td className="px-4 py-3"><SeverityBadge level={probLevel(f.salinity_risk_probability)} /></td>
                <td className="px-4 py-3">
                  <span className="text-xs mono font-bold" style={{ color: '#e2eaf0' }}>
                    {f.tch_prediction.predicted_tch} TCH
                  </span>
                </td>
                <td className="px-4 py-3"><PriorityBadge priority={f.advisory_priority} /></td>
                <td className="px-4 py-3">
                  <Link href={`/fields/${f.field_id}`}
                    className="text-xs font-bold hover:opacity-70 transition-opacity" style={{ color: '#4ade80' }}>
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
