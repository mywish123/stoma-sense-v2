import { getAlerts, getEnrichedFields } from '@/lib/data/dataService';
import { SeverityBadge } from '@/components/ui';
import Link from 'next/link';

export default function AlertsPage() {
  const alerts = getAlerts();
  const fields = getEnrichedFields();

  const alertTypeLabel: Record<string, string> = {
    irrigation_deficit: '💧 Irrigation Deficit',
    high_risk: '🚨 High Risk',
    rapid_decline: '📉 Rapid Decline',
    unresolved_stress: '⚠️ Unresolved Stress',
    harvest_window: '🌾 Harvest Window',
  };

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>OPERATIONAL INTELLIGENCE</p>
        <h1 className="text-3xl font-black mb-1" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>Alert Center</h1>
        <p className="text-sm" style={{ color: '#5a7a8a' }}>
          {alerts.length} active alerts · {alerts.filter(a => a.severity === 'Critical').length} critical · {alerts.filter(a => a.severity === 'High').length} high priority
        </p>
        <div className="h-px mt-5" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {['Critical', 'High', 'Moderate', 'Low'].map(sev => {
          const count = alerts.filter(a => a.severity === sev).length;
          const color = sev === 'Critical' ? '#f87171' : sev === 'High' ? '#fb923c' : sev === 'Moderate' ? '#facc15' : '#4ade80';
          return (
            <div key={sev} className="rounded-xl p-4" style={{ background: '#0c1318', border: `1px solid ${color}22` }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#5a7a8a' }}>{sev}</p>
              <p className="text-2xl font-black mono" style={{ color }}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {alerts.map(alert => {
          const field = fields.find(f => f.field_id === alert.field_id);
          return (
            <div key={alert.id} className="rounded-xl p-5 transition-all hover:scale-[1.003]"
              style={{
                background: '#0c1318',
                border: `1px solid ${alert.severity === 'Critical' ? 'rgba(248,113,113,0.25)' : alert.severity === 'High' ? 'rgba(251,146,60,0.2)' : '#1e2d38'}`,
              }}>
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: alert.severity === 'Critical' ? '#f87171' : alert.severity === 'High' ? '#fb923c' : '#facc15' }} />
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-bold tracking-wider" style={{ color: '#5a7a8a' }}>
                        {alertTypeLabel[alert.type] ?? alert.type}
                      </span>
                      <SeverityBadge level={alert.severity} />
                    </div>
                    <p className="text-sm font-medium leading-snug mb-2" style={{ color: '#e2eaf0' }}>{alert.message}</p>
                    {field && (
                      <p className="text-xs" style={{ color: '#3d5a6a' }}>
                        {field.village}, {field.district} · {field.area_ha} ha · {field.growth_stage} · Crop age: {field.crop_age_days}d
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link href={`/fields/${alert.field_id}`}
                    className="text-xs font-bold hover:opacity-70 transition-opacity" style={{ color: '#4ade80' }}>
                    View Field →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
