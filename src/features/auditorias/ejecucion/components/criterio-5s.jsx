import { EvidenciaField } from '@/features/auditorias/ejecucion/components/evidencia-field';
import { HallazgoField } from '@/features/auditorias/ejecucion/components/hallazgo-field';
import { OpcionesCriterio } from '@/features/auditorias/ejecucion/components/opciones-criterio';

export function Criterio5S({
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
  return (
    <article className="space-y-5 rounded-[2rem] border border-white/75 bg-white/75 p-5 shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-50 text-base font-black text-slate-700 shadow-inner shadow-slate-950/5">
            {criterio.puntajeMaximo ? Number(criterio.puntajeMaximo) : ''}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-acento">{criterio.seccionTitulo}</p>
            <h1 className="mt-1 text-pretty text-xl font-black leading-tight text-slate-950">
              {criterio.etiqueta}
            </h1>
            {criterio.descripcion && (
              <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
                {criterio.descripcion}
              </p>
            )}
          </div>
        </div>
      </div>

      <OpcionesCriterio bloque={criterio} respuesta={respuesta} onSelect={onSelectOption} />
      {errores?.opcion && <p className="px-1 text-xs font-bold text-red-600">{errores.opcion}</p>}

      {reglasAplicadas.exigeHallazgo && (
        <HallazgoField
          value={respuesta?.hallazgo}
          onChange={onChangeHallazgo}
          error={errores?.hallazgo}
        />
      )}

      {reglasAplicadas.exigeEvidencia && (
        <EvidenciaField
          evidencias={respuesta?.evidencias ?? []}
          onChange={onChangeEvidencias}
          modo={modo}
          token={token}
          preview={preview}
          error={errores?.evidencia}
        />
      )}
    </article>
  );
}
