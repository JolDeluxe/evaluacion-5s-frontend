import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const initial = (user?.nombre || user?.nombreUsuario || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-marca-secundario/30"
        aria-expanded={open}
        aria-label="Abrir menú de usuario"
      >
        <span className="hidden text-right sm:block">
          <span className="block text-sm font-semibold leading-tight text-marca-primario">{user?.nombre || user?.nombreUsuario}</span>
          <span className="block text-xs capitalize text-slate-500">{user?.rol?.replace(/_/g, ' ').toLowerCase()}</span>
        </span>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-marca-secundario/20 bg-marca-secundario text-sm font-black text-white shadow-sm">
          {initial}
        </span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size="20px" className="text-slate-600 transition-transform duration-200" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:hidden">
            <p className="text-sm font-semibold text-marca-primario">{user?.nombre || user?.nombreUsuario}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{user?.correo || user?.nombreUsuario}</p>
          </div>
          <div className="py-1">
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Icon name="account_circle" size="20px" className="text-marca-acento" />
              Perfil
            </Link>
            <Button
              type="button"
              onClick={logout}
              variant="ghost"
              icon="logout"
              className="w-full justify-start rounded-none px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-600 hover:translate-y-0 hover:shadow-none"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
