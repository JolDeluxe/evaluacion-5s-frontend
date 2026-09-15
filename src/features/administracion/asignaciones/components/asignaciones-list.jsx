import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PeriodoBadge, PeriodosResumen } from '@/features/administracion/asignaciones/components/estado-asignacion';
import { EstadoBadge } from '@/features/auditorias/shared/components/estado-badge';
import {
  buildGuardarAsignacionMensualPayload,
  esFilaEditable,
  obtenerAuditorMensualDisplay,
  periodoDetalleTexto,
} from '@/features/administracion/asignaciones/utils/asignaciones-utils';

function buscarAuditores(auditores, busqueda, responsablesIds = [], selectedId = null) {
  const q = busqueda.trim().toLowerCase();

  return auditores
    .filter((auditor) => {
      if (selectedId && auditor.id === selectedId) return true;
      if (responsablesIds.includes(auditor.id)) return false;
      if (auditor.puedeSerAsignadoAuditoria === false) return false;
      return true;
    })
    .filter((auditor) => {
      if (!q) return true;
      const texto = [auditor.nombre, auditor.nombreUsuario, auditor.correo]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return texto.includes(q);
    });
}

function AuditorInlineAssigner({ fila, auditores, anio, mes, onSaveAsignacion, onSaved }) {
  const auditorActual = fila.auditorMensual ?? null;
  const [busqueda, setBusqueda] = useState(auditorActual?.nombre ?? '');
  const [seleccionado, setSeleccionado] = useState(auditorActual);
  const [abierto, setAbierto] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const responsablesIds = useMemo(() => fila.area.responsablesIds ?? [], [fila.area.responsablesIds]);

  const resultados = useMemo(
    () => buscarAuditores(auditores, busqueda, responsablesIds, auditorActual?.id),
    [auditorActual?.id, auditores, busqueda, responsablesIds],
  );

  const cambioPendiente = Boolean(seleccionado?.id && seleccionado.id !== auditorActual?.id);

  const guardar = async () => {
    if (!seleccionado?.id) {
      setError('Selecciona un auditor.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSaveAsignacion(
        fila.area.id,
        buildGuardarAsignacionMensualPayload({
          anio,
          mes,
          form: {
            auditorMensualId: seleccionado.id,
            responsableCumplimientoId: '',
          },
          expectedAuditorId: auditorActual?.id,
        }),
      );
      onSaved();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la asignación.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="search"
          value={busqueda}
          onFocus={() => {
            if (!seleccionado) setAbierto(true);
          }}
          onBlur={() => {
            setTimeout(() => setAbierto(false), 150);
          }}
          onChange={(event) => {
            setBusqueda(event.target.value);
            setSeleccionado(null);
            setAbierto(true);
            setError('');
          }}
          placeholder="Selecciona o busca auditor..."
          className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-marca-secundario focus:ring-1 focus:ring-marca-secundario"
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            setSeleccionado(null);
            setAbierto((actual) => !actual);
          }}
          className="absolute inset-y-0 right-2 flex items-center text-slate-400 hover:text-slate-600"
          aria-label="Mostrar auditores disponibles"
        >
          ▾
        </button>
        {abierto && !seleccionado && (
          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-72 min-w-[260px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-2xl">
            {resultados.length === 0 ? (
              <p className="px-2 py-2 text-xs font-semibold text-slate-400">Sin coincidencias</p>
            ) : (
              resultados.map((auditor) => (
                <button
                  key={auditor.id}
                  type="button"
                  onClick={() => {
                    setSeleccionado(auditor);
                    setBusqueda(auditor.nombre);
                    setAbierto(false);
                  }}
                  className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-slate-50"
                >
                  <span className="block font-black text-slate-800">{auditor.nombre}</span>
                  {auditor.nombreUsuario && (
                    <span className="block font-semibold text-slate-400">@{auditor.nombreUsuario}</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={auditorActual ? 'outline' : 'default'}
          icon="save"
          onClick={guardar}
          isLoading={saving}
          disabled={!cambioPendiente || saving}
          className="h-8 px-3 text-xs"
        >
          Guardar
        </Button>
        {auditorActual && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            icon="edit"
            onClick={() => {
              setSeleccionado(null);
              setBusqueda('');
              setAbierto(true);
              setError('');
            }}
            className="h-8 px-2 text-xs text-slate-500"
          >
            Cambiar
          </Button>
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-rose-600">{error}</p>}
    </div>
  );
}

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

function MobileCard({ fila, anio, mes, auditores, onEdit, onSaveAsignacion, onSaved }) {
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
          {editable ? (
            <AuditorInlineAssigner
              fila={fila}
              auditores={auditores}
              anio={anio}
              mes={mes}
              onSaveAsignacion={onSaveAsignacion}
              onSaved={onSaved}
            />
          ) : (
            <AuditorMensualCell fila={fila} anio={anio} mes={mes} />
          )}
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
            Opciones avanzadas
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

export function AsignacionesList({
  filas = [],
  anio,
  mes,
  auditores = [],
  onEdit,
  onSaveAsignacion,
  onSaved,
}) {
  return (
    <>
      <Card className="hidden overflow-visible border-app-border bg-white shadow-sm md:block">
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
                <tr key={fila.area.id} className="relative transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-black uppercase text-slate-900 leading-tight">{fila.area.nombre}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800">
                    {editable ? (
                      <AuditorInlineAssigner
                        fila={fila}
                        auditores={auditores}
                        anio={anio}
                        mes={mes}
                        onSaveAsignacion={onSaveAsignacion}
                        onSaved={onSaved}
                      />
                    ) : (
                      <AuditorMensualCell fila={fila} anio={anio} mes={mes} />
                    )}
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
                        Opciones
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
        {filas.map((fila) => (
          <MobileCard
            key={fila.area.id}
            fila={fila}
            anio={anio}
            mes={mes}
            auditores={auditores}
            onEdit={onEdit}
            onSaveAsignacion={onSaveAsignacion}
            onSaved={onSaved}
          />
        ))}
        {!filas.length && (
          <Card className="p-8 text-center border-app-border">
            <p className="text-sm font-semibold text-slate-500">No hay áreas con los filtros aplicados.</p>
          </Card>
        )}
      </div>
    </>
  );
}
