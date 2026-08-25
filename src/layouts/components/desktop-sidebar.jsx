import { NavLink } from 'react-router';
import { getNavigationByRole } from '@/config/navigation-config';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function DesktopSidebar() {
  const { user } = useAuth();
  const items = getNavigationByRole(user?.rol, 'desktop');

  return (
    <aside className="flex h-dvh w-72 shrink-0 flex-col border-r border-white/60 bg-slate-950 text-white shadow-2xl shadow-slate-950/20">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-200/80">Cuadra</p>
        <h1 className="mt-2 text-3xl font-black leading-none tracking-tight">5S</h1>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        <ul className="space-y-1">
          {items.map((item, index) => {
            if (item.isDivider) {
              return <li key={item.id || index} className="my-4 h-px bg-white/10" />;
            }

            return (
              <li key={item.id}>
                <NavLink
                  to={item.route}
                  end={item.route === '/admin' || item.route === '/inicio'}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
                    isActive
                      ? 'bg-white text-slate-950 shadow-lg shadow-black/20'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon name={item.icon} size="sm" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4 text-[11px] font-semibold leading-5 text-white/45">
        Encuestas / Auditorías 5S
      </div>
    </aside>
  );
}
