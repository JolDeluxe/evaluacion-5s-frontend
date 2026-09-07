import { NavLink } from 'react-router';
import { cn } from '@/utils/cn';

export function SectionTabs({ tabs = [], className = '' }) {
  if (!tabs.length) return null;

  return (
    <div className="sticky top-0 z-30 !mt-0 -mx-4 px-4 sm:mx-0 sm:px-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs py-1">
      <nav className={cn('flex flex-nowrap items-center overflow-x-auto gap-2 sm:gap-6 custom-scrollbar h-10', className)}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.to || tab.id}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap border-b-2 px-3 py-2 text-xs sm:text-sm font-black uppercase tracking-wide transition-all shrink-0',
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
