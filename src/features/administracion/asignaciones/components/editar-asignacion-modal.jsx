import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Label } from '@/components/form/label';
import { SelectAuditor } from '@/features/administracion/asignaciones/components/select-auditor';
import { ReabrirAsignacionModal } from '@/features/administracion/asignaciones/components/reabrir-asignacion-modal';
import {
  buildGuardarAsignacionMensualPayload,
  MESES,
  periodoDetalleTexto,
  periodoTexto,
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
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reabriendoPeriodo, setReabriendoPeriodo] = useState(null);

  const setField = (key, value) => setForm((actual) => ({ ...actual, [key]: value }));

  const auditorSeleccionado = auditores.find((a) => a.id === Number(form.auditorMensualId)) ?? null;

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
    const esCompletada = periodo?.estadoAuditoria === 'COMPLETADA';
    const esVencida = periodo?.vencida;

    return (
      <div className="rounded-xl border border-app-border bg-slate-50/70 p-3.5 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{label}</span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold ${
                  esCompletada
                    ? 'text-emerald-700'
                    : esVencida
                      ? 'text-rose-600 font-extrabold'
                      : 'text-slate-600'
                }`}
              >
                <span>{esCompletada ? '✓' : esVencida ? '!' : '•'}</span>
                <span>{periodoTexto(periodo, fila.auditorMensual?.nombre)}</span>
              </span>
            </div>
            {detalleAuditor && <p className="text-xs font-semibold text-slate-400 mt-0.5">{detalleAuditor}</p>}
          </div>

          {periodo?.vencida && (
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
                onChange={(value) => setField('auditorMensualId', value)}
                auditores={auditores}
                responsablesIds={fila.area.responsablesIds}
              />
              <p className="text-xs font-medium text-slate-500">Los periodos no realizados de este mes pasarán al nuevo auditor automáticamente.</p>
            </div>

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
