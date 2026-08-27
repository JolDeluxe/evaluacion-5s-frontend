import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router';
import { getAdminNavigationByRole, getNavigationByRole, getSystemNavigationByRole } from '@/config/navigation-config';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/utils/cn';

export function MobileSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = getNavigationByRole(user?.rol, 'mobile-more');
  const bottomItems = getNavigationByRole(user?.rol, 'mobile-bottom');
  const getChildren = (item) => {
    if (item.id === 'admin') return getAdminNavigationByRole(user?.rol);
    if (item.id === 'sistema') return getSystemNavigationByRole(user?.rol);
    return [];
  };

  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-marca-primario/30 backdrop-blur-[4px]"
        onClick={onClose}
        aria-label="Cerrar navegación"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-4/5 max-w-sm flex-col overflow-hidden border-l border-white/40 bg-cuadra-arena/70 shadow-[-12px_0_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl saturate-[150%] animate-in slide-in-from-right duration-300">
        <div className="flex shrink-0 items-center justify-between border-b border-marca-primario/10 p-5 pt-[calc(1.25rem+env(safe-area-inset-top))]">
          <div>
            <p className="fuente-titulos text-xl font-normal uppercase tracking-wide text-marca-primario drop-shadow-sm">Navegación</p>
            <p className="text-xs font-semibold text-marca-secundario">Encuestas 5S</p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="icon"
            size="icon"
            icon="close"
            className="h-10 w-10 rounded-xl border-white/50 bg-white/40 text-marca-primario shadow-sm hover:bg-white/60"
            aria-label="Cerrar menú"
          />
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-5 custom-scrollbar">
          <ul className="space-y-2.5">
            {[...bottomItems, ...items].map((item, index) => {
              if (item.isDivider) {
                return <li key={item.id || index} className="my-3 h-px bg-slate-200" />;
              }

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.route}
                    end={item.route === '/inicio'}
                    className={({ isActive }) => cn(
                      'flex min-h-12 items-center gap-4 rounded-lg px-4 py-3.5 text-[15px] font-bold transition active:scale-[0.98]',
                      isActive
                        ? 'border border-white/20 bg-marca-acento text-white shadow-lg shadow-marca-primario/20'
                        : 'text-marca-primario/80 hover:bg-white/20',
                    )}
                  >
                    <Icon name={item.icon} />
                    <span>{item.name}</span>
                  </NavLink>
                  {getChildren(item).length > 0 && (
                    <ul className="mt-1 space-y-1 pl-5">
                      {getChildren(item).map((child) => (
                        <li key={child.id}>
                          <NavLink
                            to={child.route}
                            onClick={onClose}
                            className={({ isActive }) => cn(
                            'flex min-h-10 items-center gap-2 rounded-sm px-3 text-xs font-bold transition',
                            isActive
                              ? 'bg-marca-acento text-white'
                              : 'text-marca-primario/60 hover:bg-white/20 hover:text-marca-primario',
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

        <div className="shrink-0 border-t border-marca-primario/10 bg-white/20 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marca-secundario text-sm font-black text-white">
              {(user?.nombre || user?.nombreUsuario || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-marca-primario">{user?.nombre || user?.nombreUsuario}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-marca-secundario">{user?.rol}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={logout}
            variant="danger"
            icon="logout"
            className="w-full"
          >
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </>
  );
}
