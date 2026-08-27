import { cn } from '@/utils/cn';

export const controlBase = 'w-full rounded-lg border bg-white px-3 text-base md:text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none';

export const controlSizes = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
};

export const controlState = ({ error, selected } = {}) => {
  if (error) {
    return 'border-estado-rechazado text-red-900 focus:border-estado-rechazado focus:ring-2 focus:ring-estado-rechazado/15';
  }

  if (selected) {
    return 'border-marca-primario/30 bg-marca-primario/[0.035] text-marca-primario focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20';
  }

  return 'border-app-border hover:border-marca-secundario/45 focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20';
};

export const helperTextClass = (error) => cn(
  'mt-1 px-1 text-xs font-semibold',
  error ? 'text-estado-rechazado' : 'text-app-text-muted',
);
