import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router';
import { getNavigationByRole } from '@/config/navigation-config';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/utils/cn';

export function MobileSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = getNavigationByRole(user?.rol, 'mobile-more');
  const bottomItems = getNavigationByRole(user?.rol, 'mobile-bottom');

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
        className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[6px]"
        onClick={onClose}
        aria-label="Cerrar navegación"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-[min(92vw,24rem)] flex-col overflow-hidden border-l border-white/70 bg-white/72 shadow-2xl shadow-slate-950/25 backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-white/60 px-5 pb-4 pt-[calc(1rem+env(safe-area-inset-top))]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Navegación</p>
            <h2 className="text-2xl font-black text-slate-950">5S</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-900 shadow-sm"
            aria-label="Cerrar menú"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
          <p className="px-2 pb-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">Accesos</p>
          <ul className="space-y-2">
            {[...bottomItems, ...items].map((item, index) => {
              if (item.isDivider) {
                return <li key={item.id || index} className="my-3 h-px bg-slate-200" />;
              }

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.route}
                    end={item.route === '/admin' || item.route === '/inicio'}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-black transition',
                      isActive
                        ? 'border-marca-primario/20 bg-marca-primario text-white shadow-lg shadow-marca-primario/20'
                        : 'border-white/70 bg-white/62 text-slate-700 shadow-sm backdrop-blur-xl',
                    )}
                  >
                    <Icon name={item.icon} />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/60 bg-white/50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-slate-900">
              {(user?.nombre || user?.nombreUsuario || 'U').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{user?.nombre || user?.nombreUsuario}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{user?.rol}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-black text-rose-700"
          >
            <Icon name="logout" size="sm" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
