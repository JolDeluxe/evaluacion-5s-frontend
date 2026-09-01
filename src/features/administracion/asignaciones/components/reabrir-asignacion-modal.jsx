import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Label } from '@/components/form/label';
import { MESES } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function ReabrirAsignacionModal({
  fila,
  periodoNombre,
  periodo,
  auditorSeleccionado,
  anio,
  mes,
  onClose,
  onConfirm,
}) {
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async (event) => {
    event.preventDefault();
    if (!auditorSeleccionado) {
      setError('Selecciona primero un auditor para reabrir este periodo.');
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
        auditorMensualId: auditorSeleccionado.id,
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
          <h2 className="text-xl font-black text-slate-950">Reabrir {periodoNombre}</h2>
        </div>
      </ModalHeader>

      <form onSubmit={handleConfirm}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
            <p className="font-black uppercase tracking-wider text-amber-800">Atención</p>
            <p className="mt-1 font-semibold leading-relaxed">
              Este periodo se encuentra vencido. Al reabrirlo se otorgarán días de gracia hábiles para que el auditor pueda realizar la auditoría.
            </p>
          </div>

          <div>
            <Label>Auditor que realizará la auditoría</Label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-black text-slate-900">
              {auditorSeleccionado ? auditorSeleccionado.nombre : 'Sin auditor seleccionado'}
            </div>
            {!auditorSeleccionado && (
              <p className="mt-1 text-xs font-bold text-red-600">
                Selecciona primero un auditor en la ventana anterior.
              </p>
            )}
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
            disabled={!auditorSeleccionado || !motivo.trim()}
          >
            Confirmar reapertura
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}