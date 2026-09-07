import { useState } from 'react';
import { Outlet } from 'react-router';
import { MobileBottomNav } from '@/layouts/components/mobile-bottom-nav';
import { MobileHeader } from '@/layouts/components/mobile-header';
import { MobileSidebar } from '@/layouts/components/mobile-sidebar';
import { FloatingScrollControls } from '@/components/ui/floating-scroll-controls';

export function MobileLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-cuadra-arena text-app-text">
      <MobileHeader isMenuOpen={menuOpen} onToggleMenu={toggleMenu} />
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto bg-transparent px-4 pt-0 pb-[calc(7rem+env(safe-area-inset-bottom))] custom-scrollbar">
        <Outlet />
      </main>
      <FloatingScrollControls />
      <MobileBottomNav isMenuOpen={menuOpen} onOpenMore={toggleMenu} />
      <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
