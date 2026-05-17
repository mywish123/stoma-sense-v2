import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#060c10' }}>
      <Sidebar />
      <div style={{ marginLeft:'260px', flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <TopBar />
        <main style={{
          marginTop:'64px',
          flex:1,
          overflowY:'auto',
          overflowX:'hidden',
          padding:'32px 36px 56px',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
