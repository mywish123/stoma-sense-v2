'use client';
import { getEnrichedFields } from '@/lib/data/dataService';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function MapPage() {
  const fields = getEnrichedFields();
  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>GEOSPATIAL INTELLIGENCE</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Satellite Field Map</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>Click any field polygon to view detailed advisory and stress intelligence</p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>
      <MapView fields={fields} />
    </div>
  );
}
