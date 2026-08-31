import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Select } from '@/components/form/select';
import { MonthPicker } from '@/features/administracion/asignaciones/components/month-picker';
import { AsignacionesList } from '@/features/administracion/asignaciones/components/asignaciones-list';
import { EditarAsignacionModal } from '@/features/administracion/asignaciones/components/editar-asignacion-modal';
import { ESTADOS_ASIGNACION } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

function ResumenAsignaciones({ resumen, autoLoading, onAutoasignar }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <Card><CardBody className="p-4"><p className="text-xs font-black uppercase text-slate-400">Áreas</p><p className="text-2xl font-black text-slate-950">{resumen.areas}</p></CardBody></Card>
      <Card><CardBody className="p-4"><p className="text-xs font-black uppercase text-slate-400">Asignadas</p><p className="text-2xl font-black text-emerald-700">{resumen.asignadas}</p></CardBody></Card>
      <Card><CardBody className="p-4"><p className="text-xs font-black uppercase text-slate-400">Sin auditor</p><p className="text-2xl font-black text-amber-700">{resumen.sinAuditor}</p></CardBody></Card>
      <Card><CardBody className="p-4"><Button className="w-full" icon="auto_fix_high" isLoading={autoLoading} onClick={onAutoasignar}>Autoasignar pendientes</Button></CardBody></Card>
    </div>
  );
}

function FiltrosAsignaciones({ params, auditores, mensaje, onSetParam, onSetSearch }) {
  return (
    <Card className="border-white/70 bg-white/80 shadow-lg shadow-slate-950/5">
      <CardBody className="space-y-3 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_220px]">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icon name="search" size="18px" />
            </span>
            <input
              value={params.q}
              onChange={(event) => onSetSearch('q', event.target.value)}
              placeholder="Buscar por área, código o auditor…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-marca-secundario"
            />
          </div>

          <Select value={params.estado} onChange={(event) => onSetParam('estado', event.target.value)}>
            {ESTADOS_ASIGNACION.map((estado) => <option key={estado.value} value={estado.value}>{estado.label}</option>)}
          </Select>

          <Select value={params.auditor} onChange={(event) => onSetParam('auditor', event.target.value)}>
            <option value="">Todos los auditores</option>
            {auditores.map((auditor) => <option key={auditor.id} value={auditor.id}>{auditor.nombre}</option>)}
          </Select>
        </div>

        {mensaje && <p className="text-sm font-bold text-slate-600">{mensaje}</p>}
      </CardBody>
    </Card>
  );
}

function CargaMes({ auditores }) {
  if (!auditores.length) return null;

  return (
    <Card className="border-white/70 bg-white/75">
      <CardBody className="p-4">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400">Carga del mes</p>
        <div className="flex flex-wrap gap-2">
          {auditores.map((auditor) => (
            <span key={auditor.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
              {auditor.nombre} · {auditor.areasAsignadas} áreas
            </span>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

export function AsignacionesView({
  anio,
  mes,
  params,
  state,
  data,
  editing,
  autoLoading,
  mensaje,
  onPeriodoChange,
  onAutoasignar,
  onSetParam,
  onSetSearch,
  onEdit,
  onCloseEdit,
  onSaved,
  onSaveAsignacion,
  onReabrirAsignacion,
}) {
  return (
    <section className="space-y-5">
      <div className="flex justify-end">
        <MonthPicker anio={anio} mes={mes} onChange={onPeriodoChange} />
      </div>

      {data && (
        <ResumenAsignaciones
          resumen={data.resumen}
          autoLoading={autoLoading}
          onAutoasignar={onAutoasignar}
        />
      )}

      <FiltrosAsignaciones
        params={params}
        auditores={data?.auditores ?? []}
        mensaje={mensaje}
        onSetParam={onSetParam}
        onSetSearch={onSetSearch}
      />

      <CargaMes auditores={data?.auditores ?? []} />

      {state.status === 'loading' && <Spinner />}

      {state.status === 'error' && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>
      )}

      {state.status === 'ready' && (
        <AsignacionesList filas={data?.filas ?? []} onEdit={onEdit} />
      )}

      {editing && (
        <EditarAsignacionModal
          fila={editing}
          auditores={data?.auditores ?? []}
          anio={anio}
          mes={mes}
          onClose={onCloseEdit}
          onSaved={onSaved}
          onSaveAsignacion={onSaveAsignacion}
          onReabrirAsignacion={onReabrirAsignacion}
        />
      )}
    </section>
  );
}
