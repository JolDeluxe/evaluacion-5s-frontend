import { Outlet } from 'react-router';
import { DesktopHeader } from '@/layouts/components/desktop-header';
import { DesktopSidebar } from '@/layouts/components/desktop-sidebar';
import { Footer } from '@/layouts/components/footer';

export function DesktopLayout() {
  return (
    <div className="flex h-dvh overflow-hidden bg-app-surface">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DesktopHeader />
        <main className="min-h-0 flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
