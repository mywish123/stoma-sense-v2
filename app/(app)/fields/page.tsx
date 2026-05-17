import { getEnrichedFields } from '@/lib/data/dataService';
import FieldsTable from './FieldsTable';

export default function FieldsPage() {
  const fields = getEnrichedFields();
  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>REMOTE SENSING INTELLIGENCE</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Field Intelligence</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>All {fields.length} monitored sugarcane fields with satellite-derived stress scores and ML advisory priorities</p>
        <div className="h-px mt-6" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>
      <FieldsTable fields={fields} />
    </div>
  );
}
