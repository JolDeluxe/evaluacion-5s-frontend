import { cn } from '@/utils/cn';
import { EstadoBadge } from '@/features/auditorias/shared/components/estado-badge';
import { obtenerEstadoVisualAuditoria } from '@/features/auditorias/shared/utils/estados-auditoria';
import { periodoDetalleTexto } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function EstadoBadgeAsignacion({ estado }) {
  const asignado = estado === 'ASIGNADO';
  return (
    <EstadoBadge
      estado={asignado ? 'ASIGNADO' : 'SIN_AUDITOR'}
      label={asignado ? 'Asignado' : 'Sin auditor'}
    />
  );
}

export function PeriodoBadge({ periodo, auditorMensualNombre }) {
  if (!periodo || periodo.programada === false) {
    return <EstadoBadge estado="NO_PROGRAMADA" label="No programada" />;
  }

  const tieneAuditor = Boolean(periodo.auditorEfectivo?.nombre || auditorMensualNombre);
  const estadoVisual = obtenerEstadoVisualAuditoria({
    ...periodo,
    auditorEfectivo: tieneAuditor ? (periodo.auditorEfectivo || { nombre: auditorMensualNombre }) : null,
  });

  return (
    <EstadoBadge estado={estadoVisual} />
  );
}

export function PeriodosResumen({ fila }) {
  const renderPeriodo = (label, periodo) => {
    const detalle = periodoDetalleTexto(periodo, fila.auditorMensual);

    return (
      <div className="flex items-center justify-between py-1.5 border-b border-slate-100/80 last:border-0">
        <span className="text-xs font-black uppercase tracking-wide text-slate-700">{label}</span>
        <div className="flex flex-col items-end gap-0.5">
          <PeriodoBadge periodo={periodo} auditorMensualNombre={fila.auditorMensual?.nombre} />
          {detalle && <p className="text-[11px] font-semibold text-slate-400">{detalle}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-0.5">
      {renderPeriodo('P1', fila.periodos.p1)}
      {renderPeriodo('P2', fila.periodos.p2)}
    </div>
  );
}

// Compatibilidad hacia atrás si algún componente importa EstadoBadge desde aquí
export { EstadoBadgeAsignacion as EstadoBadge };

