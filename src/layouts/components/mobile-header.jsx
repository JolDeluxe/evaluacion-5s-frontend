import { Link, useLocation } from 'react-router';
import { getRouteTitle } from '@/config/navigation-config';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function MobileHeader({ onOpenMenu }) {
  const location = useLocation();
  const { user } = useAuth();
  const title = getRouteTitle(location.pathname);
  const initial = (user?.nombre || user?.nombreUsuario || 'U').charAt(0).toUpperCase();

  return (
    <header className="relative z-30 shrink-0 border-b border-white/50 bg-cuadra-arena/70 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-2xl saturate-[150%]">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          onClick={onOpenMenu}
          variant="icon"
          size="icon"
          icon="menu"
          className="h-10 w-10 shrink-0 rounded-xl border-white/50 bg-white/40 text-marca-primario shadow-sm hover:bg-white/60"
          aria-label="Abrir navegación"
        />
        <Link to="/inicio" className="absolute left-1/2 min-w-0 -translate-x-1/2 text-center">
          <img src="/img/01_Cuadra.webp" alt="Cuadra" className="mx-auto h-8 w-auto object-contain drop-shadow-sm" />
          <p className="mt-0.5 max-w-36 truncate text-[10px] font-black uppercase tracking-[0.18em] text-marca-acento">{title}</p>
        </Link>
        <Link
          to="/perfil"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-marca-secundario/20 bg-marca-secundario text-sm font-black text-white shadow-sm transition active:scale-95"
          aria-label="Perfil"
        >
          {initial || <Icon name="person" />}
        </Link>
      </div>
    </header>
  );
}
