import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { SelectAuditor } from '@/features/administracion/asignaciones/components/select-auditor';
import {
  buildGuardarAsignacionMensualPayload,
  MESES,
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
    p1UsaMensual: fila.periodos.p1?.usaAuditorMensual !== false,
    p2UsaMensual: fila.periodos.p2?.usaAuditorMensual !== false,
    p1AuditorId: fila.periodos.p1?.auditorEfectivo?.id ?? '',
    p2AuditorId: fila.periodos.p2?.auditorEfectivo?.id ?? '',
    p1Motivo: fila.periodos.p1?.motivoExcepcion ?? '',
    p2Motivo: fila.periodos.p2?.motivoExcepcion ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((actual) => ({ ...actual, [key]: value }));
  const p1Bloqueada = fila.periodos.p1?.bloqueada;
  const p2Bloqueada = fila.periodos.p2?.bloqueada;

  const reabrirPeriodo = async (periodo) => {
    const motivo = window.prompt('Motivo de la reapertura');
    if (!motivo?.trim()) return;

    setSaving(true);
    setError('');

    try {
      await onReabrirAsignacion(periodo.asignacionId, { motivo });
      onSaved();
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
        buildGuardarAsignacionMensualPayload({ anio, mes, form }),
      );
      onSaved();
    } catch (err) {
      setError(err?.message || 'No se pudo guardar la asignación.');
    } finally {
      setSaving(false);
    }
  };

  const renderPeriodo = (key, label, periodo, bloqueada) => (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-black text-slate-950">{label}</p>
          {!periodo?.programada && <p className="text-xs font-bold text-slate-500">No programada para esta área.</p>}
          {bloqueada && <p className="text-xs font-bold text-red-600">{periodo.realizada ? 'Realizada · bloqueada' : 'Vencida · bloqueada'}</p>}
        </div>

        {periodo?.vencida && periodo.asignacionId && (
          <Button type="button" variant="outline" size="sm" icon="lock_open" isLoading={saving} onClick={() => reabrirPeriodo(periodo)}>
            Reabrir
          </Button>
        )}

        {periodo?.programada && (
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form[`${key}UsaMensual`]}
              disabled={bloqueada}
              onChange={(event) => setField(`${key}UsaMensual`, event.target.checked)}
            />
            Usar auditor mensual
          </label>
        )}
      </div>

      {periodo?.programada && !form[`${key}UsaMensual`] && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <Label>Auditor {label}</Label>
            <SelectAuditor
              value={form[`${key}AuditorId`]}
              onChange={(value) => setField(`${key}AuditorId`, value)}
              auditores={auditores}
              responsablesIds={fila.area.responsablesIds}
              disabled={bloqueada}
            />
          </div>

          <div>
            <Label>Motivo</Label>
            <Input value={form[`${key}Motivo`]} onChange={(event) => setField(`${key}Motivo`, event.target.value)} disabled={bloqueada} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen onClose={onClose} className="max-w-3xl">
      <ModalHeader onClose={onClose}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">{MESES[mes - 1]} {anio}</p>
          <h2 className="text-xl font-black text-slate-950">{fila.area.nombre}</h2>
        </div>
      </ModalHeader>

      <form onSubmit={guardar}>
        <ModalBody>
          <div className="space-y-4">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}

            <div>
              <Label>Auditor del mes</Label>
              <SelectAuditor
                value={form.auditorMensualId}
                onChange={(value) => setField('auditorMensualId', value)}
                auditores={auditores}
                responsablesIds={fila.area.responsablesIds}
              />
              <p className="mt-1 text-xs font-bold text-slate-500">Este auditor realizará P1 y P2 de forma predeterminada.</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Excepciones por periodo</p>
              {renderPeriodo('p1', 'P1', fila.periodos.p1, p1Bloqueada)}
              {renderPeriodo('p2', 'P2', fila.periodos.p2, p2Bloqueada)}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button type="button" variant="cancelar" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="guardar" isLoading={saving}>Guardar</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
