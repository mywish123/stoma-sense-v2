import { getDashboardStats, getEnrichedFields, getAlerts } from '@/lib/data/dataService';
import { MetricCard, SeverityBadge, PriorityBadge, ProbBar, SectionHeader, HealthScore, PageHeader } from '@/components/ui';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';

export default function DashboardPage() {
  const stats  = getDashboardStats();
  const fields = getEnrichedFields();
  const alerts = getAlerts();

  const criticalFields = fields
    .filter(f => f.advisory_priority === 'Urgent' || f.advisory_priority === 'High')
    .sort((a, b) => b.advisory_priority_score - a.advisory_priority_score)
    .slice(0, 6);

  const probLevel = (p: number) => p > 0.65 ? 'Critical' : p > 0.5 ? 'High' : p > 0.3 ? 'Moderate' : 'Low';

  return (
    <div style={{ maxWidth:1380 }}>
      <PageHeader
        eyebrow="STOMA SENSE · ENTERPRISE INTELLIGENCE"
        title="Executive Dashboard"
        sub={`${stats.field_count} fields · ${stats.total_area_ha} ha monitored · ${stats.districts_covered} districts · Last satellite: ${stats.last_satellite_date}`}
      />

      {/* Top KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginBottom:14 }}>
        <div className="anim-fade-up delay-1">
          <MetricCard label="Monitored Area" value={`${stats.total_area_ha} ha`} sub={`${stats.field_count} active fields across ${stats.districts_covered} districts`} accent="green" />
        </div>
        <div className="anim-fade-up delay-2">
          <MetricCard label="Avg Crop Health" value={`${stats.avg_health_score}/100`} sub="Composite satellite stress score" accent={stats.avg_health_score >= 65 ? 'green' : stats.avg_health_score >= 48 ? 'yellow' : 'red'} />
        </div>
        <div className="anim-fade-up delay-3">
          <MetricCard label="Avg Predicted TCH" value={stats.avg_tch_predicted} sub="ML yield intelligence estimate" accent="blue" />
        </div>
        <div className="anim-fade-up delay-4">
          <MetricCard label="Active Alerts" value={stats.active_alerts} sub="Requiring immediate attention" accent={stats.active_alerts > 4 ? 'red' : 'orange'} />
        </div>
      </div>

      {/* Stress summary row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, marginBottom:24 }}>
        <div className="anim-fade-up delay-2">
          <MetricCard label="High Water Stress" value={`${stats.high_water_stress} fields`} sub={`${Math.round(stats.high_water_stress/stats.field_count*100)}% of portfolio`} accent={stats.high_water_stress > 3 ? 'red' : 'blue'} />
        </div>
        <div className="anim-fade-up delay-3">
          <MetricCard label="High Nutrient Stress" value={`${stats.high_nutrient_stress} fields`} sub={`${Math.round(stats.high_nutrient_stress/stats.field_count*100)}% of portfolio`} accent={stats.high_nutrient_stress > 3 ? 'orange' : 'green'} />
        </div>
        <div className="anim-fade-up delay-4">
          <MetricCard label="High Salinity Risk" value={`${stats.high_salinity_risk} fields`} sub={`${Math.round(stats.high_salinity_risk/stats.field_count*100)}% of portfolio`} accent={stats.high_salinity_risk > 2 ? 'yellow' : 'default'} />
        </div>
      </div>

      {/* Charts */}
      <div className="anim-fade-up delay-3" style={{ marginBottom:24 }}>
        <DashboardCharts fields={fields} />
      </div>

      {/* Critical fields + alerts */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:18 }}>
        {/* Table */}
        <div className="anim-fade-up delay-4">
          <SectionHeader
            title="High Priority Fields"
            sub="Fields requiring immediate agronomic action"
            action={<Link href="/fields" style={{ fontSize:12, fontWeight:700, color:'#4ade80', textDecoration:'none' }}>View all →</Link>}
          />
          <div style={{ background:'#0d1518', border:'1px solid #1c2d38', borderRadius:12, overflow:'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Field','Stage','Health','Water','Nutrient','Priority'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criticalFields.map(f => (
                  <tr key={f.field_id}>
                    <td>
                      <Link href={`/fields/${f.field_id}`} style={{ textDecoration:'none' }}>
                        <div style={{ fontSize:11, fontWeight:800, color:'#4ade80', fontFamily:'monospace' }}>{f.field_id}</div>
                        <div style={{ fontSize:11, color:'#6b8fa0', marginTop:1 }}>{f.village}</div>
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:4, background:'#172430', color:'#6b8fa0', whiteSpace:'nowrap' }}>
                        {f.growth_stage === 'Grand Growth' ? 'Grand Gwth' : f.growth_stage}
                      </span>
                    </td>
                    <td><HealthScore score={f.health_score} size={36} /></td>
                    <td><SeverityBadge level={probLevel(f.water_stress_probability)} /></td>
                    <td><SeverityBadge level={probLevel(f.nutrient_stress_probability)} /></td>
                    <td><PriorityBadge priority={f.advisory_priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert feed */}
        <div className="anim-fade-up delay-5">
          <SectionHeader
            title="Live Alerts"
            sub="Most recent high-severity alerts"
            action={<Link href="/alerts" style={{ fontSize:12, fontWeight:700, color:'#4ade80', textDecoration:'none' }}>View all →</Link>}
          />
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} style={{
                background:'#0d1518', border:'1px solid #1c2d38',
                borderLeft:`3px solid ${alert.severity === 'Critical' ? '#f87171' : '#fb923c'}`,
                borderRadius:10, padding:'13px 15px',
              }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{
                    width:6, height:6, borderRadius:'50%', flexShrink:0, marginTop:5,
                    background: alert.severity === 'Critical' ? '#f87171' : '#fb923c',
                  }} />
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, color:'#dce8f0', lineHeight:1.55, marginBottom:4 }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize:10, color:'#384e5c', display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontFamily:'monospace', fontWeight:700 }}>{alert.field_id}</span>
                      <span>·</span>
                      <SeverityBadge level={alert.severity} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
