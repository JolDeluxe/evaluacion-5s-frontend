import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EstadoBadge, PeriodosResumen } from '@/features/administracion/asignaciones/components/estado-asignacion';
import { periodoDetalleTexto, periodoTexto } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

function MobileCard({ fila, onEdit }) {
  const asignado = fila.estado === 'ASIGNADO';

  return (
    <div className="rounded-2xl border border-app-border bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black uppercase text-slate-900 leading-snug">{fila.area.nombre}</h3>
        <EstadoBadge estado={fila.estado} />
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Auditor del mes</p>
          <p className="text-sm font-bold text-slate-800">{fila.auditorMensual?.nombre ?? 'Sin auditor'}</p>
        </div>

        <div className="pt-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Periodos</p>
          <PeriodosResumen fila={fila} />
        </div>
      </div>

      <div className="pt-2">
        <Button
          className="w-full"
          variant={asignado ? 'outline' : 'default'}
          size="sm"
          icon="edit"
          onClick={() => onEdit(fila)}
        >
          {asignado ? 'Editar auditor' : 'Asignar auditor'}
        </Button>
      </div>
    </div>
  );
}

function PeriodoCell({ fila, periodo }) {
  const detalle = periodoDetalleTexto(periodo, fila.auditorMensual);
  const texto = periodoTexto(periodo, fila.auditorMensual?.nombre);
  const esVencida = periodo?.vencida;
  const esCompletada = periodo?.estadoAuditoria === 'COMPLETADA';
  const esPendiente = !esCompletada && !esVencida;

  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold ${
          esCompletada
            ? 'text-emerald-700 font-bold'
            : esVencida
              ? 'text-rose-600 font-bold'
              : 'text-slate-600'
        }`}
      >
        <span>{esCompletada ? '✓' : esVencida ? '!' : '•'}</span>
        <span>{texto}</span>
      </span>
      {detalle && <span className="text-[11px] font-medium text-slate-400">{detalle}</span>}
    </div>
  );
}

export function AsignacionesList({ filas = [], onEdit }) {
  return (
    <>
      <Card className="hidden overflow-hidden border-app-border bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-app-border bg-slate-50/70 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Área</th>
              <th className="px-5 py-3 text-left">Auditor del mes</th>
              <th className="px-5 py-3 text-left">Estado</th>
              <th className="px-5 py-3 text-left">P1</th>
              <th className="px-5 py-3 text-left">P2</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {filas.map((fila) => {
              const asignado = fila.estado === 'ASIGNADO';
              return (
                <tr key={fila.area.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-black uppercase text-slate-900 leading-tight">{fila.area.nombre}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">
                    {fila.auditorMensual?.nombre ?? <span className="text-slate-400 font-semibold">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <EstadoBadge estado={fila.estado} />
                  </td>
                  <td className="px-5 py-4">
                    <PeriodoCell fila={fila} periodo={fila.periodos.p1} />
                  </td>
                  <td className="px-5 py-4">
                    <PeriodoCell fila={fila} periodo={fila.periodos.p2} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant={asignado ? 'ghost' : 'outline'}
                      size="sm"
                      icon="edit"
                      onClick={() => onEdit(fila)}
                    >
                      {asignado ? 'Editar' : 'Asignar'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!filas.length && (
          <p className="p-12 text-center text-sm font-semibold text-slate-500">
            No hay áreas con los filtros aplicados.
          </p>
        )}
      </Card>

      <div className="space-y-3 md:hidden">
        {filas.map((fila) => <MobileCard key={fila.area.id} fila={fila} onEdit={onEdit} />)}
        {!filas.length && (
          <Card className="p-8 text-center border-app-border">
            <p className="text-sm font-semibold text-slate-500">No hay áreas con los filtros aplicados.</p>
          </Card>
        )}
      </div>
    </>
  );
}
