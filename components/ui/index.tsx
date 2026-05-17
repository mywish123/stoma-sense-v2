import { clsx } from 'clsx';
import { ReactNode } from 'react';
import { Advisory } from '@/types';

// ── Metric Card ────────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  trend?: number;
  accent?: 'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'muted';
  className?: string;
}

const accentStyles: Record<string, { border: string; bg: string; text: string }> = {
  green:  { border: 'rgba(74,222,128,0.22)',  bg: 'rgba(74,222,128,0.04)',  text: '#4ade80'  },
  red:    { border: 'rgba(248,113,113,0.22)', bg: 'rgba(248,113,113,0.04)', text: '#f87171'  },
  yellow: { border: 'rgba(250,204,21,0.22)',  bg: 'rgba(250,204,21,0.04)',  text: '#facc15'  },
  blue:   { border: 'rgba(56,189,248,0.22)',  bg: 'rgba(56,189,248,0.04)',  text: '#38bdf8'  },
  orange: { border: 'rgba(251,146,60,0.22)',  bg: 'rgba(251,146,60,0.04)',  text: '#fb923c'  },
  muted:  { border: '#1e2d38',                bg: '#0c1318',                text: '#e2eaf0'  },
};

export function MetricCard({ label, value, sub, icon, trend, accent = 'muted', className }: MetricCardProps) {
  const s = accentStyles[accent];
  return (
    <div className={clsx('rounded-xl p-5 relative overflow-hidden transition-all hover:scale-[1.01]', className)}
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#5a7a8a', letterSpacing: '0.12em' }}>
            {label}
          </p>
          <p className="text-2xl font-black mono tabular" style={{ color: s.text }}>{value}</p>
          {sub && <p className="text-xs mt-1.5" style={{ color: '#3d5a6a' }}>{sub}</p>}
          {trend !== undefined && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: trend >= 0 ? '#4ade80' : '#f87171' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last cycle
            </p>
          )}
        </div>
        {icon && <span className="text-2xl opacity-60 flex-shrink-0">{icon}</span>}
      </div>
    </div>
  );
}

// ── Severity Badge ─────────────────────────────────────────────────────────────
const sevStyles: Record<string, { bg: string; text: string; border: string }> = {
  None:     { bg: 'rgba(90,122,138,0.1)',  text: '#5a7a8a', border: 'rgba(90,122,138,0.2)' },
  Low:      { bg: 'rgba(74,222,128,0.1)',  text: '#4ade80', border: 'rgba(74,222,128,0.2)' },
  Moderate: { bg: 'rgba(250,204,21,0.1)',  text: '#facc15', border: 'rgba(250,204,21,0.2)' },
  High:     { bg: 'rgba(251,146,60,0.1)',  text: '#fb923c', border: 'rgba(251,146,60,0.2)' },
  Critical: { bg: 'rgba(248,113,113,0.1)', text: '#f87171', border: 'rgba(248,113,113,0.2)' },
};

export function SeverityBadge({ level, className }: { level: string; className?: string }) {
  const s = sevStyles[level] ?? sevStyles.None;
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-bold', className)}
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
      {level}
    </span>
  );
}

// ── Priority Badge ─────────────────────────────────────────────────────────────
const prStyles: Record<string, { bg: string; text: string }> = {
  Low:    { bg: 'rgba(90,122,138,0.15)',   text: '#5a7a8a' },
  Medium: { bg: 'rgba(250,204,21,0.12)',   text: '#facc15' },
  High:   { bg: 'rgba(251,146,60,0.15)',   text: '#fb923c' },
  Urgent: { bg: 'rgba(248,113,113,0.15)',  text: '#f87171' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const s = prStyles[priority] ?? prStyles.Low;
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider"
      style={{ background: s.bg, color: s.text }}>
      {priority}
    </span>
  );
}

// ── Confidence Pill ────────────────────────────────────────────────────────────
export function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? '#4ade80' : pct >= 70 ? '#facc15' : '#fb923c';
  return (
    <span className="text-xs font-bold mono" style={{ color }}>
      {pct}% conf.
    </span>
  );
}

// ── Progress Bar ───────────────────────────────────────────────────────────────
export function ProbBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.min(value * 100, 100);
  const color = pct > 65 ? '#f87171' : pct > 42 ? '#fb923c' : pct > 22 ? '#facc15' : '#4ade80';
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: '#5a7a8a' }}>{label}</span>
          <span className="mono font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
        </div>
      )}
      <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1e2d38' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-base font-bold" style={{ color: '#e2eaf0' }}>{title}</h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#5a7a8a' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────────────────
export function Divider() {
  return <div className="h-px my-6" style={{ background: '#1e2d38' }} />;
}

// ── Health Score Ring ─────────────────────────────────────────────────────────
export function HealthScore({ score, size = 56 }: { score: number; size?: number }) {
  const color = score >= 70 ? '#4ade80' : score >= 50 ? '#facc15' : score >= 35 ? '#fb923c' : '#f87171';
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-full flex items-center justify-center font-black mono"
        style={{ width: size, height: size, background: `${color}18`, border: `2px solid ${color}40`, color, fontSize: size * 0.28 }}>
        {score}
      </div>
    </div>
  );
}

// ── Advisory Card (enterprise) ─────────────────────────────────────────────────
const typeAccent: Record<string, string> = {
  'Water Stress': '#38bdf8',
  'Nutrient Stress': '#4ade80',
  'Salinity Stress': '#facc15',
  'Growth Suppression': '#a78bfa',
  'Delayed Growth': '#fb923c',
  'Poor Recovery': '#f87171',
  'Harvest Readiness': '#fb923c',
  'Chlorophyll Decline': '#34d399',
  'Persistent Underperformance': '#f87171',
  'Irrigation Misalignment': '#38bdf8',
};

const typeIcon: Record<string, string> = {
  'Water Stress': '💧',
  'Nutrient Stress': '🌿',
  'Salinity Stress': '⚗️',
  'Growth Suppression': '📉',
  'Harvest Readiness': '🌾',
  'Chlorophyll Decline': '🍂',
  'Irrigation Misalignment': '🚿',
  'Delayed Growth': '⏳',
  'Poor Recovery': '🔄',
  'Persistent Underperformance': '⚠️',
};

export function AdvisoryCard({ adv, fieldName }: { adv: Advisory; fieldName?: string }) {
  const color = typeAccent[adv.type] ?? '#5a7a8a';
  return (
    <div className="rounded-xl p-5 transition-all hover:scale-[1.005]"
      style={{ background: '#0c1318', border: `1px solid #1e2d38`, borderLeft: `3px solid ${color}` }}>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{typeIcon[adv.type] ?? '📌'}</span>
          <div>
            <p className="text-sm font-bold" style={{ color: '#e2eaf0' }}>{adv.issue}</p>
            {fieldName && <p className="text-xs mt-0.5" style={{ color: '#5a7a8a' }}>Field: {fieldName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SeverityBadge level={adv.severity} />
          <ConfidencePill value={adv.confidence} />
        </div>
      </div>

      {/* Explanation (WHY) */}
      <div className="rounded-lg p-3 mb-3" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color }}>
          Why this advisory was generated
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#e2eaf0' }}>{adv.explanation}</p>
      </div>

      {/* Evidence */}
      <div className="mb-3">
        <p className="text-xs font-bold tracking-wider uppercase mb-2" style={{ color: '#5a7a8a', letterSpacing: '0.1em' }}>Evidence Signals</p>
        <div className="space-y-1">
          {adv.evidence.map((e, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: '#5a7a8a' }}>
              <span className="mt-0.5" style={{ color: '#2d4455' }}>›</span>
              <span>{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="rounded-lg p-3" style={{ background: '#111b22', border: '1px solid #1e2d38' }}>
        <p className="text-xs font-bold tracking-wider uppercase mb-1" style={{ color: '#5a7a8a', letterSpacing: '0.1em' }}>Recommended Action</p>
        <p className="text-xs leading-relaxed" style={{ color: '#e2eaf0' }}>{adv.recommended_action}</p>
      </div>

      {/* Notes + Validation */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {adv.is_recurring && (
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
              ↻ Recurring ({adv.recurrence_count}×)
            </span>
          )}
        </div>
        {adv.ground_validation_required && (
          <p className="text-xs" style={{ color: '#facc15' }}>⚠ Ground validation required</p>
        )}
      </div>
    </div>
  );
}

// ── Index Value Cell ───────────────────────────────────────────────────────────
export function IndexCell({ label, value, expected, desc }: { label: string; value: number; expected?: number; desc?: string }) {
  const dev = expected !== undefined ? ((value - expected) / Math.abs(expected || 0.001)) * 100 : null;
  const devColor = dev === null ? '' : dev >= -5 ? '#4ade80' : dev >= -20 ? '#facc15' : '#f87171';
  return (
    <div className="rounded-lg p-4" style={{ background: '#111b22', border: '1px solid #1e2d38' }}>
      <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#3d5a6a' }}>{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-black mono" style={{ color: '#e2eaf0' }}>{value.toFixed(3)}</p>
        {dev !== null && (
          <span className="text-xs mono font-bold" style={{ color: devColor }}>
            {dev >= 0 ? '+' : ''}{dev.toFixed(1)}%
          </span>
        )}
      </div>
      {expected !== undefined && (
        <p className="text-xs mt-1" style={{ color: '#3d5a6a' }}>Expected: {expected.toFixed(3)}</p>
      )}
      {desc && <p className="text-xs mt-1.5" style={{ color: '#2d4455' }}>{desc}</p>}
    </div>
  );
}

// ── Table styles ───────────────────────────────────────────────────────────────
export const tableStyles = {
  wrapper: { background: '#0c1318', border: '1px solid #1e2d38', borderRadius: '12px', overflow: 'hidden' },
  th: { padding: '12px 16px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#3d5a6a', borderBottom: '1px solid #1e2d38' },
  td: { padding: '12px 16px', fontSize: '13px', color: '#e2eaf0', borderBottom: '1px solid #111b22' },
};
