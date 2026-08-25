import { Link, useLocation } from 'react-router';
import { getRouteTitle } from '@/config/navigation-config';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function MobileHeader({ onOpenMenu }) {
  const location = useLocation();
  const { user } = useAuth();
  const title = getRouteTitle(location.pathname);
  const initial = (user?.nombre || user?.nombreUsuario || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-sm shadow-slate-950/5 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-900 shadow-sm"
          aria-label="Abrir navegación"
        >
          <Icon name="menu" />
        </button>
        <Link to="/inicio" className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-marca-acento">{title}</p>
          <p className="text-2xl font-black leading-none text-slate-950">5S</p>
        </Link>
        <Link
          to="/perfil"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-sm font-black text-slate-900 shadow-sm"
          aria-label="Perfil"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
