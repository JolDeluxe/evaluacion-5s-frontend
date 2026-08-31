import { Button } from '@/components/ui/button';
import { EstadoBadge, PeriodosResumen } from '@/features/administracion/asignaciones/components/estado-asignacion';

function MobileCard({ fila, onEdit }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-black leading-snug text-slate-950">{fila.area.nombre}</h3>
        </div>
        <EstadoBadge estado={fila.estado} excepcion={fila.tieneExcepcion} />
      </div>

      <div className="mt-3 grid gap-2 text-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Auditor</p>
          <p className="font-bold text-slate-800">{fila.auditorMensual?.nombre ?? 'Sin auditor'}</p>
        </div>
        <PeriodosResumen fila={fila} />
      </div>

      <Button className="mt-3 w-full" variant="outline" icon="edit" onClick={() => onEdit(fila)}>
        {fila.estado === 'ASIGNADO' ? 'Editar' : 'Asignar'}
      </Button>
    </div>
  );
}

export function AsignacionesList({ filas = [], onEdit }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Área</th>
              <th className="px-4 py-3 text-left">Auditor</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Periodos</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filas.map((fila) => (
              <tr key={fila.area.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-black text-slate-950">{fila.area.nombre}</p>
                </td>
                <td className="px-4 py-3 font-bold text-slate-700">{fila.auditorMensual?.nombre ?? '—'}</td>
                <td className="px-4 py-3"><EstadoBadge estado={fila.estado} excepcion={fila.tieneExcepcion} /></td>
                <td className="px-4 py-3"><PeriodosResumen fila={fila} /></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="outline" size="sm" icon="edit" onClick={() => onEdit(fila)}>
                    {fila.estado === 'ASIGNADO' ? 'Editar' : 'Asignar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filas.length && <p className="p-8 text-center text-sm font-bold text-slate-500">No hay áreas con los filtros aplicados.</p>}
      </div>

      <div className="space-y-3 md:hidden">
        {filas.map((fila) => <MobileCard key={fila.area.id} fila={fila} onEdit={onEdit} />)}
        {!filas.length && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">No hay áreas con los filtros aplicados.</p>}
      </div>
    </>
  );
}
