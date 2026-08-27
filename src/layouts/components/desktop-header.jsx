import { Link, useLocation } from 'react-router';
import { getRouteTitle } from '@/config/navigation-config';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { UserMenu } from '@/layouts/components/user-menu';
import { useUIStore } from '@/stores/ui-store';

export function DesktopHeader() {
  const location = useLocation();
  const title = getRouteTitle(location.pathname);
  const { sidebarExpanded } = useUIStore();

  return (
    <header className="sticky top-0 z-[70] border-b border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-3 items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <Icon
            name="fact_check"
            size={!sidebarExpanded ? '32px' : '24px'}
            className="hidden text-marca-acento transition-all duration-300 sm:block"
          />
          <h2 className={`hidden truncate font-normal uppercase text-marca-primario fuente-titulos transition-all duration-300 md:block ${!sidebarExpanded ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'}`}>
            {title}
          </h2>
        </div>

        <div className="flex items-center justify-center">
          <img
            src="/img/01_Cuadra.webp"
            alt="Cuadra"
            className="h-8 w-auto object-contain sm:h-10"
          />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <Button
            as={Link}
            to="/notificaciones"
            variant="icon"
            size="icon"
            icon="notifications"
            className="h-10 w-10 rounded-md border-transparent bg-transparent text-slate-600 shadow-none hover:bg-slate-100 hover:text-marca-primario hover:translate-y-0 hover:shadow-none"
            aria-label="Notificaciones"
          />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
