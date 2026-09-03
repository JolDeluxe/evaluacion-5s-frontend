import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Label } from '@/components/form/label';
import { SelectAuditor } from '@/features/administracion/asignaciones/components/select-auditor';
import { MESES } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function ReabrirAsignacionModal({
  fila,
  periodoNombre,
  periodo,
  auditorSeleccionado,
  auditores = [],
  anio,
  mes,
  onClose,
  onConfirm,
}) {
  const auditorReal = fila?.auditorMensual ?? null;
  const requiereSeleccionAuditor = !auditorReal;
  const [auditorFormId, setAuditorFormId] = useState(() => (
    auditorReal ? String(auditorReal.id) : auditorSeleccionado ? String(auditorSeleccionado.id) : ''
  ));
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async (event) => {
    event.preventDefault();
    const finalAuditorId = requiereSeleccionAuditor ? Number(auditorFormId) : auditorReal?.id;

    if (!finalAuditorId) {
      setError('Selecciona un auditor para el área.');
      return;
    }
    if (!motivo.trim()) {
      setError('Ingresa el motivo de la reapertura.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onConfirm({
        motivo: motivo.trim(),
        auditorMensualId: finalAuditorId,
        expectedAuditorId: auditorReal ? auditorReal.id : null,
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'No se pudo reabrir la asignación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-md">
      <ModalHeader onClose={onClose}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">
            {fila.area.nombre} · {MESES[mes - 1]} {anio}
          </p>
          <h2 className="text-xl font-black text-slate-950">
            {requiereSeleccionAuditor ? 'Asignar auditor para reabrir periodo' : `Reabrir ${periodoNombre}`}
          </h2>
        </div>
      </ModalHeader>

      <form onSubmit={handleConfirm}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">
              {requiereSeleccionAuditor ? 'Asignación requerida' : 'Reapertura de periodo'}
            </p>
            <p className="font-medium text-slate-600">
              {requiereSeleccionAuditor
                ? `Este mes no tiene un auditor asignado. Selecciona quién será el auditor de ${fila.area.nombre} para ${MESES[mes - 1]} de ${anio}. Al confirmar, el periodo ${periodoNombre} se reabrirá para ese auditor.`
                : 'Se otorgarán días de gracia hábiles para que el auditor pueda realizar la auditoría de este periodo.'}
            </p>
          </div>

          <div>
            <Label>Auditor del mes</Label>
            {requiereSeleccionAuditor ? (
              <SelectAuditor
                value={auditorFormId}
                onChange={setAuditorFormId}
                auditores={auditores}
                responsablesIds={fila.area.responsablesIds}
              />
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-900">
                {auditorReal.nombre}
              </div>
            )}
            <p className="mt-1 text-xs font-medium text-slate-500">
              {requiereSeleccionAuditor
                ? 'El auditor seleccionado será asignado al área para este mes.'
                : 'Este periodo se habilitará para el auditor del mes.'}
            </p>
          </div>

          <div>
            <Label htmlFor="motivo-reapertura">Motivo de reapertura</Label>
            <textarea
              id="motivo-reapertura"
              rows={3}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explica brevemente la razón por la cual se reabre este periodo..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-marca-secundario"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="cancelar" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="guardar"
            isLoading={submitting}
            disabled={(requiereSeleccionAuditor && !auditorFormId) || !motivo.trim()}
          >
            {requiereSeleccionAuditor ? 'Asignar y reabrir' : 'Confirmar reapertura'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}