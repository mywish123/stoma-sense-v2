import { getEnrichedFields } from '@/lib/data/dataService';
import { Advisory } from '@/types';
import { AdvisoryCard, SeverityBadge, PriorityBadge, PageHeader } from '@/components/ui';

export default function AdvisoriesPage() {
  const fields = getEnrichedFields();
  const allAdvisories: (Advisory & { farmName: string; fieldId: string; district: string })[] = fields.flatMap(f =>
    f.advisories.map(a => ({ ...a, farmName: f.farm_name, fieldId: f.field_id, district: f.district }))
  ).sort((a, b) => {
    const ord = { Critical: 4, High: 3, Moderate: 2, Low: 1, None: 0 } as Record<string, number>;
    return (ord[b.severity] ?? 0) - (ord[a.severity] ?? 0);
  });

  const byType: Record<string, typeof allAdvisories> = {};
  allAdvisories.forEach(a => { (byType[a.type] = byType[a.type] ?? []).push(a); });

  const urgent = allAdvisories.filter(a => a.severity === 'Critical' || a.severity === 'High');
  const recurring = allAdvisories.filter(a => a.is_recurring);

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>ADVISORY ENGINE V2</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Field Advisories</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>
          {allAdvisories.length} total advisories · {urgent.length} high priority · {recurring.length} recurring stress patterns
        </p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(byType).map(([type, advs]) => (
          <div key={type} className="rounded-xl p-4" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#5a7a8a', letterSpacing: '0.08em' }}>{type}</p>
            <p className="text-2xl font-black mono" style={{ color: '#e2eaf0' }}>{advs.length}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {['Critical', 'High', 'Moderate', 'Low'].map(sev => {
                const count = advs.filter(a => a.severity === sev).length;
                return count > 0 ? <SeverityBadge key={sev} level={sev} /> : null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* High priority first */}
      {urgent.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: '#f87171' }}>
            <span>🚨</span> Critical & High Priority ({urgent.length})
          </h2>
          <div className="space-y-4">
            {urgent.map(a => (
              <AdvisoryCard key={a.id} adv={a} fieldName={`${a.fieldId} — ${a.farmName}`} />
            ))}
          </div>
        </div>
      )}

      {/* All grouped by type */}
      {Object.entries(byType).filter(([,advs]) => advs.some(a => a.severity === 'Moderate' || a.severity === 'Low')).map(([type, advs]) => (
        <div key={type} className="mb-8">
          <h2 className="text-base font-bold mb-4" style={{ color: '#e2eaf0' }}>{type} ({advs.length})</h2>
          <div className="space-y-4">
            {advs.filter(a => a.severity !== 'Critical' && a.severity !== 'High').map(a => (
              <AdvisoryCard key={a.id} adv={a} fieldName={`${a.fieldId} — ${a.farmName}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
