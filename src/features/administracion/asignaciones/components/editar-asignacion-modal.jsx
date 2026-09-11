import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Label } from '@/components/form/label';
import { Select } from '@/components/form/select';
import { SelectAuditor } from '@/features/administracion/asignaciones/components/select-auditor';
import { PeriodoBadge } from '@/features/administracion/asignaciones/components/estado-asignacion';
import { ReabrirAsignacionModal } from '@/features/administracion/asignaciones/components/reabrir-asignacion-modal';
import { delegacionesApi } from '@/features/administracion/delegaciones/api/delegaciones-api';
import {
  buildGuardarAsignacionMensualPayload,
  MESES,
  periodoDetalleTexto,
} from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function EditarAsignacionModal({
  fila,
  auditores,
  anio,
  mes,
  onClose,
  onSaved,
  onSaveAsignacion,
  onReabrirAsignacion,
}) {
  const [form, setForm] = useState(() => ({
    auditorMensualId: fila.auditorMensual?.id ?? '',
    responsableCumplimientoId: fila.responsableCumplimiento?.id ?? '',
  }));
  const [delegaciones, setDelegaciones] = useState([]);
  const [cargandoDelegaciones, setCargandoDelegaciones] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reabriendoPeriodo, setReabriendoPeriodo] = useState(null);

  const setField = (key, value) => setForm((actual) => ({ ...actual, [key]: value }));

  const auditorSeleccionado = auditores.find((a) => a.id === Number(form.auditorMensualId)) ?? null;

  useEffect(() => {
    if (!form.auditorMensualId) {
      setDelegaciones([]);
      return;
    }

    let cancelado = false;
    setCargandoDelegaciones(true);

    delegacionesApi
      .listar({ ejecutorId: form.auditorMensualId, activa: true })
      .then((res) => {
        if (!cancelado) {
          const lista = res || [];
          setDelegaciones(lista);
          // Si solo hay 1 delegación, sugerirla automáticamente si no hay selección previa
          setForm((actual) => {
            if (lista.length === 1 && !actual.responsableCumplimientoId) {
              return { ...actual, responsableCumplimientoId: String(lista[0].responsableId) };
            }
            return actual;
          });
        }
      })
      .catch(() => {
        if (!cancelado) setDelegaciones([]);
      })
      .finally(() => {
        if (!cancelado) setCargandoDelegaciones(false);
      });

    return () => {
      cancelado = true;
    };
  }, [form.auditorMensualId]);

  const handleConfirmReabrir = async ({ motivo, auditorMensualId, expectedAuditorId }) => {
    if (!reabriendoPeriodo?.periodo) return;

    setSaving(true);
    setError('');

    try {
      const targetId = reabriendoPeriodo.periodo.asignacionId || 0;
      await onReabrirAsignacion(targetId, {
        motivo,
        auditorMensualId,
        expectedAuditorId,
        objetivoAuditoriaId: reabriendoPeriodo.periodo.objetivoAuditoriaId,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.message || 'No se pudo reabrir el periodo.');
    } finally {
      setSaving(false);
    }
  };

  const guardar = async (event) => {
    event.preventDefault();

    if (!form.auditorMensualId) {
      setError('Selecciona un auditor mensual.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSaveAsignacion(
        fila.area.id,
        buildGuardarAsignacionMensualPayload({ anio, mes, form, expectedAuditorId: fila.auditorMensual?.id }),
      );
      onSaved();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la asignación.');
    } finally {
      setSaving(false);
    }
  };

  const renderPeriodo = (label, periodo) => {
    const detalleAuditor = periodoDetalleTexto(periodo, fila.auditorMensual);
    const esCompletada = periodo?.estadoAuditoria === 'COMPLETADA' || periodo?.realizada;
    const esReabiertaActiva = Boolean(periodo?.reabiertaHasta && new Date(periodo.reabiertaHasta) > new Date());
    const esVencida = periodo?.vencida && !esReabiertaActiva;

    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;
    const mesesDiferencia = (anioActual - anio) * 12 + (mesActual - mes);
    const esReabrible = mesesDiferencia <= 1 && esVencida;

    return (
      <div className="rounded-xl border border-app-border bg-slate-50/70 p-3.5 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{label}</span>
              <PeriodoBadge periodo={periodo} auditorMensualNombre={fila.auditorMensual?.nombre} />
            </div>
            {detalleAuditor && <p className="text-xs font-semibold text-slate-400 mt-0.5">{detalleAuditor}</p>}
          </div>

          {esReabrible && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="lock_open"
              isLoading={saving}
              onClick={() => setReabriendoPeriodo({ nombre: label, periodo })}
            >
              Reabrir periodo
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal isOpen onClose={onClose} className="max-w-xl">
        <ModalHeader onClose={onClose}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">{MESES[mes - 1]} {anio}</p>
            <h2 className="text-xl font-black text-slate-950 uppercase">{fila.area.nombre}</h2>
          </div>
        </ModalHeader>

        <form onSubmit={guardar}>
          <ModalBody className="space-y-4">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>}

            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-500">Auditor del mes</Label>
              <SelectAuditor
                value={form.auditorMensualId}
                onChange={(value) => {
                  setField('auditorMensualId', value);
                  setField('responsableCumplimientoId', '');
                }}
                auditores={auditores}
                responsablesIds={fila.area.responsablesIds}
              />
              <p className="text-xs font-medium text-slate-500">Los periodos no realizados de este mes pasarán al nuevo auditor automáticamente.</p>
            </div>

            {delegaciones.length > 0 && (
              <div className="space-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                <Label className="text-xs font-black uppercase tracking-wider text-indigo-900">
                  Responsable del KPI (Delegación activa)
                </Label>
                <Select
                  value={form.responsableCumplimientoId}
                  onChange={(e) => setField('responsableCumplimientoId', e.target.value)}
                  disabled={cargandoDelegaciones}
                >
                  <option value="">(Por defecto) El mismo auditor asignado</option>
                  {delegaciones.map((d) => (
                    <option key={d.id} value={d.responsableId}>
                      {d.responsable?.nombre || 'Responsable'} ({d.responsable?.nombreUsuario})
                    </option>
                  ))}
                </Select>
                <p className="text-[11px] font-semibold text-indigo-700">
                  {delegaciones.length > 1
                    ? 'Este auditor tiene múltiples delegaciones activas. Debes seleccionar al responsable específico de esta asignación.'
                    : 'Delegación detectada: la ejecución de la auditoría contará para el KPI del responsable seleccionado.'}
                </p>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Estado del mes</p>
              {renderPeriodo('Primer periodo (P1)', fila.periodos.p1)}
              {renderPeriodo('Segundo periodo (P2)', fila.periodos.p2)}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="default" isLoading={saving}>
              Guardar cambios
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {reabriendoPeriodo && (
        <ReabrirAsignacionModal
          fila={fila}
          periodoNombre={reabriendoPeriodo.nombre}
          periodo={reabriendoPeriodo.periodo}
          auditorSeleccionado={auditorSeleccionado}
          auditores={auditores}
          anio={anio}
          mes={mes}
          onClose={() => setReabriendoPeriodo(null)}
          onConfirm={handleConfirmReabrir}
        />
      )}
    </>
  );
}
