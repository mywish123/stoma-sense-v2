import { getDashboardStats, getEnrichedFields, getAlerts } from '@/lib/data/dataService';
import { MetricCard, SeverityBadge, PriorityBadge, ProbBar, SectionHeader, HealthScore } from '@/components/ui';
import DashboardCharts from './DashboardCharts';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = getDashboardStats();
  const fields = getEnrichedFields();
  const alerts = getAlerts();

  const criticalFields = fields
    .filter(f => f.advisory_priority === 'Urgent' || f.advisory_priority === 'High')
    .sort((a, b) => b.advisory_priority_score - a.advisory_priority_score)
    .slice(0, 6);

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest mb-1 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>
              STOMA SENSE · ENTERPRISE INTELLIGENCE
            </p>
            <h1 className="text-3xl font-black" style={{ color: '#e2eaf0', letterSpacing: '-0.02em' }}>
              Executive Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#5a7a8a' }}>
              {stats.field_count} fields · {stats.total_area_ha} ha · {stats.districts_covered} districts · Last satellite: {stats.last_satellite_date}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
            <span className="text-xs font-bold" style={{ color: '#4ade80' }}>
              {stats.coverage_pct}% SATELLITE COVERAGE
            </span>
          </div>
        </div>
        <div className="h-px mt-6" style={{ background: 'linear-gradient(to right, #1e2d38, transparent)' }} />
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-up delay-100">
          <MetricCard label="Total Monitored Area" value={`${stats.total_area_ha} ha`} sub={`${stats.field_count} active fields`} icon="🛰️" accent="green" />
        </div>
        <div className="animate-fade-up delay-200">
          <MetricCard label="Avg Crop Health" value={`${stats.avg_health_score}/100`} sub="Composite stress score" icon="💚" accent={stats.avg_health_score >= 65 ? 'green' : stats.avg_health_score >= 48 ? 'yellow' : 'red'} />
        </div>
        <div className="animate-fade-up delay-300">
          <MetricCard label="Avg Predicted TCH" value={`${stats.avg_tch_predicted}`} sub="ML yield estimate" icon="🌾" accent="blue" />
        </div>
        <div className="animate-fade-up delay-400">
          <MetricCard label="Active Alerts" value={stats.active_alerts} sub="Require attention" icon="🔔" accent={stats.active_alerts > 4 ? 'red' : 'orange'} />
        </div>
      </div>

      {/* Stress summary row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="animate-fade-up delay-200">
          <MetricCard label="High Water Stress" value={stats.high_water_stress} sub={`of ${stats.field_count} fields`} icon="💧" accent={stats.high_water_stress > 3 ? 'red' : 'blue'} />
        </div>
        <div className="animate-fade-up delay-300">
          <MetricCard label="High Nutrient Stress" value={stats.high_nutrient_stress} sub={`of ${stats.field_count} fields`} icon="🌿" accent={stats.high_nutrient_stress > 3 ? 'orange' : 'green'} />
        </div>
        <div className="animate-fade-up delay-400">
          <MetricCard label="High Salinity Risk" value={stats.high_salinity_risk} sub={`of ${stats.field_count} fields`} icon="⚗️" accent={stats.high_salinity_risk > 2 ? 'yellow' : 'muted'} />
        </div>
      </div>

      {/* Charts */}
      <div className="animate-fade-up delay-300 mb-8">
        <DashboardCharts fields={fields} />
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Critical fields table */}
        <div className="col-span-3 animate-fade-up delay-400">
          <SectionHeader
            title="High Priority Fields"
            sub="Fields requiring immediate agronomic attention"
            action={<Link href="/fields" className="text-xs font-bold hover:opacity-80" style={{ color: '#4ade80' }}>View all →</Link>}
          />
          <div className="rounded-xl overflow-hidden" style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2d38' }}>
                  {['Field', 'Stage', 'Health', 'Water', 'Nutrient', 'Priority'].map(h => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3d5a6a' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {criticalFields.map(f => (
                  <tr key={f.field_id} style={{ borderBottom: '1px solid #111b22' }}
                    className="hover:bg-[#111b22] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/fields/${f.field_id}`}>
                        <p className="text-xs font-bold mono" style={{ color: '#4ade80' }}>{f.field_id}</p>
                        <p className="text-xs" style={{ color: '#5a7a8a' }}>{f.village}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1e2d38', color: '#5a7a8a' }}>
                        {f.growth_stage.split(' ')[0]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <HealthScore score={f.health_score} size={36} />
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge level={f.water_stress_probability > 0.65 ? 'Critical' : f.water_stress_probability > 0.5 ? 'High' : f.water_stress_probability > 0.3 ? 'Moderate' : 'Low'} />
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge level={f.nutrient_stress_probability > 0.65 ? 'Critical' : f.nutrient_stress_probability > 0.5 ? 'High' : f.nutrient_stress_probability > 0.3 ? 'Moderate' : 'Low'} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={f.advisory_priority} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert feed */}
        <div className="col-span-2 animate-fade-up delay-500">
          <SectionHeader
            title="Live Alert Feed"
            sub="High-severity field alerts"
            action={<Link href="/alerts" className="text-xs font-bold hover:opacity-80" style={{ color: '#4ade80' }}>View all →</Link>}
          />
          <div className="space-y-2.5">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="rounded-xl p-4 transition-all"
                style={{ background: '#0c1318', border: '1px solid #1e2d38' }}>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: alert.severity === 'Critical' ? '#f87171' : '#fb923c' }} />
                  <div>
                    <p className="text-xs font-medium leading-snug" style={{ color: '#e2eaf0' }}>{alert.message}</p>
                    <p className="text-xs mt-1" style={{ color: '#3d5a6a' }}>
                      {alert.field_id} · <SeverityBadge level={alert.severity} />
                    </p>
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
