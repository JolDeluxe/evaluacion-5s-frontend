import { NavLink } from 'react-router';
import { cn } from '@/utils/cn';

const ADMIN_TABS = [
  { id: 'asignaciones', label: 'Asignaciones', to: '/admin/asignaciones' },
  { id: 'formularios', label: 'Formularios', to: '/admin/formularios' },
  { id: 'areas', label: 'Áreas', to: '/admin/areas' },
  { id: 'usuarios', label: 'Usuarios', to: '/admin/usuarios' },
];

export function AdministracionNav({ className = '' }) {
  return (
    <div className="sticky top-0 z-30 !mt-0 -mx-4 px-4 sm:mx-0 sm:px-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs py-1">
      <nav className={cn('grid grid-cols-4 w-full items-center sm:flex sm:w-auto sm:justify-start sm:gap-6 h-10', className)}>
        {ADMIN_TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap border-b-2 px-0.5 sm:px-3 py-2 text-[10px] xs:text-[11px] sm:text-sm font-black uppercase tracking-tighter xs:tracking-tight sm:tracking-wide transition-all text-center sm:text-left min-w-0 flex items-center justify-center sm:inline-block',
                isActive
                  ? 'border-marca-secundario text-marca-primario'
                  : 'border-transparent text-slate-500 hover:text-slate-900',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
