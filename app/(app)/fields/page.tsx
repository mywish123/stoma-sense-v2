import { getEnrichedFields } from '@/lib/data/dataService';
import FieldsTable from './FieldsTable';
import { PageHeader } from '@/components/ui';

export default function FieldsPage() {
  const fields = getEnrichedFields();
  return (
    <div>
      <PageHeader
        eyebrow="REMOTE SENSING INTELLIGENCE"
        title="Field Intelligence"
        sub={`${fields.length} monitored sugarcane fields with satellite-derived stress scores, ML advisory priorities, and yield predictions`}
      />
      <FieldsTable fields={fields} />
    </div>
  );
}
