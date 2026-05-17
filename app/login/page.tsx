'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_USERS } from '@/lib/data/dataService';

const ROLE_ICONS: Record<string, string> = {
  Admin: '🛡️',
  Agronomist: '🌿',
  'Mill Manager': '🏭',
  'FPO Operator': '🤝',
  'Field Officer': '📋',
};

const ROLE_DESC: Record<string, string> = {
  Admin: 'Full platform access · All districts · Analytics & configuration',
  Agronomist: 'Field intelligence · Advisory review · Index analytics',
  'Mill Manager': 'Yield intelligence · Harvest readiness · District overview',
  'FPO Operator': 'Portfolio monitoring · Advisory summaries · Alerts',
  'Field Officer': 'Field validation · Ground-truth input · Local reports',
};

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (userId: string) => {
    setSelected(userId);
    setLoading(true);
    // Simulate auth — in production, this hits Supabase Auth
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#050a0e' }}>
      {/* Left panel — hero */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-14 relative overflow-hidden"
        style={{ borderRight: '1px solid #1e2d38' }}>

        {/* Scanline effect */}
        <div className="scanline-container absolute inset-0 pointer-events-none" />

        {/* Background grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
        }} />

        {/* Subtle glow */}
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}>
              🌿
            </div>
            <span className="font-bold tracking-widest text-sm" style={{ color: '#4ade80' }}>STOMA SENSE</span>
            <span style={{ color: '#1e2d38' }}>/</span>
            <span className="text-xs" style={{ color: '#5a7a8a' }}>ENTERPRISE · v2.0</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="relative z-10">
          <h1 className="font-black leading-none mb-6" style={{ fontSize: '3.8rem', letterSpacing: '-0.03em', color: '#e2eaf0' }}>
            Satellite-powered
            <br />
            <span style={{ color: '#4ade80' }}>sugarcane</span>
            <br />
            intelligence.
          </h1>
          <p className="text-base leading-relaxed mb-10" style={{ color: '#5a7a8a', maxWidth: '480px' }}>
            STOMA SENSE V2 is an enterprise remote sensing and AI advisory platform for precision sugarcane monitoring across districts, mills, FPOs, and farm clusters. Sentinel-2 indices. Real-time advisories. ML-powered yield intelligence.
          </p>

          {/* Capability tags */}
          <div className="flex flex-wrap gap-2">
            {['NDVI · NDRE · CIRE · NDWI', 'MULTI-DISTRICT MONITORING', 'ML YIELD PREDICTION', 'ADVISORY ENGINE V2', 'PHENOLOGY ANALYSIS'].map(tag => (
              <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ border: '1px solid #1e2d38', color: '#5a7a8a', letterSpacing: '0.06em' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8" style={{ borderTop: '1px solid #1e2d38' }}>
          {[
            { value: '15', label: 'Fields Monitored' },
            { value: '67.4 ha', label: 'Active Area' },
            { value: '5', label: 'Districts' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-black mono tabular mb-1" style={{ color: '#4ade80' }}>{s.value}</div>
              <div className="text-xs" style={{ color: '#5a7a8a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — role selection */}
      <div className="flex-1 flex flex-col justify-center px-10 lg:px-16 py-12">
        <div className="max-w-[440px] mx-auto w-full">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <span className="font-bold tracking-widest text-sm" style={{ color: '#4ade80' }}>🌿 STOMA SENSE</span>
          </div>

          <p className="text-xs font-bold tracking-widest mb-3 uppercase" style={{ color: '#4ade80', letterSpacing: '0.15em' }}>
            SECURE TENANT ACCESS
          </p>
          <h2 className="font-black mb-2" style={{ fontSize: '2rem', letterSpacing: '-0.02em', color: '#e2eaf0' }}>
            Sign in to continue
          </h2>
          <p className="text-sm mb-10" style={{ color: '#5a7a8a' }}>
            Select a role to preview the platform. Production uses SSO via your organization.
          </p>

          {/* Role list */}
          <div className="space-y-2.5">
            {MOCK_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                disabled={loading}
                className="w-full text-left rounded-xl px-5 py-4 transition-all group flex items-center gap-4"
                style={{
                  background: selected === user.id ? 'rgba(74,222,128,0.08)' : '#0c1318',
                  border: selected === user.id ? '1px solid rgba(74,222,128,0.4)' : '1px solid #1e2d38',
                }}
                onMouseEnter={e => {
                  if (selected !== user.id) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#243542';
                    (e.currentTarget as HTMLButtonElement).style.background = '#111b22';
                  }
                }}
                onMouseLeave={e => {
                  if (selected !== user.id) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2d38';
                    (e.currentTarget as HTMLButtonElement).style.background = '#0c1318';
                  }
                }}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <span>{ROLE_ICONS[user.role]}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm" style={{ color: '#e2eaf0' }}>{user.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold"
                      style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: '#5a7a8a' }}>
                    {user.organization} · {ROLE_DESC[user.role]}
                  </p>
                </div>

                <div className="text-xs font-bold flex-shrink-0" style={{ color: '#243542' }}>
                  {selected === user.id && loading ? (
                    <div className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'rgba(74,222,128,0.3)', borderTopColor: '#4ade80' }} />
                  ) : (
                    <span style={{ color: '#2d4455' }}>›</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '1px solid #1e2d38' }}>
            <p className="text-xs text-center" style={{ color: '#2d4455' }}>
              STOMA SENSE V2 · Enterprise Remote Sensing Intelligence<br />
              Production deployment uses Supabase Auth + PostGIS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
