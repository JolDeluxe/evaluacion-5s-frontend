import React from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import { formatPercentTrunc } from '@/utils/format';

const CONFIG_CHIP = {
  A_TIEMPO: {
    label: 'A tiempo',
    icon: 'check_circle',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  TARDE: {
    label: 'Tarde',
    icon: 'schedule',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500',
  },
  NO_REALIZADA: {
    label: 'No realizada',
    icon: 'cancel',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
    dotClass: 'bg-rose-500',
  },
  PENDIENTE: {
    label: 'Pendiente',
    icon: 'hourglass_empty',
    classes: 'bg-slate-50 text-slate-600 border-slate-200',
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

  let tooltipTexto = config.label;
  if (estado === 'TARDE' || corteInfo.realizadaATiempo === false) {
    tooltipTexto = 'Completada en periodo de gracia (Tarde)';
  } else if (estado === 'A_TIEMPO') {
    tooltipTexto = 'Completada a tiempo en periodo ordinario';
  } else if (estado === 'NO_REALIZADA') {
    tooltipTexto = 'Auditoría vencida sin completar';
  } else if (estado === 'PENDIENTE') {
    tooltipTexto = 'Pendiente de realizar';
  }

  const tooltipComodin = esComodinEjecutor
    ? (ejecutor?.nombre ? `Ejecutada por Comodín: ${ejecutor.nombre}` : 'Ejecutada por Comodín')
    : null;

  return (
    <div className="flex flex-col items-center gap-1" title={tooltipComodin ? `${tooltipTexto} · ${tooltipComodin}` : tooltipTexto}>
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-sm cursor-default',
          config.classes,
        )}
        title={tooltipTexto}
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
          className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black text-purple-700 border border-purple-200 cursor-default"
          title={tooltipComodin}
        >
          <Icon name="military_tech" size="12px" />
          <span>{ejecutor?.nombre ? `Comodín: ${ejecutor.nombre}` : 'Comodín'}</span>
        </span>
      )}
    </div>
  );
}
