'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { group: 'OVERVIEW', items: [
    { href: '/dashboard', icon: '⬛', label: 'Executive Dashboard' },
    { href: '/alerts', icon: '🔔', label: 'Alert Center' },
  ]},
  { group: 'INTELLIGENCE', items: [
    { href: '/fields', icon: '🗺️', label: 'Field Intelligence' },
    { href: '/map', icon: '🛰️', label: 'Geospatial View' },
    { href: '/advisories', icon: '📋', label: 'Advisory Engine' },
  ]},
  { group: 'ANALYTICS', items: [
    { href: '/phenology', icon: '📈', label: 'Phenology Engine' },
    { href: '/analytics', icon: '📊', label: 'Index Analytics' },
    { href: '/intelligence', icon: '🤖', label: 'Yield Intelligence' },
  ]},
  { group: 'OPERATIONS', items: [
    { href: '/export', icon: '📤', label: 'Export & Reports' },
    { href: '/settings', icon: '⚙️', label: 'Configuration' },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col"
      style={{ width: '260px', background: '#050a0e', borderRight: '1px solid #1e2d38' }}>

      {/* Logo */}
      <div className="px-6 py-6" style={{ borderBottom: '1px solid #1e2d38' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
            🌿
          </div>
          <div>
            <div className="font-black text-sm tracking-wider" style={{ color: '#4ade80', letterSpacing: '0.1em' }}>
              STOMA SENSE
            </div>
            <div className="text-xs" style={{ color: '#2d4455', letterSpacing: '0.06em' }}>
              ENTERPRISE V2
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map(group => (
          <div key={group.group} className="mb-6">
            <div className="px-3 mb-2 text-xs font-bold tracking-widest" style={{ color: '#2d4455', letterSpacing: '0.14em' }}>
              {group.group}
            </div>
            {group.items.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all"
                  style={{
                    background: active ? 'rgba(74,222,128,0.08)' : 'transparent',
                    color: active ? '#4ade80' : '#5a7a8a',
                    border: active ? '1px solid rgba(74,222,128,0.18)' : '1px solid transparent',
                  }}
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80' }} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status footer */}
      <div className="px-6 py-5" style={{ borderTop: '1px solid #1e2d38' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
          <span className="text-xs font-medium" style={{ color: '#4ade80' }}>Satellite Active</span>
        </div>
        <p className="text-xs" style={{ color: '#2d4455' }}>Last sync: 2025-05-14</p>
        <p className="text-xs" style={{ color: '#2d4455' }}>15 fields · 67.4 ha</p>
      </div>
    </aside>
  );
}
