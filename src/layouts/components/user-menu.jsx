import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
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
        className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-3 py-2 shadow-sm backdrop-blur-xl transition hover:bg-white"
      >
        <span className="hidden text-right sm:block">
          <span className="block text-sm font-black leading-tight text-slate-900">{user?.nombre || user?.nombreUsuario}</span>
          <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{user?.rol}</span>
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-marca-primario text-sm font-black text-white">
          {initial}
        </span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size="sm" className="text-slate-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-2xl shadow-slate-950/15 backdrop-blur-2xl">
          <div className="border-b border-slate-200/70 px-4 py-4">
            <p className="font-black text-slate-950">{user?.nombre || user?.nombreUsuario}</p>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500">{user?.correo || user?.nombreUsuario}</p>
          </div>
          <div className="p-2">
            <Link
              to="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <Icon name="account_circle" size="sm" />
              Perfil
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-bold text-rose-700 transition hover:bg-rose-50"
            >
              <Icon name="logout" size="sm" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
