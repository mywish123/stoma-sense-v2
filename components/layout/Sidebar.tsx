'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { group: 'OVERVIEW', items: [
    { href: '/dashboard', label: 'Executive Dashboard' },
    { href: '/alerts',    label: 'Alert Center' },
  ]},
  { group: 'INTELLIGENCE', items: [
    { href: '/fields',     label: 'Field Intelligence' },
    { href: '/map',        label: 'Geospatial View' },
    { href: '/advisories', label: 'Advisory Engine' },
  ]},
  { group: 'ANALYTICS', items: [
    { href: '/phenology',    label: 'Phenology Engine' },
    { href: '/analytics',    label: 'Index Analytics' },
    { href: '/intelligence', label: 'Yield Intelligence' },
  ]},
  { group: 'OPERATIONS', items: [
    { href: '/export',   label: 'Export & Reports' },
    { href: '/settings', label: 'Configuration' },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside style={{
      position:'fixed', left:0, top:0, bottom:0, width:'260px',
      background:'#060c10', borderRight:'1px solid #1c2d38',
      display:'flex', flexDirection:'column', zIndex:50, overflow:'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding:'20px', borderBottom:'1px solid #1c2d38', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{
            width:34, height:34, borderRadius:9, flexShrink:0,
            background:'rgba(74,222,128,0.10)', border:'1px solid rgba(74,222,128,0.22)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:17,
          }}>🌿</div>
          <div>
            <div style={{ fontWeight:900, fontSize:12, letterSpacing:'0.16em', color:'#4ade80', lineHeight:1.3 }}>STOMA SENSE</div>
            <div style={{ fontSize:10, letterSpacing:'0.1em', color:'#2d4455', fontWeight:700, lineHeight:1.3 }}>ENTERPRISE V2</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'10px 10px' }}>
        {NAV.map(g => (
          <div key={g.group} style={{ marginBottom:22 }}>
            <div style={{ padding:'0 10px', marginBottom:5, fontSize:9, fontWeight:800, letterSpacing:'0.18em', color:'#243848', textTransform:'uppercase' }}>
              {g.group}
            </div>
            {g.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href+'/');
              return (
                <Link key={item.href} href={item.href} style={{
                  display:'block',
                  padding:'8px 12px',
                  borderRadius:8, marginBottom:2,
                  textDecoration:'none', fontSize:13,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#4ade80' : '#6b8fa0',
                  background: active ? 'rgba(74,222,128,0.08)' : 'transparent',
                  border:`1px solid ${active ? 'rgba(74,222,128,0.16)' : 'transparent'}`,
                  transition:'all 0.15s',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                }}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status */}
      <div style={{ padding:'14px 20px', borderTop:'1px solid #1c2d38', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
          <span className="dot-live" />
          <span style={{ fontSize:12, fontWeight:700, color:'#4ade80' }}>Satellite Active</span>
        </div>
        <div style={{ fontSize:11, color:'#2d4455', lineHeight:1.65 }}>
          Last sync: 2025-05-14<br/>15 fields · 67.4 ha
        </div>
      </div>
    </aside>
  );
}
