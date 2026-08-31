import { NavLink } from 'react-router';
import { cn } from '@/utils/cn';

export function SectionTabs({ tabs = [], className = '' }) {
  if (!tabs.length) return null;

  return (
    <nav className={cn('flex flex-nowrap overflow-x-auto gap-2 border-b border-app-border custom-scrollbar', className)}>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to || tab.id}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              'whitespace-nowrap border-b-2 px-2 pb-3 text-sm font-black transition-colors',
              isActive
                ? 'border-marca-secundario text-marca-primario'
                : 'border-transparent text-slate-500 hover:text-slate-800',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
