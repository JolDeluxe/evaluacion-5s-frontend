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
  const esApoyoEjecutor = Boolean(corteInfo.esComodin || corteInfo.esApoyo || ejecutor?.esComodin || ejecutor?.esApoyo);
  const nombreEjecutor = ejecutor?.nombre;
  const textoApoyo = nombreEjecutor ? `Apoyo: ${nombreEjecutor}` : 'Auditor de apoyo';

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

  const tooltipApoyo = esApoyoEjecutor
    ? (nombreEjecutor ? `Realizada por auditor de apoyo: ${nombreEjecutor}` : 'Realizada por auditor de apoyo')
    : null;

  return (
    <div
      className="flex flex-col items-center gap-1 whitespace-nowrap"
      title={tooltipApoyo ? `${tooltipTexto} · ${tooltipApoyo}` : tooltipTexto}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-sm cursor-default whitespace-nowrap shrink-0',
          config.classes,
        )}
        title={tooltipTexto}
      >
        <Icon name={config.icon} size="xs" className="shrink-0" />
        <span className="whitespace-nowrap">{config.label}</span>
        {calificacion !== null && calificacion !== undefined && (
          <span className="ml-1 border-l border-current/30 pl-1.5 font-black whitespace-nowrap">
            {formatPercentTrunc(calificacion)}
          </span>
        )}
      </span>

      {esApoyoEjecutor && (
        <div
          className="flex items-center justify-center gap-1 text-xs text-slate-500 font-medium cursor-default max-w-[150px] truncate whitespace-nowrap mt-0.5"
          title={tooltipApoyo}
        >
          <Icon name="support_agent" size="12px" className="shrink-0 text-slate-400" />
          <span className="truncate">{textoApoyo}</span>
        </div>
      )}
    </div>
  );
}
