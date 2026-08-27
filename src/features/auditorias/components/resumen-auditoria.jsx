import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ImageViewer } from '@/components/ui/image-viewer';

export function ResumenAuditoria({
  criterios = [],
  respuestas = {},
  onSubmit,
  onBackToCapture,
  isSubmitting,
  error,
}) {
  const [viewer, setViewer] = useState(null);

  const total = criterios.length;
  const positivas = criterios.filter((c) => respuestas[c.id]?.cumple === true).length;
  const porcentaje = total > 0 ? Math.round((positivas / total) * 100) : 0;

  const hallazgos = criterios
    .map((criterio) => ({ criterio, respuesta: respuestas[criterio.id] }))
    .filter((item) => item.respuesta?.hallazgo?.trim());

  return (
    <section className="space-y-6">
      {/* 1. Card del Resultado principal */}
      <div className="rounded-[2rem] border border-white/70 bg-white/78 p-6 text-center shadow-lg shadow-slate-950/5 backdrop-blur-2xl space-y-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">
          Resultado de auditoría
        </p>
        <div className="space-y-1">
          <p className="text-6xl font-black text-slate-950">
            {porcentaje}%
          </p>
          <p className="text-sm font-bold text-slate-600">
            {positivas} / {total} puntos
          </p>
        </div>
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          {hallazgos.length === 0
            ? 'Sin hallazgos detectados'
            : hallazgos.length === 1
              ? '1 hallazgo detectado'
              : `${hallazgos.length} hallazgos detectados`}
        </p>
      </div>

      {/* 2. Listado de Hallazgos */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          Hallazgos registrados
        </h3>

        {hallazgos.length > 0 ? (
          <div className="space-y-3">
            {hallazgos.map(({ criterio, respuesta }) => (
              <div key={criterio.id} className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-600">
                    Criterio evaluado
                  </span>
                  <h4 className="text-sm font-black text-slate-900 leading-snug mt-0.5">
                    {criterio.etiqueta}
                  </h4>
                </div>

                <div className="rounded-xl bg-white/70 p-3 border border-rose-100/50">
                  <p className="text-sm font-semibold leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {respuesta.hallazgo}
                  </p>
                </div>

                {respuesta.evidencias && respuesta.evidencias.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {respuesta.evidencias.slice(0, 3).map((foto, idx) => {
                        const src = foto.url || foto.previewUrl;
                        return (
                          <button
                            key={foto.identificadorCliente || idx}
                            type="button"
                            onClick={() => setViewer({ src, title: `${criterio.etiqueta} - Evidencia ${idx + 1}` })}
                            className="relative aspect-square w-16 h-16 shrink-0 overflow-hidden rounded-xl border border-rose-200/50 bg-slate-100 transition active:scale-95 shadow-sm cursor-zoom-in"
                          >
                            <img src={src} alt={`Evidencia ${idx + 1}`} className="h-full w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm font-bold text-slate-600 border border-slate-200/50">
            No se registraron hallazgos en esta auditoría.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* 3. Botones de Acción */}
      <div className="pt-4 space-y-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          className="w-full rounded-2xl min-h-[3.5rem] text-base font-black"
          onClick={onSubmit}
          isLoading={isSubmitting}
        >
          Finalizar auditoría
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full rounded-2xl min-h-[3.5rem] text-base font-bold"
          onClick={onBackToCapture}
          disabled={isSubmitting}
        >
          Volver a la captura
        </Button>
      </div>

      <ImageViewer
        open={Boolean(viewer)}
        src={viewer?.src}
        title={viewer?.title}
        alt={viewer?.title}
        onClose={() => setViewer(null)}
      />
    </section>
  );
}
