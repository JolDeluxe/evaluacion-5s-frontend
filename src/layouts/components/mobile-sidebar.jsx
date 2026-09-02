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

  // Cerrar al cambiar de ruta
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Listener para tecla Escape
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Bloqueo de scroll del body
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
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" id="mobile-sidebar">
      {/* Backdrop Liquid Glass */}
      <button
        type="button"
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[4px] transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-label="Cerrar navegación"
      />

      {/* Panel Drawer Liquid Glass */}
      <aside className="fixed inset-y-0 right-0 z-50 flex h-dvh w-[82vw] max-w-xs flex-col overflow-hidden border-l border-white/40 bg-white/75 shadow-[-16px_0_40px_rgba(72,43,44,0.18)] backdrop-blur-xl saturate-[160%] animate-in slide-in-from-right duration-300">
        {/* Header con Marca CUADRA */}
        <div className="flex shrink-0 items-center justify-between border-b border-marca-primario/10 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-white/30">
          <div>
            <p className="fuente-titulos text-xl font-normal uppercase tracking-wider text-marca-primario drop-shadow-sm">
              CUADRA
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-marca-acento">
              Encuestas 5S
            </p>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="icon"
            size="icon"
            icon="close"
            className="h-9 w-9 rounded-xl border-white/60 bg-white/50 text-marca-primario shadow-sm hover:bg-white/80 active:scale-95 transition-all"
            aria-label="Cerrar menú"
          />
        </div>

        {/* Navegación Principal */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <ul className="space-y-1.5">
            {[...bottomItems, ...items].map((item, index) => {
              if (item.isDivider) {
                return <li key={item.id || index} className="my-2.5 h-px bg-slate-200/80" />;
              }

              const children = getChildren(item);

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.route}
                    end={item.route === '/inicio'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-11 items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-black transition-all active:scale-[0.98]',
                        isActive
                          ? 'border border-marca-acento/30 bg-marca-acento text-white shadow-md shadow-marca-primario/25'
                          : 'text-marca-primario/80 hover:bg-white/40 hover:text-marca-primario',
                      )
                    }
                  >
                    <Icon name={item.icon} size="20px" className="shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </NavLink>

                  {/* Submenú desplegable (ej. Administración) */}
                  {children.length > 0 && (
                    <ul className="mt-1.5 space-y-1 pl-4 border-l-2 border-marca-acento/20 ml-4">
                      {children.map((child) => (
                        <li key={child.id}>
                          <NavLink
                            to={child.route}
                            onClick={onClose}
                            className={({ isActive }) =>
                              cn(
                                'flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all active:scale-[0.98]',
                                isActive
                                  ? 'bg-marca-acento/15 text-marca-acento font-black border border-marca-acento/20 shadow-sm'
                                  : 'text-slate-600 hover:bg-white/30 hover:text-marca-primario',
                              )
                            }
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                            <span className="truncate">{child.name}</span>
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

        {/* Footer de Usuario */}
        <div className="shrink-0 border-t border-marca-primario/10 bg-white/40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca-secundario text-xs font-black text-white shadow-sm">
              {(user?.nombre || user?.nombreUsuario || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-marca-primario">{user?.nombre || user?.nombreUsuario}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-marca-secundario">{user?.rol}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={logout}
            variant="danger"
            icon="logout"
            className="w-full h-9 text-xs font-black"
          >
            Cerrar sesión
          </Button>
        </div>
      </aside>
    </div>
  );
}
