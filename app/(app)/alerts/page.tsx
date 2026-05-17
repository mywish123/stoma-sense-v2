import { getAlerts, getEnrichedFields } from '@/lib/data/dataService';
import { SeverityBadge, PageHeader } from '@/components/ui';
import Link from 'next/link';

const ALERT_ICONS: Record<string, string> = {
  irrigation_deficit: '💧',
  high_risk: '🚨',
  rapid_decline: '📉',
  unresolved_stress: '⚠️',
  harvest_window: '🌾',
};

const ALERT_LABELS: Record<string, string> = {
  irrigation_deficit: 'Irrigation Deficit',
  high_risk: 'High Risk Field',
  rapid_decline: 'Rapid NDRE Decline',
  unresolved_stress: 'Unresolved Stress',
  harvest_window: 'Harvest Window',
};

export default function AlertsPage() {
  const alerts = getAlerts();
  const fields = getEnrichedFields();

  const critical = alerts.filter(a => a.severity === 'Critical');
  const high     = alerts.filter(a => a.severity === 'High');
  const moderate = alerts.filter(a => a.severity === 'Moderate');
  const low      = alerts.filter(a => a.severity === 'Low');

  const leftBorder: Record<string, string> = {
    Critical: '#f87171',
    High:     '#fb923c',
    Moderate: '#facc15',
    Low:      '#4ade80',
  };

  return (
    <div style={{ maxWidth:960 }}>
      <PageHeader
        eyebrow="OPERATIONAL INTELLIGENCE"
        title="Alert Center"
        sub={`${alerts.length} active alerts · ${critical.length} critical · ${high.length} high priority · ${moderate.length} moderate`}
      />

      {/* Severity summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:28 }}>
        {[
          { label:'Critical', count:critical.length, color:'#f87171', bg:'rgba(248,113,113,0.06)', border:'rgba(248,113,113,0.2)' },
          { label:'High',     count:high.length,     color:'#fb923c', bg:'rgba(251,146,60,0.06)',  border:'rgba(251,146,60,0.18)' },
          { label:'Moderate', count:moderate.length,  color:'#facc15', bg:'rgba(250,204,21,0.06)',  border:'rgba(250,204,21,0.18)' },
          { label:'Low',      count:low.length,       color:'#4ade80', bg:'rgba(74,222,128,0.04)',  border:'rgba(74,222,128,0.14)' },
        ].map(s => (
          <div key={s.label} style={{
            background:s.bg, border:`1px solid ${s.border}`,
            borderRadius:12, padding:'18px 20px',
          }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:8 }}>
              {s.label}
            </div>
            <div style={{ fontSize:32, fontWeight:900, color:s.color, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>
              {s.count}
            </div>
          </div>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {alerts.map(alert => {
          const field = fields.find(f => f.field_id === alert.field_id);
          const border = leftBorder[alert.severity] ?? '#1c2d38';
          return (
            <div key={alert.id} style={{
              background:'#0d1518',
              border:'1px solid #1c2d38',
              borderLeft:`3px solid ${border}`,
              borderRadius:12,
              padding:'18px 22px',
              transition:'transform 0.15s, box-shadow 0.15s',
            }} className="card-hover">
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:20 }}>
                {/* Left: icon + content */}
                <div style={{ display:'flex', alignItems:'flex-start', gap:14, flex:1, minWidth:0 }}>
                  <div style={{
                    width:36, height:36, borderRadius:8, flexShrink:0,
                    background:'rgba(255,255,255,0.04)', border:'1px solid #1c2d38',
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
                  }}>
                    {ALERT_ICONS[alert.type] ?? '⚠️'}
                  </div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#6b8fa0', letterSpacing:'0.04em' }}>
                        {ALERT_LABELS[alert.type] ?? alert.type}
                      </span>
                      <SeverityBadge level={alert.severity} />
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#dce8f0', lineHeight:1.5, marginBottom:6 }}>
                      {alert.message}
                    </div>
                    {field && (
                      <div style={{ fontSize:11, color:'#384e5c', display:'flex', gap:10, flexWrap:'wrap' }}>
                        <span>{field.village}, {field.district}</span>
                        <span>·</span>
                        <span>{field.area_ha} ha</span>
                        <span>·</span>
                        <span>{field.growth_stage}</span>
                        <span>·</span>
                        <span>Crop age: {field.crop_age_days}d</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: action */}
                <div style={{ flexShrink:0 }}>
                  <Link href={`/fields/${alert.field_id}`} style={{
                    display:'inline-flex', alignItems:'center', gap:4,
                    padding:'7px 14px', borderRadius:7, textDecoration:'none',
                    fontSize:12, fontWeight:700, color:'#4ade80',
                    background:'rgba(74,222,128,0.08)',
                    border:'1px solid rgba(74,222,128,0.2)',
                    whiteSpace:'nowrap',
                  }}>
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
