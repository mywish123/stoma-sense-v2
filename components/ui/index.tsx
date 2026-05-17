import { ReactNode } from 'react';
import { Advisory } from '@/types';

// ── Metric Card ────────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  accent?: 'green' | 'red' | 'yellow' | 'blue' | 'orange' | 'default';
}

const ACCENT = {
  green:   { border:'rgba(74,222,128,0.22)',  iconBg:'rgba(74,222,128,0.08)',  val:'#4ade80'  },
  red:     { border:'rgba(248,113,113,0.22)', iconBg:'rgba(248,113,113,0.08)', val:'#f87171'  },
  yellow:  { border:'rgba(250,204,21,0.22)',  iconBg:'rgba(250,204,21,0.08)',  val:'#facc15'  },
  blue:    { border:'rgba(56,189,248,0.22)',  iconBg:'rgba(56,189,248,0.08)',  val:'#38bdf8'  },
  orange:  { border:'rgba(251,146,60,0.22)',  iconBg:'rgba(251,146,60,0.08)',  val:'#fb923c'  },
  default: { border:'#1c2d38',               iconBg:'rgba(255,255,255,0.03)', val:'#dce8f0'  },
};

export function MetricCard({ label, value, sub, trend, accent = 'default' }: MetricCardProps) {
  const a = ACCENT[accent];
  return (
    <div style={{
      background:'#0d1518',
      border:`1px solid ${a.border}`,
      borderRadius:14,
      padding:'20px 22px',
      transition:'transform 0.18s, box-shadow 0.18s',
    }}
    className="card-hover">
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.13em', textTransform:'uppercase', color:'#384e5c', marginBottom:10 }}>
        {label}
      </div>
      <div style={{ fontSize:26, fontWeight:900, color:a.val, letterSpacing:'-0.02em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize:11, color:'#6b8fa0', marginTop:7, lineHeight:1.4 }}>{sub}</div>
      )}
      {trend !== undefined && (
        <div style={{ fontSize:11, fontWeight:700, color: trend >= 0 ? '#4ade80' : '#f87171', marginTop:6 }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last cycle
        </div>
      )}
    </div>
  );
}

// ── Severity Badge ─────────────────────────────────────────────────────────────
const SEV: Record<string, { bg: string; color: string; border: string }> = {
  None:     { bg:'rgba(56,78,92,0.18)',     color:'#6b8fa0', border:'rgba(56,78,92,0.35)'   },
  Low:      { bg:'rgba(74,222,128,0.10)',   color:'#4ade80', border:'rgba(74,222,128,0.25)' },
  Moderate: { bg:'rgba(250,204,21,0.10)',   color:'#facc15', border:'rgba(250,204,21,0.25)' },
  High:     { bg:'rgba(251,146,60,0.12)',   color:'#fb923c', border:'rgba(251,146,60,0.28)' },
  Critical: { bg:'rgba(248,113,113,0.12)',  color:'#f87171', border:'rgba(248,113,113,0.28)'},
};

export function SeverityBadge({ level }: { level: string }) {
  const s = SEV[level] ?? SEV.None;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'2px 8px', borderRadius:5,
      fontSize:10, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase',
      background:s.bg, color:s.color, border:`1px solid ${s.border}`,
      whiteSpace:'nowrap',
    }}>{level}</span>
  );
}

// ── Priority Badge ─────────────────────────────────────────────────────────────
const PRI: Record<string, { bg: string; color: string }> = {
  Low:    { bg:'rgba(56,78,92,0.2)',     color:'#6b8fa0' },
  Medium: { bg:'rgba(250,204,21,0.10)',  color:'#facc15' },
  High:   { bg:'rgba(251,146,60,0.14)',  color:'#fb923c' },
  Urgent: { bg:'rgba(248,113,113,0.14)', color:'#f87171' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const s = PRI[priority] ?? PRI.Low;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center',
      padding:'3px 9px', borderRadius:5,
      fontSize:10, fontWeight:900, letterSpacing:'0.08em', textTransform:'uppercase',
      background:s.bg, color:s.color,
      whiteSpace:'nowrap',
    }}>{priority}</span>
  );
}

// ── Confidence Pill ────────────────────────────────────────────────────────────
export function ConfidencePill({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? '#4ade80' : pct >= 70 ? '#facc15' : '#fb923c';
  return (
    <span style={{ fontSize:11, fontWeight:700, color, fontFamily:'monospace', whiteSpace:'nowrap' }}>
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
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:11, color:'#6b8fa0' }}>{label}</span>
          <span style={{ fontSize:11, fontWeight:700, color, fontFamily:'monospace' }}>{pct.toFixed(1)}%</span>
        </div>
      )}
      <div style={{ height:4, borderRadius:4, background:'#1c2d38', overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:4, width:`${pct}%`, background:color, transition:'width 0.7s' }} />
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
      <div>
        <h2 style={{ fontSize:14, fontWeight:800, color:'#dce8f0', letterSpacing:'-0.01em' }}>{title}</h2>
        {sub && <p style={{ fontSize:11, color:'#6b8fa0', marginTop:2 }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Health Score ───────────────────────────────────────────────────────────────
export function HealthScore({ score, size = 52 }: { score: number; size?: number }) {
  const color = score >= 72 ? '#4ade80' : score >= 52 ? '#facc15' : score >= 36 ? '#fb923c' : '#f87171';
  const fs = Math.round(size * 0.28);
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      border:`2px solid ${color}40`,
      background:`${color}10`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:fs, fontWeight:900, color, flexShrink:0,
      fontVariantNumeric:'tabular-nums',
    }}>
      {score}
    </div>
  );
}

// ── Index Value Cell ───────────────────────────────────────────────────────────
export function IndexCell({ label, value, expected, desc }: { label: string; value: number; expected?: number; desc?: string }) {
  const dev = expected !== undefined ? ((value - expected) / Math.abs(expected || 0.001)) * 100 : null;
  const devColor = dev === null ? '' : dev >= -5 ? '#4ade80' : dev >= -20 ? '#facc15' : '#f87171';
  return (
    <div style={{ background:'#121e25', border:'1px solid #1c2d38', borderRadius:10, padding:'14px 16px' }}>
      <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:8 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
        <span style={{ fontSize:20, fontWeight:900, color:'#dce8f0', fontFamily:'monospace', fontVariantNumeric:'tabular-nums' }}>
          {value.toFixed(3)}
        </span>
        {dev !== null && (
          <span style={{ fontSize:11, fontWeight:700, color:devColor, fontFamily:'monospace' }}>
            {dev >= 0 ? '+' : ''}{dev.toFixed(1)}%
          </span>
        )}
      </div>
      {expected !== undefined && (
        <div style={{ fontSize:10, color:'#384e5c', marginTop:3 }}>Expected: {expected.toFixed(3)}</div>
      )}
      {desc && <div style={{ fontSize:10, color:'#2d4455', marginTop:4, lineHeight:1.4 }}>{desc}</div>}
    </div>
  );
}

// ── Chart Tooltip ─────────────────────────────────────────────────────────────
export function ChartTip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'#0d1518', border:'1px solid #243848',
      borderRadius:9, padding:'10px 14px',
      boxShadow:'0 8px 24px rgba(0,0,0,0.45)',
    }}>
      {label && <div style={{ fontSize:10, color:'#6b8fa0', marginBottom:6 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize:12, fontWeight:700, color:p.color || '#dce8f0', fontFamily:'monospace' }}>
          {p.name}: {typeof p.value === 'number' ? (Math.abs(p.value) < 2 ? p.value.toFixed(3) : p.value.toFixed(1)) : p.value}
        </div>
      ))}
    </div>
  );
}

// ── Page Header ────────────────────────────────────────────────────────────────
export function PageHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase', color:'#4ade80', marginBottom:6 }}>
        {eyebrow}
      </div>
      <h1 style={{ fontSize:26, fontWeight:900, color:'#dce8f0', letterSpacing:'-0.025em', lineHeight:1.15, marginBottom:4 }}>
        {title}
      </h1>
      <p style={{ fontSize:13, color:'#6b8fa0', lineHeight:1.5 }}>{sub}</p>
      <div style={{ height:1, background:'linear-gradient(to right, #1c2d38, transparent)', marginTop:20 }} />
    </div>
  );
}

// ── Advisory Card ─────────────────────────────────────────────────────────────
const TYPE_COLOR: Record<string, string> = {
  'Water Stress':     '#38bdf8',
  'Nutrient Stress':  '#4ade80',
  'Salinity Stress':  '#facc15',
  'Growth Suppression':'#a78bfa',
  'Harvest Readiness':'#fb923c',
  'Delayed Growth':   '#fb923c',
  'Poor Recovery':    '#f87171',
  'Chlorophyll Decline':'#34d399',
  'Irrigation Misalignment':'#38bdf8',
  'Persistent Underperformance':'#f87171',
};

const TYPE_ICON: Record<string, string> = {
  'Water Stress':     '💧',
  'Nutrient Stress':  '🌿',
  'Salinity Stress':  '⚗️',
  'Growth Suppression':'📉',
  'Harvest Readiness':'🌾',
  'Delayed Growth':   '⏳',
  'Poor Recovery':    '🔄',
  'Chlorophyll Decline':'🍂',
  'Irrigation Misalignment':'🚿',
  'Persistent Underperformance':'⚠️',
};

export function AdvisoryCard({ adv, fieldName }: { adv: Advisory; fieldName?: string }) {
  const color = TYPE_COLOR[adv.type] ?? '#6b8fa0';
  return (
    <div style={{
      background:'#0d1518',
      border:'1px solid #1c2d38',
      borderLeft:`3px solid ${color}`,
      borderRadius:12,
      padding:'20px 22px',
      transition:'transform 0.15s, box-shadow 0.15s',
    }} className="card-hover">

      {/* Header row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12, minWidth:0 }}>
          <span style={{ fontSize:20, flexShrink:0, lineHeight:1 }}>{TYPE_ICON[adv.type] ?? '📌'}</span>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#dce8f0', lineHeight:1.3, marginBottom:2 }}>{adv.issue}</div>
            {fieldName && <div style={{ fontSize:11, color:'#6b8fa0' }}>Field: {fieldName}</div>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <SeverityBadge level={adv.severity} />
          <ConfidencePill value={adv.confidence} />
        </div>
      </div>

      {/* WHY explanation box */}
      <div style={{
        borderRadius:8, padding:'12px 14px', marginBottom:14,
        background:`${color}08`, border:`1px solid ${color}20`,
      }}>
        <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color, marginBottom:6 }}>
          Why this advisory was generated
        </div>
        <div style={{ fontSize:12, lineHeight:1.65, color:'#c5d8e0' }}>{adv.explanation}</div>
      </div>

      {/* Evidence */}
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:7 }}>
          Evidence Signals
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {adv.evidence.map((e, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:'#6b8fa0', lineHeight:1.5 }}>
              <span style={{ color:'#384e5c', flexShrink:0, marginTop:2 }}>›</span>
              <span>{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended action */}
      <div style={{ background:'#121e25', border:'1px solid #1c2d38', borderRadius:8, padding:'12px 14px', marginBottom:10 }}>
        <div style={{ fontSize:9, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', color:'#384e5c', marginBottom:6 }}>
          Recommended Action
        </div>
        <div style={{ fontSize:12, lineHeight:1.65, color:'#dce8f0' }}>{adv.recommended_action}</div>
      </div>

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', gap:6 }}>
          {adv.is_recurring && (
            <span style={{
              fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4,
              background:'rgba(248,113,113,0.10)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)',
            }}>↻ Recurring ({adv.recurrence_count}×)</span>
          )}
        </div>
        {adv.ground_validation_required && (
          <span style={{ fontSize:10, fontWeight:700, color:'#facc15' }}>⚠ Ground validation required</span>
        )}
      </div>
    </div>
  );
}
