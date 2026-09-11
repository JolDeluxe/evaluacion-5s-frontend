import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PeriodoBadge, PeriodosResumen } from '@/features/administracion/asignaciones/components/estado-asignacion';
import { EstadoBadge } from '@/features/auditorias/shared/components/estado-badge';
import { esFilaEditable, obtenerAuditorMensualDisplay, periodoDetalleTexto } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

function AuditorMensualCell({ fila, anio, mes }) {
  const display = obtenerAuditorMensualDisplay(fila, anio, mes);

  if (display.tipo === 'ALERTA') {
    return (
      <div className="mt-0.5">
        <EstadoBadge estado="SIN_AUDITOR" label="Sin auditor" />
      </div>
    );
  }

  if (display.tipo === 'NEUTRO') {
    return <span className="text-slate-400 font-bold text-sm">—</span>;
  }

  const responsableCumplimiento = fila.responsableCumplimiento;
  const auditorMensualId = fila.auditorMensual?.id;
  const responsableCumplimientoId = fila.responsableCumplimientoId || responsableCumplimiento?.id;
  const esDelegacion = Boolean(
    responsableCumplimientoId &&
    auditorMensualId &&
    responsableCumplimientoId !== auditorMensualId
  );

  return (
    <div>
      <p className="text-sm font-bold text-slate-800">{display.texto}</p>
      {esDelegacion && (
        <span className="inline-block mt-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 text-[11px] font-bold text-indigo-700">
          KPI Responsable: {responsableCumplimiento?.nombre || `Usuario #${responsableCumplimientoId}`}
        </span>
      )}
    </div>
  );
}

function MobileCard({ fila, anio, mes, onEdit }) {
  const asignado = fila.estado === 'ASIGNADO';
  const editable = esFilaEditable(fila, anio, mes);

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-black uppercase text-slate-900 leading-snug">{fila.area.nombre}</h3>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-100/80">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Auditor del mes</p>
          <AuditorMensualCell fila={fila} anio={anio} mes={mes} />
        </div>

        <div className="pt-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Periodos</p>
          <PeriodosResumen fila={fila} />
        </div>
      </div>

      {editable && (
        <div className="pt-2">
          <Button
            className="w-full rounded-xl"
            variant={asignado ? 'outline' : 'default'}
            size="sm"
            icon="edit"
            onClick={() => onEdit(fila)}
          >
            {asignado ? 'Editar auditor' : 'Asignar auditor'}
          </Button>
        </div>
      )}
    </div>
  );
}

function PeriodoCell({ fila, periodo }) {
  const detalle = periodoDetalleTexto(periodo, fila.auditorMensual);

  return (
    <div className="flex flex-col items-start gap-0.5">
      <PeriodoBadge periodo={periodo} auditorMensualNombre={fila.auditorMensual?.nombre} />
      {detalle && <span className="text-[11px] font-semibold text-slate-400 pl-1">{detalle}</span>}
    </div>
  );
}

export function AsignacionesList({ filas = [], anio, mes, onEdit }) {
  return (
    <>
      <Card className="hidden overflow-hidden border-app-border bg-white shadow-sm md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-app-border bg-slate-50/70 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3 text-left">Área</th>
              <th className="px-5 py-3 text-left">Auditor del mes</th>
              <th className="px-5 py-3 text-left">P1</th>
              <th className="px-5 py-3 text-left">P2</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {filas.map((fila) => {
              const asignado = fila.estado === 'ASIGNADO';
              const editable = esFilaEditable(fila, anio, mes);
              return (
                <tr key={fila.area.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-black uppercase text-slate-900 leading-tight">{fila.area.nombre}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">
                    <AuditorMensualCell fila={fila} anio={anio} mes={mes} />
                  </td>
                  <td className="px-5 py-4">
                    <PeriodoCell fila={fila} periodo={fila.periodos.p1} />
                  </td>
                  <td className="px-5 py-4">
                    <PeriodoCell fila={fila} periodo={fila.periodos.p2} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {editable && (
                      <Button
                        variant={asignado ? 'ghost' : 'outline'}
                        size="sm"
                        icon="edit"
                        onClick={() => onEdit(fila)}
                      >
                        {asignado ? 'Editar' : 'Asignar'}
                      </Button>
                    )}
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
        {filas.map((fila) => <MobileCard key={fila.area.id} fila={fila} anio={anio} mes={mes} onEdit={onEdit} />)}
        {!filas.length && (
          <Card className="p-8 text-center border-app-border">
            <p className="text-sm font-semibold text-slate-500">No hay áreas con los filtros aplicados.</p>
          </Card>
        )}
      </div>
    </>
  );
}
