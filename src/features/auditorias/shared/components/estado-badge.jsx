import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';
import { obtenerEstadoVisualAuditoria } from '@/features/auditorias/shared/utils/estados-auditoria';

export const ESTADOS_BADGE_CONFIG = {
  REALIZADA: {
    label: 'Realizada',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dotClass: 'bg-emerald-500',
    icon: 'check_circle',
  },
  REALIZADA_TARDE: {
    label: 'Tarde',
    badgeClass: 'bg-amber-50 border-amber-200 text-amber-700',
    dotClass: 'bg-amber-500',
    icon: 'schedule',
  },
  PENDIENTE: {
    label: 'Pendiente',
    badgeClass: 'bg-slate-50 border-slate-200 text-slate-600',
    dotClass: 'bg-slate-400',
    icon: 'hourglass_empty',
  },
  DISPONIBLE: {
    label: 'Disponible',
    badgeClass: 'bg-emerald-50/90 border-emerald-200 text-emerald-700 shadow-xs',
    dotClass: 'bg-emerald-500',
    icon: 'play_circle',
    isRadar: true,
  },
  ATRASADA: {
    label: 'Atrasada',
    badgeClass: 'bg-rose-50 border-rose-200 text-rose-700 font-black',
    dotClass: 'bg-rose-600',
    icon: 'warning',
  },
  NO_REALIZADA: {
    label: 'No realizada',
    badgeClass: 'bg-rose-50 border-rose-200 text-rose-700',
    dotClass: 'bg-rose-500',
    icon: 'cancel',
  },
  REABIERTA: {
    label: 'Reabierta',
    badgeClass: 'bg-pink-50 border-pink-200 text-pink-700',
    dotClass: 'bg-pink-500',
    icon: 'replay',
  },
  SIN_AUDITOR: {
    label: 'Sin auditor',
    badgeClass: 'bg-rose-50 border-rose-200 text-rose-600',
    dotClass: 'bg-rose-500',
    icon: 'person_off',
  },
  AUN_NO_INICIA: {
    label: 'Aún no inicia',
    badgeClass: 'bg-slate-50 border-slate-200 text-slate-500',
    dotClass: 'bg-slate-400',
    icon: 'schedule',
  },
  INCOMPLETA: {
    label: 'Incompleta',
    badgeClass: 'bg-orange-50 border-orange-200 text-orange-700',
    dotClass: 'bg-orange-500',
    icon: 'warning',
  },
  NO_PROGRAMADA: {
    label: 'No programada',
    badgeClass: 'bg-slate-50 border-slate-200 text-slate-400',
    dotClass: 'bg-slate-300',
    icon: 'remove',
  },
  CANCELADA: {
    label: 'Cancelada',
    badgeClass: 'bg-slate-100 border-slate-200 text-slate-500',
    dotClass: 'bg-slate-400',
    icon: 'close',
  },
  ASIGNADO: {
    label: 'Asignado',
    badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    dotClass: 'bg-emerald-500',
    icon: 'check',
  },
};

/**
 * Componente unificado de badge/pill para mostrar estados de auditorías.
 * 
 * @param {object|string} estado - Puede ser el string de estado ('REALIZADA', 'ATRASADA', etc.) o el objeto auditoria/periodo.
 * @param {string} [label] - Texto opcional para sobrescribir la etiqueta por defecto.
 * @param {boolean} [showIcon] - Muestra icono material en lugar de solo dot.
 * @param {boolean} [showDot] - Muestra el punto redondeado de color (por defecto true).
 * @param {string} [className] - Clases adicionales de estilo.
 */
export function EstadoBadge({
  estado,
  label,
  showIcon = false,
  showDot = true,
  className,
}) {
  const clave = typeof estado === 'object' && estado !== null
    ? obtenerEstadoVisualAuditoria(estado)
    : (ESTADOS_BADGE_CONFIG[estado] ? estado : obtenerEstadoVisualAuditoria({ estado }));

  const config = ESTADOS_BADGE_CONFIG[clave] ?? ESTADOS_BADGE_CONFIG.PENDIENTE;
  const texto = label || config.label;
  const esDisponible = clave === 'DISPONIBLE' || config.isRadar || texto.toLowerCase() === 'disponible';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-tight shadow-xs transition-colors',
        esDisponible
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700 shadow-xs'
          : config.badgeClass,
        className,
      )}
    >
      {showIcon ? (
        <Icon name={config.icon} size="13px" className="shrink-0" />
      ) : showDot ? (
        esDisponible ? (
          <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 duration-1000" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
        ) : (
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotClass)} />
        )
      ) : null}
      <span className="truncate">{texto}</span>
    </span>
  );
}

// Compatibilidad retroactiva con EstadoText
export const EstadoText = EstadoBadge;
