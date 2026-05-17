import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#050a0e' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: '260px' }}>
        <TopBar />
        <main className="flex-1 overflow-auto p-8" style={{ paddingTop: '84px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
