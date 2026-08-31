import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EvidenciaField } from '@/features/auditorias/ejecucion/components/evidencia-field';
import { HallazgoField } from '@/features/auditorias/ejecucion/components/hallazgo-field';

export function CompactCriterio5S({
  criterio,
  respuesta,
  reglasAplicadas,
  errores,
  modo,
  token,
  preview,
  onSelectOption,
  onChangeHallazgo,
  onChangeEvidencias,
}) {
  const containerRef = useRef(null);

  // Scroll into view if this question has an error and was requested
  useEffect(() => {
    if (errores?.scrollRequest && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errores?.scrollRequest]);

  const seleccionadas = new Set(respuesta?.opcionFormularioIds ?? []);
  const opcionSi = criterio.opciones.find(o => o.valor === 'SI');
  const opcionNo = criterio.opciones.find(o => o.valor === 'NO');

  const activaSi = opcionSi && seleccionadas.has(opcionSi.id);
  const activaNo = opcionNo && seleccionadas.has(opcionNo.id);

  const btnNoClass = activaNo
    ? 'bg-rose-50/80 text-rose-800 border-rose-400 shadow-[0_3px_12px_-2px_rgba(244,63,94,0.18)] hover:bg-rose-100/50'
    : activaSi
      ? 'bg-white/40 border-slate-200/40 text-slate-400 hover:bg-white/60 shadow-none'
      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm';

  const btnSiClass = activaSi
    ? 'bg-emerald-50/80 text-emerald-800 border-emerald-400 shadow-[0_3px_12px_-2px_rgba(16,185,129,0.18)] hover:bg-emerald-100/50'
    : activaNo
      ? 'bg-white/40 border-slate-200/40 text-slate-400 hover:bg-white/60 shadow-none'
      : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm';

  return (
    <article 
      id={`criterio-${criterio.id}`}
      ref={containerRef}
      className={`relative rounded-xl border p-4 transition-colors ${
        errores?.missing 
          ? 'border-red-300 bg-red-50/30' 
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex gap-3">
        {criterio.puntajeMaximo && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
            {Number(criterio.puntajeMaximo)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold leading-snug text-slate-900">
            {criterio.etiqueta}
          </h2>
          {criterio.descripcion && (
            <p className="mt-1 text-sm text-slate-600">
              {criterio.descripcion}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {opcionNo && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className={`rounded-2xl min-h-[3.25rem] text-base font-black transition-all active:scale-[0.98] border backdrop-blur-sm ${btnNoClass}`}
            aria-pressed={activaNo}
            onClick={() => onSelectOption(opcionNo)}
          >
            <span className={`mr-1.5 text-lg ${activaNo ? 'text-rose-600 font-black' : 'text-slate-400'}`}>✕</span> NO
          </Button>
        )}
        {opcionSi && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className={`rounded-2xl min-h-[3.25rem] text-base font-black transition-all active:scale-[0.98] border backdrop-blur-sm ${btnSiClass}`}
            aria-pressed={activaSi}
            onClick={() => onSelectOption(opcionSi)}
          >
            <span className={`mr-1.5 text-lg ${activaSi ? 'text-emerald-600 font-black' : 'text-slate-400'}`}>✓</span> SÍ
          </Button>
        )}
      </div>

      {errores?.missing && (
        <p className="mt-2 text-xs font-bold text-red-600">
          Respuesta requerida
        </p>
      )}

      {/* Expansión inline para Hallazgo y Evidencia */}
      {reglasAplicadas?.exigeHallazgo && (
        <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
          <HallazgoField
            value={respuesta?.hallazgo}
            onChange={onChangeHallazgo}
            error={errores?.hallazgo}
          />
          {reglasAplicadas?.exigeEvidencia !== undefined && (
            <EvidenciaField
              evidencias={respuesta?.evidencias ?? []}
              onChange={onChangeEvidencias}
              modo={modo}
              token={token}
              preview={preview}
              error={errores?.evidencia}
            />
          )}
        </div>
      )}
    </article>
  );
}
