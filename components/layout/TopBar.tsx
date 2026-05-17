'use client';
import { usePathname } from 'next/navigation';

const PAGES: Record<string, { title: string; sub: string }> = {
  '/dashboard':   { title: 'Executive Dashboard',   sub: 'Platform-wide field intelligence and stress overview' },
  '/alerts':      { title: 'Alert Center',           sub: 'High-priority field alerts and unresolved stress notifications' },
  '/fields':      { title: 'Field Intelligence',     sub: 'All monitored sugarcane fields with satellite-derived scores' },
  '/map':         { title: 'Geospatial View',         sub: 'Satellite-derived field health and stress layer map' },
  '/advisories':  { title: 'Advisory Engine',         sub: 'AI-generated agronomic advisories with explainability' },
  '/phenology':   { title: 'Phenology Engine',        sub: 'Seasonal vegetation trajectory and anomaly analysis' },
  '/analytics':   { title: 'Index Analytics',         sub: 'Vegetation index comparison, scatter, and reference guide' },
  '/intelligence':{ title: 'Yield Intelligence',      sub: 'ML-powered TCH prediction with SHAP-style feature attribution' },
  '/export':      { title: 'Export & Reports',        sub: 'Enterprise data export, CSV, JSON, and executive summaries' },
  '/settings':    { title: 'Configuration',           sub: 'Satellite source, advisory thresholds, and integration setup' },
};

export default function TopBar() {
  const pathname = usePathname();
  const base = '/' + (pathname.split('/')[1] ?? '');
  const page = PAGES[base] ?? { title: 'STOMA SENSE', sub: 'Enterprise Remote Sensing Intelligence' };

  return (
    <header style={{
      position:'fixed', top:0, right:0, left:'260px',
      height:'64px', zIndex:40,
      background:'rgba(6,12,16,0.95)',
      borderBottom:'1px solid #1c2d38',
      backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center',
      justifyContent:'space-between',
      padding:'0 32px',
    }}>
      {/* Left: page title */}
      <div>
        <h1 style={{ fontSize:15, fontWeight:800, color:'#dce8f0', letterSpacing:'-0.01em', lineHeight:1.2 }}>
          {page.title}
        </h1>
        <p style={{ fontSize:11, color:'#6b8fa0', marginTop:1, lineHeight:1.3 }}>
          {page.sub}
        </p>
      </div>

      {/* Right: satellite pill + avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{
          display:'flex', alignItems:'center', gap:7,
          padding:'5px 12px', borderRadius:8,
          background:'rgba(74,222,128,0.06)',
          border:'1px solid rgba(74,222,128,0.14)',
        }}>
          <span className="dot-live" />
          <span style={{ fontSize:11, fontWeight:700, color:'#4ade80', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>
            SENTINEL-2 · 2025-05-14
          </span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:32, height:32, borderRadius:8, flexShrink:0,
            background:'rgba(74,222,128,0.10)', border:'1px solid rgba(74,222,128,0.2)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:800, color:'#4ade80',
          }}>PS</div>
          <div style={{ lineHeight:1.35 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#dce8f0' }}>Dr. Priya Sharma</div>
            <div style={{ fontSize:10, color:'#6b8fa0' }}>Admin · STOMA SENSE</div>
          </div>
        </div>
      </div>
    </header>
  );
}
