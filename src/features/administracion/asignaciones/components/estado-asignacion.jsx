import { cn } from '@/utils/cn';
import { getPeriodoStatusConfig, periodoDetalleTexto } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function EstadoBadge({ estado }) {
  const asignado = estado === 'ASIGNADO';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold',
        asignado
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-amber-200 bg-amber-50 text-amber-700 font-extrabold',
      )}
    >
      <span>{asignado ? '✓' : '!'}</span>
      <span>{asignado ? 'Asignado' : 'Sin auditor'}</span>
    </span>
  );
}

export function PeriodoBadge({ periodo, auditorMensualNombre }) {
  const config = getPeriodoStatusConfig(periodo, auditorMensualNombre);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs',
        config.badgeClass,
      )}
    >
      <span>{config.icon}</span>
      <span>{config.texto}</span>
    </span>
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
