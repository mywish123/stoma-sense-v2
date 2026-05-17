'use client';
import { useState } from 'react';

const SECTIONS = [
  {
    id: 'satellite', label: '🛰️ Satellite Source', items: [
      { key: 'source', label: 'Primary Satellite', type: 'select', options: ['Sentinel-2 (ESA)', 'Landsat-8 (USGS)', 'MODIS (NASA)', 'Custom API'], value: 'Sentinel-2 (ESA)' },
      { key: 'revisit', label: 'Revisit Frequency', type: 'select', options: ['5 days', '10 days', '15 days', 'Custom'], value: '5 days' },
      { key: 'cloud', label: 'Max Cloud Cover (%)', type: 'number', value: '25' },
      { key: 'hub', label: 'Sentinel Hub URL (production)', type: 'text', value: 'https://sh.dataspace.copernicus.eu/api/v1' },
    ]
  },
  {
    id: 'advisory', label: '📋 Advisory Engine', items: [
      { key: 'water_threshold', label: 'Water Stress Threshold (%)', type: 'number', value: '28' },
      { key: 'nutrient_threshold', label: 'Nutrient Stress Threshold (%)', type: 'number', value: '30' },
      { key: 'salinity_threshold', label: 'Salinity Risk Threshold (%)', type: 'number', value: '25' },
      { key: 'advisory_mode', label: 'Advisory Generation Mode', type: 'select', options: ['Rule-based (current)', 'ML-enhanced (beta)', 'Hybrid'], value: 'Rule-based (current)' },
    ]
  },
  {
    id: 'stage', label: '🌱 Stage Configuration', items: [
      { key: 'initiation', label: 'Initiation (days)', type: 'text', value: '0–60' },
      { key: 'tillering', label: 'Tillering (days)', type: 'text', value: '61–130' },
      { key: 'grand', label: 'Grand Growth (days)', type: 'text', value: '131–280' },
      { key: 'maturity', label: 'Maturity (days)', type: 'text', value: '281–365' },
    ]
  },
  {
    id: 'integrations', label: '🔗 Future Integrations', items: [
      { key: 'supabase', label: 'Supabase URL', type: 'text', value: 'https://xxxxx.supabase.co' },
      { key: 'gee', label: 'Google Earth Engine Project ID', type: 'text', value: 'ee-stomasense-prod' },
      { key: 'titiler', label: 'TiTiler Host', type: 'text', value: 'https://titiler.stomasense.ai' },
      { key: 'bigquery', label: 'BigQuery Dataset', type: 'text', value: 'stomasense.production.fields' },
    ]
  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const inputStyle = {
    background: '#0c1318', border: '1px solid #1e2d38', borderRadius: 8,
    color: '#e2eaf0', fontSize: 13, padding: '8px 12px', outline: 'none', width: '100%',
  };

  return (
    <div className="animate-fade-up max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>PLATFORM MANAGEMENT</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Configuration</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>Satellite ingestion, advisory thresholds, crop calendar, and production integration setup</p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      <div className="space-y-6">
        {SECTIONS.map(sec => (
          <div key={sec.id} className="rounded-xl p-6" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-sm font-bold mb-5" style={{ color: '#e2eaf0' }}>{sec.label}</p>
            <div className="grid grid-cols-2 gap-5">
              {sec.items.map(item => (
                <div key={item.key}>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#5a7a8a', letterSpacing: '0.08em' }}>
                    {item.label}
                  </label>
                  {item.type === 'select' ? (
                    <select defaultValue={item.value} style={inputStyle}>
                      {(item.options ?? []).map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={item.type} defaultValue={item.value} style={inputStyle} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Notifications */}
        <div className="rounded-xl p-6" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
          <p className="text-sm font-bold mb-5" style={{ color: '#e2eaf0' }}>🔔 Notification Preferences</p>
          <div className="space-y-4">
            {[
              ['Email alerts for Critical severity', true],
              ['Email alerts for High severity', true],
              ['Daily field summary digest', true],
              ['New satellite imagery alerts', false],
              ['Harvest window notifications', true],
            ].map(([label, def]) => (
              <div key={String(label)} className="flex items-center justify-between">
                <label className="text-sm" style={{ color: '#5a7a8a' }}>{label as string}</label>
                <div className="w-10 h-5 rounded-full flex items-center transition-all cursor-pointer"
                  style={{ background: def ? 'rgba(74,222,128,0.3)' : '#1e2d38', padding: 2, justifyContent: def ? 'flex-end' : 'flex-start' }}>
                  <div className="w-4 h-4 rounded-full" style={{ background: def ? '#4ade80' : '#3d5a6a' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
          style={{ background: 'rgba(74,222,128,0.18)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)' }}>
          {saved ? '✓ Saved Successfully' : 'Save Configuration'}
        </button>
        <p className="text-xs" style={{ color: '#3d5a6a' }}>Changes take effect on next satellite processing cycle</p>
      </div>
    </div>
  );
}
