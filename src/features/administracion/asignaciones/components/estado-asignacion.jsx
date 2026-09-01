import { cn } from '@/utils/cn';
import { periodoDetalleTexto, periodoTexto } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

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

export function PeriodosResumen({ fila }) {
  const renderPeriodo = (label, periodo) => {
    const detalle = periodoDetalleTexto(periodo, fila.auditorMensual);
    return (
      <div>
        <p>{label}: {periodoTexto(periodo, fila.auditorMensual?.nombre)}</p>
        {detalle && <p className="text-[11px] text-slate-400">{detalle}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-1 text-xs font-bold text-slate-600">
      {renderPeriodo('P1', fila.periodos.p1)}
      {renderPeriodo('P2', fila.periodos.p2)}
    </div>
  );
}
