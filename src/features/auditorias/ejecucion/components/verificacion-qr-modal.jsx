import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Icon } from '@/components/ui/icon';
import { parseAreaQrPayload, normalizeAreaCode } from '@/features/administracion/areas/utils/area-qr-payload';

export function VerificacionQrModal({ isOpen, area, onClose, onConfirm }) {
  // El modo por defecto siempre es 'scanner' al abrir
  const [modo, setModo] = useState('scanner'); // 'scanner' | 'manual'
  const [codigoInput, setCodigoInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [cargandoCamara, setCargandoCamara] = useState(false);

  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const estaProcesandoRef = useRef(false);
  const modalAbiertoRef = useRef(false);

  modalAbiertoRef.current = isOpen;

  // Función de detención idempotente que NUNCA manipula el DOM de React
  const detenerCamara = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch (err) {
        console.error('Error al detener controles ZXing:', err);
      }
      controlsRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (err) {
        console.error('Error al detener tracks de cámara:', err);
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCargandoCamara(false);
  }, []);

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
    detenerCamara();
    onConfirm(codigoExtraido);
  }, [area, onConfirm, detenerCamara]);

  // Iniciar scanner QR con ZXing utilizando videoRef controlado por React
  const iniciarScanner = useCallback(async () => {
    detenerCamara();
    setErrorMsg('');
    setCargandoCamara(true);
    estaProcesandoRef.current = false;

    // Esperar a que el elemento video esté montado si acaba de cambiar de modo
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!modalAbiertoRef.current || !videoRef.current) {
      setCargandoCamara(false);
      return;
    }

    try {
      const codeReader = new BrowserQRCodeReader();
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
        },
      };

      // Iniciar la cámara directamente sobre el elemento HTMLVideoElement ref de React
      const controls = await codeReader.decodeFromConstraints(
        constraints,
        videoRef.current,
        (result) => {
          if (result && !estaProcesandoRef.current && modalAbiertoRef.current) {
            ejecutarValidacion(result.getText());
          }
        }
      );

      // Si el modal o modo cambiaron mientras solicitaba la cámara (race condition), detener de inmediato
      if (!modalAbiertoRef.current) {
        controls.stop();
        return;
      }

      controlsRef.current = controls;
      if (videoRef.current && videoRef.current.srcObject) {
        streamRef.current = videoRef.current.srcObject;
      }
      setCargandoCamara(false);
    } catch (err) {
      console.error('Error de acceso a cámara:', err);
      detenerCamara();
      let msg = 'No se pudo acceder a la cámara. Puedes habilitar el permiso del navegador o escribir el código del área.';
      if (err?.name === 'NotAllowedError' || err?.toString()?.includes('Permission')) {
        msg = 'No se pudo acceder a la cámara. Puedes habilitar el permiso del navegador o escribir el código del área.';
      } else if (err?.name === 'NotFoundError' || err?.toString()?.includes('DevicesNotFound')) {
        msg = 'No se detectó ninguna cámara en este dispositivo. Ingresa el código del área.';
      }
      setErrorMsg(msg);
      // Fallback automático a modo manual si falla la cámara
      setModo('manual');
    }
  }, [detenerCamara, ejecutarValidacion]);

  // Efecto principal al abrir o cerrar el modal
  useEffect(() => {
    if (isOpen) {
      setModo('scanner');
      setCodigoInput('');
      setErrorMsg('');
      setVerificando(false);
      estaProcesandoRef.current = false;
      iniciarScanner();
    } else {
      detenerCamara();
    }

    return () => {
      detenerCamara();
    };
  }, [isOpen, iniciarScanner, detenerCamara]);

  // Manejadores de cambio de modo
  const cambiarAMandoManual = () => {
    detenerCamara();
    setModo('manual');
    setErrorMsg('');
    estaProcesandoRef.current = false;
  };

  const cambiarAModoScanner = () => {
    setModo('scanner');
    setErrorMsg('');
    estaProcesandoRef.current = false;
    iniciarScanner();
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
              {modo === 'scanner'
                ? 'Apunta la cámara al código QR colocado en el departamento.'
                : 'Escribe manualmente el código alfanumérico impreso en el área.'}
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

          {modo === 'scanner' ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500/30 bg-slate-950 shadow-inner min-h-[260px] flex items-center justify-center">
                {/* Elemento VIDEO estrictamente controlado por React */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover max-h-[300px]"
                />

                {cargandoCamara && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 p-6 text-slate-300">
                    <Icon name="sync" className="animate-spin text-indigo-400" size="28px" />
                    <span className="text-xs font-semibold">Solicitando cámara...</span>
                  </div>
                )}

                {/* Marco guía visual de escaneo */}
                {!cargandoCamara && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-indigo-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] relative">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-indigo-400 rounded-tl"></div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-indigo-400 rounded-tr"></div>
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-indigo-400 rounded-bl"></div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-indigo-400 rounded-br"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-slate-500">
                  ¿No puedes escanear el QR?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={cambiarAMandoManual}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                  aria-label="Escribir código manualmente"
                >
                  <Icon name="keyboard" size="18px" />
                  <span>Escribir código</span>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label required>Código del área</Label>
                <Input
                  type="text"
                  placeholder="Ej. YCE5-K78Y"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  className="font-mono uppercase text-center tracking-widest text-base font-bold h-12"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={cambiarAModoScanner}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                >
                  <Icon name="qr_code_scanner" size="18px" />
                  <span>Escanear QR con cámara</span>
                </Button>
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
        {modo === 'manual' && (
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


