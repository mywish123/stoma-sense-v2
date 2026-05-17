'use client';
import { getEnrichedFields } from '@/lib/data/dataService';
import dynamic from 'next/dynamic';
import { PageHeader } from '@/components/ui';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

export default function MapPage() {
  const fields = getEnrichedFields();
  return (
    <div>
      <PageHeader
        eyebrow="GEOSPATIAL INTELLIGENCE"
        title="Satellite Field Map"
        sub="Click any polygon to view field intelligence. Switch layers to visualise different stress signals."
      />
      <MapView fields={fields} />
    </div>
  );
}
