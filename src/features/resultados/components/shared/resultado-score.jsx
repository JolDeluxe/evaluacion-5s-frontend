import { formatPercentTrunc } from '@/utils/format';
import { getResultadoColor, getResultadoHeatmapStyle } from '@/features/resultados/utils/resultado-colors';
import { cn } from '@/utils/cn';

export function ResultadoScore({ value, empty = '—', heatmap = false, className }) {
  const rule = getResultadoColor(value);

  if (!rule) {
    return (
      <span className={cn('text-sm font-black text-slate-400', className)}>
        {empty}
      </span>
    );
  }

  if (heatmap) {
    return (
      <span
        className={cn(
          'inline-flex min-w-[88px] justify-center rounded-md border border-slate-200 px-2.5 py-1 text-sm font-black',
          className,
        )}
        style={getResultadoHeatmapStyle(value)}
      >
        {formatPercentTrunc(value)}
      </span>
    );
  }

  return (
    <span
      className={cn('text-sm font-black', className)}
      style={{ color: rule.textColor }}
    >
      {formatPercentTrunc(value)}
    </span>
  );
}
