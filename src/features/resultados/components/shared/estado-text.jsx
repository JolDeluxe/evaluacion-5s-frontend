import { cn } from '@/utils/cn';

const estadoConfig = {
  REALIZADA: {
    label: 'Realizada',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  PENDIENTE: {
    label: 'Pendiente',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
  },
  INCOMPLETA: {
    label: 'Incompleta',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
  },
  NO_REALIZADA: {
    label: 'No realizada',
    dot: 'bg-rose-500',
    text: 'text-rose-700',
  },
};

export function EstadoText({ estado, label, className }) {
  const config = estadoConfig[estado] ?? estadoConfig.PENDIENTE;

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm font-black', config.text, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {label || config.label}
    </span>
  );
}
