import React from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import { formatPercentTrunc } from '@/utils/format';

const CONFIG_CHIP = {
  A_TIEMPO: {
    label: 'A tiempo',
    icon: 'check_circle',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  TARDE: {
    label: 'Tarde',
    icon: 'schedule',
    classes: 'bg-amber-50 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500',
  },
  NO_REALIZADA: {
    label: 'No realizada',
    icon: 'cancel',
    classes: 'bg-rose-50 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
  },
  PENDIENTE: {
    label: 'Pendiente',
    icon: 'hourglass_empty',
    classes: 'bg-slate-50 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-400',
  },
};

export function CumplimientoChip({ corteInfo }) {
  if (!corteInfo) {
    return <span className="text-xs font-semibold text-slate-400">—</span>;
  }

  const estado = corteInfo.chip || corteInfo.estadoChip;
  const calificacion = corteInfo.calificacion !== undefined ? corteInfo.calificacion : corteInfo.porcentaje;
  const ejecutor = corteInfo.ejecutadoPor || corteInfo.ejecutorReal;
  const esComodinEjecutor = Boolean(corteInfo.esComodin || ejecutor?.esComodin);

  const config = CONFIG_CHIP[estado] || CONFIG_CHIP.PENDIENTE;

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-sm',
          config.classes,
        )}
      >
        <Icon name={config.icon} size="xs" />
        <span>{config.label}</span>
        {calificacion !== null && calificacion !== undefined && (
          <span className="ml-1 border-l border-current/30 pl-1.5 font-black">
            {formatPercentTrunc(calificacion)}
          </span>
        )}
      </span>

      {esComodinEjecutor && (
        <span
          className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black text-purple-700 border border-purple-200"
          title={ejecutadoPor?.nombre ? `Ejecutada por: ${ejecutadoPor.nombre} (Comodín)` : 'Intervención de Comodín'}
        >
          <Icon name="military_tech" size="12px" />
          <span>{ejecutadoPor?.nombre ? `Comodín: ${ejecutadoPor.nombre}` : 'Comodín'}</span>
        </span>
      )}
    </div>
  );
}
