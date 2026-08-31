import { cn } from '@/utils/cn';
import { periodoTexto } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function EstadoBadge({ estado, excepcion }) {
  const asignado = estado === 'ASIGNADO';

  return (
    <div className="flex flex-wrap gap-1">
      <span className={cn(
        'inline-flex rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wide',
        asignado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      )}>
        {asignado ? 'Asignado' : 'Sin auditor'}
      </span>

      {excepcion && (
        <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-blue-700">
          P2 modificado
        </span>
      )}
    </div>
  );
}

export function PeriodosResumen({ fila }) {
  return (
    <div className="space-y-1 text-xs font-bold text-slate-600">
      <p>P1: {periodoTexto(fila.periodos.p1, fila.auditorMensual?.nombre)}</p>
      <p>
        P2: {periodoTexto(fila.periodos.p2, fila.auditorMensual?.nombre)}
        {fila.periodos.p2?.programada && !fila.periodos.p2.usaAuditorMensual && fila.periodos.p2.auditorEfectivo ? ' · Excepción' : ''}
      </p>
    </div>
  );
}
