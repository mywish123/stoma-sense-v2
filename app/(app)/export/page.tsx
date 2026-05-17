'use client';
import { useState } from 'react';

const REPORT_TYPES = [
  { id: 'field_csv', label: 'Field Intelligence CSV', desc: 'All field metrics, stress scores, and advisory priorities', icon: '📊', size: '~12KB' },
  { id: 'advisory_json', label: 'Advisory Engine JSON', desc: 'Full advisory data with evidence, explanation, and action steps', icon: '📋', size: '~28KB' },
  { id: 'ml_features', label: 'ML Feature Vector CSV', desc: 'CatBoost-ready feature matrix for yield prediction model training', icon: '🤖', size: '~8KB' },
  { id: 'exec_report', label: 'Executive Summary PDF', desc: 'Platform-wide intelligence report for management review', icon: '📄', size: '~2MB' },
  { id: 'advisory_pdf', label: 'Advisory Report PDF', desc: 'Full advisory report with WHY explanations and action priorities', icon: '📑', size: '~3MB' },
];

const DISTRICTS = ['All Districts', 'Pune', 'Satara', 'Ahmednagar', 'Solapur', 'Kolhapur'];
const STAGES = ['All Stages', 'Initiation', 'Tillering', 'Grand Growth', 'Maturity'];
const PRIORITIES = ['All Priorities', 'Urgent', 'High', 'Medium', 'Low'];

export default function ExportPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [stage, setStage] = useState(STAGES[0]);
  const [priority, setPriority] = useState(PRIORITIES[0]);
  const [dateFrom, setDateFrom] = useState('2025-01-01');
  const [dateTo, setDateTo] = useState('2025-05-15');
  const [downloading, setDownloading] = useState<string | null>(null);

  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleDownload = (id: string) => {
    setDownloading(id);
    setTimeout(() => {
      // Mock download — in production POST to /api/export
      const blob = new Blob([JSON.stringify({ report: id, district, stage, priority, generated: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `stomasense-${id}-${Date.now()}.json`;
      a.click(); URL.revokeObjectURL(url);
      setDownloading(null);
    }, 1200);
  };

  const inputStyle = {
    background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8,
    color: '#e2eaf0', fontSize: 13, padding: '8px 12px', outline: 'none', width: '100%',
  };

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>DATA OPERATIONS</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Export & Reports</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>Configure and download enterprise data exports, advisory reports, and executive summaries</p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      {/* Filters */}
      <div className="rounded-xl p-6 mb-6" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
        <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#3d5a6a', letterSpacing: '0.12em' }}>Export Filters</p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'District', val: district, set: setDistrict, opts: DISTRICTS },
            { label: 'Stage', val: stage, set: setStage, opts: STAGES },
            { label: 'Priority', val: priority, set: setPriority, opts: PRIORITIES },
          ].map(s => (
            <div key={s.label}>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#5a7a8a' }}>{s.label}</label>
              <select value={s.val} onChange={e => s.set(e.target.value)} style={inputStyle}>
                {s.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#5a7a8a' }}>Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#5a7a8a' }}>Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Report types */}
      <div className="space-y-3">
        {REPORT_TYPES.map(r => (
          <div key={r.id} className="rounded-xl p-5 flex items-center gap-5 transition-all cursor-pointer"
            style={{
              background: selected.includes(r.id) ? 'rgba(74,222,128,0.05)' : '#0c1318',
              border: `1px solid ${selected.includes(r.id) ? 'rgba(74,222,128,0.3)' : '#1e2d38'}`,
            }}
            onClick={() => toggle(r.id)}
          >
            <div className="text-2xl flex-shrink-0">{r.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-0.5">
                <p className="font-bold text-sm" style={{ color: '#e2eaf0' }}>{r.label}</p>
                <span className="text-xs mono" style={{ color: '#3d5a6a' }}>{r.size}</span>
              </div>
              <p className="text-xs" style={{ color: '#5a7a8a' }}>{r.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              {selected.includes(r.id) && (
                <button onClick={e => { e.stopPropagation(); handleDownload(r.id); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
                  disabled={downloading === r.id}>
                  {downloading === r.id ? 'Generating...' : 'Download'}
                </button>
              )}
              <div className="w-5 h-5 rounded flex items-center justify-center"
                style={{ border: `2px solid ${selected.includes(r.id) ? '#4ade80' : '#1e2d38'}`, background: selected.includes(r.id) ? '#4ade80' : 'transparent' }}>
                {selected.includes(r.id) && <span className="text-xs font-bold" style={{ color: '#050a0e' }}>✓</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="mt-6 flex items-center justify-between p-4 rounded-xl"
          style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <p className="text-xs font-bold" style={{ color: '#4ade80' }}>
            {selected.length} report{selected.length > 1 ? 's' : ''} selected
          </p>
          <button
            onClick={() => selected.forEach(id => handleDownload(id))}
            className="px-5 py-2 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(74,222,128,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
            Download All Selected
          </button>
        </div>
      )}
    </div>
  );
}
