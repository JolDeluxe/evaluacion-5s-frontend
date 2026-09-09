import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';

export function ReenviarEntregaModal({
  isOpen,
  onClose,
  entrega = null,
  onConfirmar,
  cargando = false,
  cargandoDetalle = false,
}) {
  if (!isOpen || !entrega) return null;

  const destinoOriginal = entrega.destinoSnapshot || '';
  const usuario = entrega.notificacion?.usuario;
  const destinoActual = usuario?.correo?.trim() || '';

  const origNorm = destinoOriginal.trim().toLowerCase();
  const actNorm = destinoActual.toLowerCase();
  const sonDistintos = Boolean(origNorm && actNorm && origNorm !== actNorm);

  // Evaluamos las protecciones técnicas
  let errorBloqueo = null;
  if (!cargandoDetalle) {
    if (!usuario) {
      errorBloqueo = 'El usuario destinatario ya no existe en el sistema.';
    } else if (usuario.activo === false) {
      errorBloqueo = `El usuario "${usuario.nombre || 'Destinatario'}" se encuentra inactivo o dado de baja.`;
    } else if (!destinoActual) {
      errorBloqueo = `El usuario "${usuario.nombre || 'Destinatario'}" no tiene una dirección de correo configurada actualmente.`;
    }
  }

  const handleReenviar = () => {
    if (errorBloqueo || cargando || cargandoDetalle) return;
    onConfirmar();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader
        title={`Reenviar correo · Entrega #${entrega.id}`}
        description="Se generará una nueva entrega en cola conservando el registro histórico original."
        onClose={onClose}
      />

      <ModalBody className="space-y-4">
        {cargandoDetalle ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 space-y-2">
            <Icon name="sync" size="md" className="animate-spin text-sky-600" />
            <span className="text-xs font-semibold">Consultando datos actuales del usuario...</span>
          </div>
        ) : errorBloqueo ? (
          /* Bloqueo por Protección de Seguridad */
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 space-y-2.5 text-rose-950">
            <div className="flex items-center gap-2 font-black text-xs text-rose-700 uppercase tracking-wider">
              <Icon name="error" size="sm" className="text-rose-600" />
              <span>Operación no permitida</span>
            </div>
            <p className="text-xs font-bold leading-relaxed">{errorBloqueo}</p>
            <p className="text-[11px] text-rose-800/90 leading-normal">
              Por consistencia técnica y seguridad operativa, el sistema{' '}
              <strong>no reutiliza silenciosamente la dirección histórica</strong> cuando el usuario no cuenta con un correo activo válido.
            </p>
            {destinoOriginal && (
              <div className="mt-2 pt-2 border-t border-rose-200/80 text-[11px] text-rose-900">
                <span className="font-semibold text-rose-700">Destinatario histórico original:</span>{' '}
                <span className="font-mono">{destinoOriginal}</span>
              </div>
            )}
          </div>
        ) : (
          /* Flujo Normal: Datos del Destinatario */
          <div className="space-y-3">
            {sonDistintos ? (
              <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Destinatario original:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-500 line-through decoration-slate-400">
                    <Icon name="history" size="xs" className="text-slate-400" />
                    <span>{destinoOriginal}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-sky-200/60">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-900 block">
                    Destinatario actual:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black text-sky-950">
                    <Icon name="mark_email_read" size="xs" className="text-sky-700" />
                    <span>{destinoActual}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-sky-100/80 border border-sky-200/80 px-3 py-2 text-[11px] font-semibold text-sky-900 flex items-center gap-2">
                  <Icon name="info" size="xs" className="text-sky-700 shrink-0" />
                  <span>Se enviará al correo actual del usuario.</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-1.5 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Destinatario:
                </span>
                <p className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Icon name="mail" size="xs" className="text-slate-500" />
                  {destinoActual || destinoOriginal}
                </p>
                <p className="text-[11px] text-slate-500 font-medium pt-1">
                  El correo actual del usuario coincide con el envío original.
                </p>
              </div>
            )}

            {/* Resumen del Mensaje y Garantía de Trazabilidad */}
            <div className="rounded-xl border border-slate-200/70 bg-white p-3 text-xs space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-400 font-bold uppercase text-[10px] shrink-0">Asunto:</span>
                <span className="font-bold text-slate-800 text-right truncate" title={entrega.notificacion?.titulo}>
                  {entrega.notificacion?.titulo || '—'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-slate-100">
                <span className="text-slate-400">Entrega de origen:</span>
                <span className="font-mono font-bold text-slate-700">#{entrega.id}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium px-1">
              La entrega original <strong>no se modificará</strong> (permanece en su estado y fecha históricos). Se encolará una nueva entrega con su propio ID y trazabilidad.
            </p>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {errorBloqueo ? (
          <Button type="button" variant="secondary" onClick={onClose} className="w-full text-xs font-bold">
            Cerrar
          </Button>
        ) : (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={cargando}
              className="text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              icon="forward_to_inbox"
              onClick={handleReenviar}
              disabled={cargando || cargandoDetalle}
              className="text-xs font-bold shadow-sm"
            >
              {cargando ? 'Programando...' : 'Reenviar'}
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
}
