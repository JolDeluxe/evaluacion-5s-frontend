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
    <nav className={cn('w-full border-b border-app-border', className)}>
      <div className="grid grid-cols-4 sm:flex sm:flex-nowrap sm:justify-start sm:gap-6 w-full">
        {ADMIN_TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap border-b-2 py-2 px-0.5 sm:px-1 text-center sm:text-left font-black transition-colors min-w-0 leading-tight',
                'text-[10px] xs:text-[11px] sm:text-xs md:text-sm',
                isActive
                  ? 'border-marca-secundario text-marca-primario'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
