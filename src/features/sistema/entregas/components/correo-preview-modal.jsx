import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

export function CorreoPreviewModal({
  isOpen,
  onClose,
  preview,
  cargando,
  onEnviarPrueba,
  enviandoPrueba,
  emailTestEnabled,
}) {
  const [tab, setTab] = useState('html'); // 'html' | 'text'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader
        title="Vista Previa de Correo Electrónico"
        description="Previsualización exacta del contenido HTML, texto alternativo y código QR generado por el motor de plantillas oficial."
        onClose={onClose}
      />

      <ModalBody className="space-y-4">
        {cargando ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Spinner size="lg" />
            <p className="text-xs font-bold">Compilando plantilla y generando código QR...</p>
          </div>
        ) : preview ? (
          <div className="space-y-4">
            {/* Metadata Bar */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Destinatario Simulado (To)
                  </span>
                  <p className="font-bold text-slate-900 truncate">
                    {preview.destinatarioNombre} &lt;{preview.destinatario}&gt;
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Asunto (Subject)
                  </span>
                  <p className="font-bold text-slate-900 truncate">
                    {preview.asunto}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600 truncate">
                  <Icon name="link" size="xs" className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-400 shrink-0">URL CTA / QR:</span>
                  <span className="font-mono truncate font-semibold text-slate-800">{preview.urlBoton}</span>
                </div>

                {preview.qrDataUri && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                    <Icon name="qr_code" size="xs" /> QR CID Generado
                  </span>
                )}
              </div>
            </div>

            {/* Pestañas de Vista */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTab('html')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition',
                    tab === 'html'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  Vista HTML
                </button>
                <button
                  type="button"
                  onClick={() => setTab('text')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold transition',
                    tab === 'text'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  Texto Plano
                </button>
              </div>

              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                Aislamiento estricto (sandbox iframe)
              </span>
            </div>

            {/* Contenido según pestaña */}
            {tab === 'html' ? (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 p-2 shadow-inner">
                <iframe
                  srcDoc={preview.html}
                  sandbox=""
                  className="w-full h-[480px] rounded-xl border border-slate-200 bg-white"
                  title="Vista previa del correo electrónico"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-950 p-4">
                <pre className="text-slate-100 font-mono text-xs whitespace-pre-wrap overflow-x-auto h-[480px] leading-relaxed">
                  {preview.text}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-12">
            No se pudo cargar la vista previa.
          </p>
        )}
      </ModalBody>

      <ModalFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="text-left">
          {!emailTestEnabled && (
            <span className="text-[11px] text-amber-700 font-medium">
              💡 Para enviar correos de prueba habilita EMAIL_TEST_ENABLED=true en .env
            </span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>

          {onEnviarPrueba && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon="send"
              disabled={!emailTestEnabled || enviandoPrueba || !preview}
              onClick={onEnviarPrueba}
              className="text-xs font-bold"
            >
              {enviandoPrueba ? 'Enviando prueba...' : 'Enviarme prueba'}
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}