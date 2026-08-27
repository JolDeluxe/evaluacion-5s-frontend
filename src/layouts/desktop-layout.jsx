import { Outlet } from 'react-router';
import { DesktopHeader } from '@/layouts/components/desktop-header';
import { DesktopSidebar } from '@/layouts/components/desktop-sidebar';
import { Footer } from '@/layouts/components/footer';

export function DesktopLayout() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-cuadra-arena text-app-text">
      <div className="relative z-30 h-full shrink-0 shadow-lg">
        <DesktopSidebar />
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <DesktopHeader />
        <main className="min-h-0 flex-1 overflow-y-auto bg-transparent custom-scrollbar">
          <div className="mx-auto w-full max-w-[1680px] px-5 py-5 2xl:px-6">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
