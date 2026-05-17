'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip as MapTip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { EnrichedField, MapLayer } from '@/types';
import { SeverityBadge, PriorityBadge, ProbBar, HealthScore } from '@/components/ui';
import Link from 'next/link';

function healthColor(score: number): string {
  if (score >= 75) return '#4ade80';
  if (score >= 58) return '#facc15';
  if (score >= 40) return '#fb923c';
  return '#f87171';
}

function layerColor(f: EnrichedField, layer: MapLayer): string {
  switch (layer) {
    case 'ndvi':    return `hsl(${f.indices.NDVI * 120}, 80%, 45%)`;
    case 'ndre':    return `hsl(${f.indices.NDRE * 280}, 75%, 45%)`;
    case 'ndwi':    return f.indices.NDWI > 0 ? '#38bdf8' : `hsl(${Math.max(0, 30 + f.indices.NDWI * 60)}, 80%, 45%)`;
    case 'nutrient': return `hsl(${Math.max(0, 120 - f.nutrient_stress_probability * 120)}, 75%, 42%)`;
    case 'water':    return `hsl(${Math.max(0, 200 + f.water_stress_probability * -100)}, 70%, 45%)`;
    case 'salinity': return `hsl(${Math.max(30, 60 - f.salinity_risk_probability * 60)}, 70%, 45%)`;
    case 'growth':   return `hsl(${f.growth_performance_score * 1.2}, 70%, 42%)`;
    case 'advisory': return f.advisory_priority === 'Urgent' ? '#f87171' : f.advisory_priority === 'High' ? '#fb923c' : f.advisory_priority === 'Medium' ? '#facc15' : '#4ade80';
    default: return healthColor(f.health_score);
  }
}

const LAYERS: { key: MapLayer; label: string }[] = [
  { key: 'ndvi', label: 'NDVI' },
  { key: 'ndre', label: 'NDRE' },
  { key: 'ndwi', label: 'NDWI' },
  { key: 'nutrient', label: 'Nutrient' },
  { key: 'water', label: 'Water' },
  { key: 'salinity', label: 'Salinity' },
  { key: 'growth', label: 'Growth' },
  { key: 'advisory', label: 'Priority' },
];

export default function MapView({ fields }: { fields: EnrichedField[] }) {
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>('advisory');
  const [selected, setSelected] = useState<EnrichedField | null>(null);

  const center: [number, number] = [18.2, 74.5];

  return (
    <div className="flex gap-5">
      <div className="flex-1">
        {/* Layer controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {LAYERS.map(l => (
            <button key={l.key} onClick={() => setSelectedLayer(l.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: selectedLayer === l.key ? 'rgba(74,222,128,0.15)' : '#0c1318',
                border: `1px solid ${selectedLayer === l.key ? 'rgba(74,222,128,0.4)' : '#1e2d38'}`,
                color: selectedLayer === l.key ? '#4ade80' : '#5a7a8a',
              }}>
              {l.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs" style={{ color: '#5a7a8a' }}>
            <span>Active layer:</span>
            <span className="font-bold" style={{ color: '#4ade80' }}>{selectedLayer.toUpperCase()}</span>
          </div>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden" style={{ height: 560, border: '1px solid #1e2d38' }}>
          <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%', background: '#0c1318' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {fields.map(f => {
              const coords = f.polygon.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
              const color = layerColor(f, selectedLayer);
              return (
                <Polygon
                  key={f.field_id}
                  positions={coords}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.55, weight: 2 }}
                  eventHandlers={{ click: () => setSelected(f) }}
                >
                  <MapTip>
                    <div style={{ background: '#0c1318', padding: '8px 12px', borderRadius: 8, fontSize: 12, color: '#e2eaf0', border: '1px solid #1e2d38' }}>
                      <strong style={{ color: '#4ade80' }}>{f.field_id}</strong> — {f.farm_name}<br />
                      Health: {f.health_score} | {f.growth_stage}<br />
                      Water: {(f.water_stress_probability * 100).toFixed(0)}% | Nutrient: {(f.nutrient_stress_probability * 100).toFixed(0)}%
                    </div>
                  </MapTip>
                </Polygon>
              );
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs" style={{ color: '#5a7a8a' }}>
          {selectedLayer === 'advisory' && [
            { color: '#f87171', label: 'Urgent' },
            { color: '#fb923c', label: 'High' },
            { color: '#facc15', label: 'Medium' },
            { color: '#4ade80', label: 'Low' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
          {selectedLayer !== 'advisory' && (
            <div className="flex items-center gap-1.5">
              <div className="w-24 h-2.5 rounded" style={{ background: 'linear-gradient(to right, #f87171, #facc15, #4ade80)' }} />
              <span>Low → High</span>
            </div>
          )}
        </div>
      </div>

      {/* Field detail panel */}
      <div style={{ width: 300, flexShrink: 0 }}>
        {selected ? (
          <div className="rounded-xl p-5 sticky top-4" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold mono mb-0.5" style={{ color: '#4ade80' }}>{selected.field_id}</p>
                <p className="font-bold text-sm" style={{ color: '#e2eaf0' }}>{selected.farm_name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5a7a8a' }}>{selected.village} · {selected.area_ha} ha</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-lg leading-none" style={{ color: '#3d5a6a' }}>×</button>
            </div>

            <div className="flex items-center gap-4 mb-4 p-3 rounded-lg" style={{ background: '#111b22', border: '1px solid #1e2d38' }}>
              <HealthScore score={selected.health_score} size={52} />
              <div>
                <p className="text-xs" style={{ color: '#5a7a8a' }}>Health Score</p>
                <p className="text-xs mt-1" style={{ color: '#5a7a8a' }}>{selected.growth_stage}</p>
                <PriorityBadge priority={selected.advisory_priority} />
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <ProbBar value={selected.water_stress_probability} label="💧 Water Stress" />
              <ProbBar value={selected.nutrient_stress_probability} label="🌿 Nutrient Stress" />
              <ProbBar value={selected.salinity_risk_probability} label="⚗️ Salinity Risk" />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
              {['NDRE', 'CIRE', 'NDWI'].map(k => {
                const v = selected.indices[k as keyof typeof selected.indices] as number;
                return (
                  <div key={k} className="text-center p-2 rounded" style={{ background: '#111b22' }}>
                    <p style={{ color: '#3d5a6a' }}>{k}</p>
                    <p className="font-bold mono" style={{ color: '#e2eaf0' }}>{v.toFixed(3)}</p>
                  </div>
                );
              })}
            </div>

            {selected.advisories.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: '#3d5a6a' }}>Active Advisories</p>
                {selected.advisories.map(a => (
                  <div key={a.id} className="flex items-center gap-2 mb-1.5">
                    <SeverityBadge level={a.severity} />
                    <span className="text-xs truncate" style={{ color: '#5a7a8a' }}>{a.type}</span>
                  </div>
                ))}
              </div>
            )}

            <Link href={`/fields/${selected.field_id}`}
              className="block w-full text-center py-2.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
              Open Field Intelligence →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl p-8 text-center" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-2xl mb-3">🛰️</p>
            <p className="text-sm font-bold mb-1" style={{ color: '#e2eaf0' }}>Click a field polygon</p>
            <p className="text-xs" style={{ color: '#5a7a8a' }}>Select any field on the map to view intelligence summary and advisory status</p>
            <div className="mt-6 space-y-2">
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#3d5a6a' }}>Quick Stats</p>
              <p className="text-xs" style={{ color: '#5a7a8a' }}>{fields.length} fields monitored</p>
              <p className="text-xs" style={{ color: '#5a7a8a' }}>{fields.filter(f => f.advisory_priority === 'Urgent').length} urgent priorities</p>
              <p className="text-xs" style={{ color: '#5a7a8a' }}>{fields.filter(f => f.water_stress_probability > 0.5).length} water-stressed fields</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
