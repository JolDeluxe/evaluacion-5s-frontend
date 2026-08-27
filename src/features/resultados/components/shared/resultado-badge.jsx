import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';
import { getResultadoColor } from '@/features/resultados/utils/resultado-colors';

export function ResultadoBadge({ value, emptyLabel = 'Pendiente', className }) {
  const hasValue = value !== null && value !== undefined && value !== '';
  const rule = hasValue ? getResultadoColor(value) : null;

  return (
    <span
      className={cn(
        'inline-flex min-w-[74px] items-center justify-center rounded-lg border border-slate-200 px-2.5 py-1 text-sm font-black',
        !rule && 'bg-slate-50 text-slate-500',
        className,
      )}
      style={rule ? { backgroundColor: rule.color, color: rule.textColor } : {}}
    >
      {hasValue ? formatPercentTrunc(value) : emptyLabel}
    </span>
  );
}
