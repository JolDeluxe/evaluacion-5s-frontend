import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { AreaQrPrintCard } from './area-qr-print-card';
import { buildAreaQrUrl } from '../utils/area-qr-payload';

export function AreaQrModal({ area, onClose, onPrintSingle }) {
  if (!area) return null;

  const fullUrl = buildAreaQrUrl(area.codigoVerificacion);

  const handleCopyLink = () => {
    if (fullUrl && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl);
    }
  };

  return (
    <Modal isOpen={!!area} onClose={onClose} className="max-w-md">
      <ModalHeader title="Código QR del Área" onClose={onClose}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
            Identificador permanente
          </p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{area.nombre}</h2>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="flex justify-center py-2">
          <AreaQrPrintCard area={area} />
        </div>
      </ModalBody>
      <ModalFooter className="print:hidden">
        <Button variant="cancelar" size="sm" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          variant="primario"
          size="sm"
          icon="print"
          onClick={() => onPrintSingle ? onPrintSingle(area) : window.print()}
        >
          Imprimir QR
        </Button>
      </ModalFooter>
    </Modal>
  );
}
