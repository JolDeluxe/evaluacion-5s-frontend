import { useLocation } from 'react-router';
import { getRouteTitle } from '@/config/navigation-config';
import { Icon } from '@/components/ui/icon';
import { UserMenu } from '@/layouts/components/user-menu';

export function DesktopHeader() {
  const location = useLocation();
  const title = getRouteTitle(location.pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/70 px-6 py-4 shadow-sm shadow-slate-950/5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Encuestas 5S</p>
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white"
            aria-label="Notificaciones"
          >
            <Icon name="notifications" />
          </button>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
