import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Icon } from '@/components/ui/icon';

export function VerificacionQrModal({ isOpen, area, onClose, onConfirm }) {
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verificando, setVerificando] = useState(false);

  if (!isOpen || !area) return null;

  const normalizar = (str) => (str ?? '').trim().toUpperCase().replace(/[\s-]/g, '');

  const handleValidar = (e) => {
    e?.preventDefault();
    setErrorMsg('');
    const ingresado = normalizar(codigoInput);
    const esperado = normalizar(area.codigoVerificacion ?? area.codigo);

    if (!ingresado) {
      setErrorMsg('Por favor ingresa o escanea el código del área.');
      return;
    }

    if (ingresado !== esperado) {
      setErrorMsg(`El código escaneado no corresponde a esta área.\nAuditoría: ${area.nombre}`);
      return;
    }

    setVerificando(true);
    try {
      onConfirm(codigoInput.trim().toUpperCase());
    } finally {
      setVerificando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <ModalHeader title="Verificación de Área Obligatoria" onClose={onClose}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
            Confirmación de Presencia Física
          </p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{area.nombre}</h2>
        </div>
      </ModalHeader>
      <form onSubmit={handleValidar}>
        <ModalBody>
          <div className="space-y-4 py-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Icon name="verified_user" size="18px" className="text-emerald-600 shrink-0" />
                <span>Validación física requerida antes de enviar</span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Escanea el código QR colocado en el departamento o escribe manualmente el código alfanumérico impreso.
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 font-black">
                  <Icon name="error_outline" size="16px" />
                  <span>Código de área no coincide</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed font-semibold">{errorMsg}</p>
              </div>
            )}

            <div>
              <Label required>Código del área impreso o escaneado</Label>
              <Input
                type="text"
                placeholder="Ej. K7M4-Q9X2"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
                className="font-mono uppercase text-center tracking-widest text-base font-bold h-11"
                required
                autoFocus
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="cancelar" size="sm" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primario"
            size="sm"
            type="submit"
            icon="task_alt"
            isLoading={verificando}
            disabled={!codigoInput.trim()}
          >
            Confirmar y Enviar
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
