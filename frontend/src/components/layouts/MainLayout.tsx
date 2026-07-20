import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BreadcrumbBar } from './BreadcrumbBar';
import { useSidebar } from '@/contexts/SidebarContext';

export function MainLayout() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width top header */}
      <Header />

      {/* Sidebar */}
      <Sidebar />

      {/* Breadcrumb + page title bar (fixed, offset by sidebar) */}
      <BreadcrumbBar />

      {/* Main content
          top-14  = 56px header
          h-9     = 36px breadcrumb row
          py-3    = 12px + 12px + ~24px title = ~60px title area
          Total   ≈ 56 + 36 + 60 = 152px
      */}
      <main
        className="min-h-screen transition-all duration-300"
        style={{
          marginLeft: isCollapsed ? 72 : 260,
          paddingTop: 124,
        }}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
