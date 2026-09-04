import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Icon } from '@/components/ui/icon';
import { parseAreaQrPayload, normalizeAreaCode } from '@/features/administracion/areas/utils/area-qr-payload';

export function VerificacionQrModal({ isOpen, area, onClose, onConfirm }) {
  const [modoEscaneo, setModoEscaneo] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [cargandoCamara, setCargandoCamara] = useState(false);

  const html5QrCodeRef = useRef(null);
  const estaProcesandoRef = useRef(false);

  // Detener la cámara de manera limpia
  const detenerCamara = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error al detener html5Qrcode:', err);
      } finally {
        html5QrCodeRef.current = null;
        setCargandoCamara(false);
      }
    }
  }, []);

  // Reiniciar estado cuando el modal se abre/cierra
  useEffect(() => {
    if (!isOpen) {
      detenerCamara();
      setModoEscaneo(false);
      setCodigoInput('');
      setErrorMsg('');
      setVerificando(false);
      estaProcesandoRef.current = false;
    }
  }, [isOpen, detenerCamara]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, [detenerCamara]);

  // Validación centralizada compartida entre cámara e input manual
  const ejecutarValidacion = useCallback((rawInput) => {
    if (estaProcesandoRef.current) return;
    estaProcesandoRef.current = true;
    setErrorMsg('');

    const codigoExtraido = parseAreaQrPayload(rawInput);
    if (!codigoExtraido) {
      setErrorMsg('Este QR no corresponde a un área válida de Auditoría 5S.');
      estaProcesandoRef.current = false;
      return;
    }

    const ingresadoNorm = normalizeAreaCode(codigoExtraido);
    const esperadoNorm = normalizeAreaCode(area?.codigoVerificacion ?? area?.codigo);

    if (ingresadoNorm !== esperadoNorm) {
      setErrorMsg(`El QR escaneado no corresponde a esta área.\nAuditoría: ${area?.nombre ?? 'Desconocida'}`);
      estaProcesandoRef.current = false;
      return;
    }

    // Código válido y coincidente
    setVerificando(true);
    detenerCamara().then(() => {
      onConfirm(codigoExtraido);
    }).catch(() => {
      onConfirm(codigoExtraido);
    });
  }, [area, onConfirm, detenerCamara]);

  // Iniciar scanner QR con html5-qrcode
  const iniciarScanner = async () => {
    setErrorMsg('');
    setModoEscaneo(true);
    setCargandoCamara(true);
    estaProcesandoRef.current = false;

    // Asegurar que el elemento DOM existe
    await new Promise((resolve) => setTimeout(resolve, 100));

    const elementId = 'reader-qr-area';
    if (!document.getElementById(elementId)) {
      setErrorMsg('No se encontró el contenedor de cámara.');
      setCargandoCamara(false);
      return;
    }

    try {
      if (html5QrCodeRef.current) {
        await detenerCamara();
      }

      const scanner = new Html5Qrcode(elementId);
      html5QrCodeRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          if (!estaProcesandoRef.current) {
            ejecutarValidacion(decodedText);
          }
        },
        () => {
          // Errores por frame (ignorar)
        }
      );

      setCargandoCamara(false);
    } catch (err) {
      console.error('Error al iniciar cámara:', err);
      let msg = 'No se pudo acceder a la cámara. Puedes habilitar el permiso del navegador o escribir el código del área.';
      if (err?.name === 'NotAllowedError' || err?.toString()?.includes('Permission')) {
        msg = 'No se pudo acceder a la cámara. Puedes habilitar el permiso del navegador o escribir el código del área.';
      } else if (err?.name === 'NotFoundError' || err?.toString()?.includes('DevicesNotFound')) {
        msg = 'No se detectó ninguna cámara en este dispositivo. Por favor utiliza el código manual.';
      }
      setErrorMsg(msg);
      await detenerCamara();
      setModoEscaneo(false);
    }
  };

  const handleCancelarEscaneo = async () => {
    await detenerCamara();
    setModoEscaneo(false);
    setErrorMsg('');
    estaProcesandoRef.current = false;
  };

  const handleFormSubmit = (e) => {
    e?.preventDefault();
    if (!codigoInput.trim()) return;
    ejecutarValidacion(codigoInput);
  };

  if (!isOpen || !area) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { detenerCamara(); onClose(); }} className="max-w-md">
      <ModalHeader title="Verificar área" onClose={() => { detenerCamara(); onClose(); }}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
            Confirmación de Presencia Física
          </p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{area.nombre}</h2>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-4 py-1">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Icon name="verified_user" size="18px" className="text-emerald-600 shrink-0" />
              <span>Confirma que estás en el área correcta antes de finalizar.</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Escanea el código QR del área o escribe el código alfanumérico.
            </p>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-800 font-black">
                <Icon name="error_outline" size="16px" />
                <span>Error de verificación</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed font-semibold">{errorMsg}</p>
            </div>
          )}

          {modoEscaneo ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-300 bg-slate-950 p-1 text-white shadow-inner">
                <div id="reader-qr-area" className="w-full min-h-[260px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  {cargandoCamara && (
                    <div className="flex flex-col items-center gap-2 p-6 text-slate-300">
                      <Icon name="sync" className="animate-spin text-indigo-400" size="28px" />
                      <span className="text-xs font-semibold">Solicitando acceso a la cámara...</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-xs font-semibold text-slate-500">
                Apunta la cámara al código QR del área.
              </p>
              <div className="flex justify-center pt-1">
                <Button variant="cancelar" size="sm" onClick={handleCancelarEscaneo} type="button">
                  Cancelar escaneo
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="secundario"
                  size="lg"
                  type="button"
                  onClick={iniciarScanner}
                  className="w-full h-12 flex items-center justify-center gap-2 text-sm font-bold shadow-sm"
                >
                  <Icon name="qr_code_scanner" size="22px" className="text-indigo-600" />
                  <span>Escanear QR</span>
                </Button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    o escribe el código
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <div>
                  <Label required>Código del área</Label>
                  <Input
                    type="text"
                    placeholder="Ej. YCE5-K78Y"
                    value={codigoInput}
                    onChange={(e) => setCodigoInput(e.target.value)}
                    className="font-mono uppercase text-center tracking-widest text-base font-bold h-11"
                    autoFocus
                  />
                </div>
              </div>

              <div className="hidden">
                <button type="submit" />
              </div>
            </form>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="cancelar" size="sm" onClick={() => { detenerCamara(); onClose(); }} type="button">
          Cancelar
        </Button>
        {!modoEscaneo && (
          <Button
            variant="primario"
            size="sm"
            type="button"
            onClick={handleFormSubmit}
            icon="task_alt"
            isLoading={verificando}
            disabled={!codigoInput.trim()}
          >
            Verificar código
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

