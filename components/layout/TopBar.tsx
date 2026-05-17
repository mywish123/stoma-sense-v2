'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Executive Dashboard', sub: 'Platform-wide intelligence overview' },
  '/fields': { title: 'Field Intelligence', sub: 'All monitored sugarcane fields' },
  '/map': { title: 'Geospatial View', sub: 'Satellite-derived field health map' },
  '/advisories': { title: 'Advisory Engine', sub: 'AI-generated field advisories' },
  '/phenology': { title: 'Phenology Engine', sub: 'Seasonal vegetation trajectory analysis' },
  '/analytics': { title: 'Index Analytics', sub: 'Vegetation index comparison and reference' },
  '/intelligence': { title: 'Yield Intelligence', sub: 'ML-powered TCH prediction and SHAP explanations' },
  '/export': { title: 'Export & Reports', sub: 'Enterprise data export workflows' },
  '/settings': { title: 'Configuration', sub: 'Platform settings and integration management' },
  '/alerts': { title: 'Alert Center', sub: 'High-priority field alerts and notifications' },
};

export default function TopBar() {
  const pathname = usePathname();
  const base = '/' + pathname.split('/')[1];
  const page = PAGE_TITLES[base] ?? { title: 'STOMA SENSE', sub: 'Enterprise Remote Sensing' };

  return (
    <header className="fixed top-0 right-0 z-30 flex items-center justify-between px-8 h-16"
      style={{ left: '260px', background: 'rgba(5,10,14,0.92)', borderBottom: '1px solid #1e2d38', backdropFilter: 'blur(12px)' }}>

      <div>
        <h1 className="text-sm font-bold" style={{ color: '#e2eaf0' }}>{page.title}</h1>
        <p className="text-xs" style={{ color: '#5a7a8a' }}>{page.sub}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Satellite status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ade80' }} />
          <span style={{ color: '#4ade80' }}>SENTINEL-2 · 2025-05-14</span>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
            PS
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium" style={{ color: '#e2eaf0' }}>Dr. Priya Sharma</p>
            <p className="text-xs" style={{ color: '#5a7a8a' }}>Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
