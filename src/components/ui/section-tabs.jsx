import { NavLink } from 'react-router';
import { cn } from '@/utils/cn';

export function SectionTabs({ tabs = [], className = '', label = 'Secciones' }) {
  if (!tabs.length) return null;

  return (
    <div className="sticky top-0 z-30 min-w-0 w-full py-2">
      <nav
        aria-label={label}
        className={cn(
          'flex w-full min-w-0 items-stretch overflow-hidden rounded-2xl border border-marca-secundario/15 bg-white/95 px-2 shadow-sm shadow-marca-secundario/5 backdrop-blur-xl',
          className,
        )}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.to || tab.id}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-12 min-w-0 flex-1 items-center justify-center whitespace-nowrap px-1.5 py-3 text-center text-[11px] font-bold uppercase leading-5 tracking-normal transition-colors duration-150 after:absolute after:inset-x-2 after:bottom-0 after:h-1 after:rounded-full after:bg-marca-primario after:opacity-0 after:transition-opacity after:duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-marca-primario motion-reduce:transition-none motion-reduce:after:transition-none sm:px-3 sm:text-xs md:min-h-14 md:flex-none md:px-6 md:text-sm',
                isActive
                  ? 'text-marca-primario after:opacity-100'
                  : 'text-slate-500 hover:bg-marca-secundario/5 hover:text-marca-primario',
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
