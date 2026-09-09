import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { CanalBadge } from './canal-badge';

export function CancelarEntregaModal({
  isOpen,
  onClose,
  entrega = null,
  ids = [],
  onConfirmar,
  cargando,
}) {
  const [motivo, setMotivo] = useState('');
  const esMasivo = !entrega && ids.length > 0;
  const total = esMasivo ? ids.length : 1;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onConfirmar(motivo.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader
        title={esMasivo ? `Cancelar ${total} Entregas` : `Cancelar Entrega #${entrega?.id}`}
        description="Esta acción cambiará el estado de la entrega a CANCELADA."
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Icon name="info" size="sm" className="text-slate-500" />
              <span>Garantía de idempotencia y trazabilidad:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>El registro de la entrega se conserva en el historial para auditoría.</li>
              <li>La notificación asociada y su clave de deduplicación se mantienen intactas.</li>
              <li>El sistema <strong>no volverá a crear ni a intentar enviar</strong> esta entrega.</li>
            </ul>
          </div>

          {!esMasivo && entrega && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Canal:</span>
                <CanalBadge canal={entrega.canal} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Destinatario:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]" title={entrega.destinoSnapshot}>
                  {entrega.destinoSnapshot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Asunto / Tipo:</span>
                <span className="font-bold text-slate-700 truncate max-w-[200px]" title={entrega.notificacion?.titulo}>
                  {entrega.notificacion?.titulo || '—'}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Motivo de Cancelación (Opcional)
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Entregas de prueba @example.test obsoletas"
              maxLength={250}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={cargando}
          >
            Volver
          </Button>

          <Button
            type="submit"
            variant="danger"
            size="sm"
            disabled={cargando}
            icon="block"
          >
            {cargando ? 'Cancelando...' : `Confirmar Cancelación (${total})`}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
