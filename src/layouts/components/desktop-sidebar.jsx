import { NavLink, useLocation } from 'react-router';
import { getAdminNavigationByRole, getNavigationByRole, getSystemNavigationByRole } from '@/config/navigation-config';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUIStore } from '@/stores/ui-store';

export function DesktopSidebar() {
  const { user } = useAuth();
  const { sidebarExpanded, toggleSidebar } = useUIStore();
  const location = useLocation();
  const items = getNavigationByRole(user?.rol, 'desktop');
  const getChildren = (item) => {
    if (item.id === 'admin') return getAdminNavigationByRole(user?.rol);
    if (item.id === 'sistema') return getSystemNavigationByRole(user?.rol);
    return [];
  };

  return (
    <aside className={cn(
      'relative flex h-full shrink-0 flex-col bg-marca-secundario text-white transition-[width] duration-300 ease-in-out',
      sidebarExpanded ? 'w-72' : 'w-20',
    )}>
      <div className="sidebar-header relative flex h-20 shrink-0 items-center justify-center border-b border-marca-primario/20 py-6">
        <div className="flex h-full w-full items-center justify-center px-4">
          {sidebarExpanded ? (
            <img
              src="/img/01_Cuadra.webp"
              alt="Cuadra"
              className="sidebar-logo h-10 w-auto object-contain"
            />
          ) : (
            <img
              src="/img/02_Cuadra_C_Logo.webp"
              alt="Cuadra"
              className="sidebar-logo h-8 w-8 object-contain"
            />
          )}
        </div>
        <Tooltip text={sidebarExpanded ? 'Contraer menú' : 'Expandir menú'} position="right">
          <Button
            type="button"
            onClick={toggleSidebar}
            variant="icon"
            size="icon"
            icon={sidebarExpanded ? 'chevron_left' : 'chevron_right'}
            className="absolute -right-3 top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-full border-2 border-marca-primario bg-white p-0 text-marca-primario shadow-md hover:scale-110 hover:-translate-y-1/2 hover:shadow-lg"
            aria-label={sidebarExpanded ? 'Contraer menú' : 'Expandir menú'}
          />
        </Tooltip>
      </div>

      <nav className="sidebar-nav min-h-0 flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
        <ul className="relative space-y-1">
          {items.map((item, index) => {
            if (item.isDivider) {
              return <li key={item.id || index} className="my-4 h-px bg-white/10" />;
            }

            return (
              <li key={item.id}>
                <Tooltip text={item.name} position="right" disabled={sidebarExpanded}>
                  <NavLink
                    to={item.route}
                    end={item.route === '/inicio'}
                    className={({ isActive }) => cn(
                      'sidebar-item-link relative flex min-h-12 w-full items-center gap-3 rounded-sm px-4 py-3 text-sm transition-all duration-200',
                      sidebarExpanded ? 'justify-start' : 'justify-center',
                      isActive
                        ? 'bg-marca-acento text-white font-semibold shadow-lg'
                        : 'text-white/80 hover:bg-marca-primario/30 hover:text-white',
                    )}
                  >
                    <Icon name={item.icon} size="24px" className="sidebar-item-icon shrink-0" />
                    <span className={cn(
                      'whitespace-nowrap text-left transition-all duration-300 ease-in-out',
                      sidebarExpanded ? 'flex-1 translate-x-0 opacity-100' : 'w-0 -translate-x-4 overflow-hidden opacity-0',
                    )}>
                      {item.name}
                    </span>
                  </NavLink>
                </Tooltip>
                {sidebarExpanded && getChildren(item).length > 0 && location.pathname.startsWith(`${item.route}/`) && (
                  <ul className="sidebar-child-list relative mt-1 flex min-h-0 flex-col gap-1 pl-11 pr-2">
                    <div className="sidebar-child-line absolute bottom-2 left-[23px] top-0 w-[1.5px] rounded-full bg-white/10" />
                    {getChildren(item).map((child) => (
                      <li key={child.id}>
                        <NavLink
                          to={child.route}
                          className={({ isActive }) => cn(
                            'sidebar-child-link relative flex min-h-9 items-center gap-2 rounded-sm px-3 py-2 text-sm transition-all duration-200',
                            isActive
                              ? 'bg-white/10 text-marca-acento font-bold shadow-[inset_0_0_8px_rgba(255,255,255,0.05)]'
                              : 'text-white/60 hover:bg-white/5 hover:text-white',
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          <span>{child.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn(
        'sidebar-footer mt-auto flex flex-col items-center border-t border-marca-primario/30 p-4 text-center text-[11px] leading-5 text-white/50 transition-all duration-300',
        sidebarExpanded ? 'opacity-100' : 'hidden opacity-0',
      )}>
        <p className="fuente-titulos whitespace-nowrap text-xl uppercase tracking-wide text-white">Cuadra 5S</p>
        <p className="font-codigo mt-1 rounded-sm bg-marca-primario/50 px-2 py-0.5 text-[10px] text-cuadra-arena shadow-inner">
          v.desarrollo
        </p>
        <p className="mt-3 text-[10px] leading-tight text-white/50">
          Desarrollado por el equipo de <br />
          <span className="font-bold text-white/80">Procesos Tecnológicos</span>
        </p>
      </div>
    </aside>
  );
}
