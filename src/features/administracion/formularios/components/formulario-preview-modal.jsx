import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ordenarPorOrden } from '@/features/administracion/formularios/helpers/estructura-formulario-helpers';

export function FormularioPreviewModal({ formulario, revision, title = 'Vista previa', onClose }) {
  if (!revision) return null;

  let numeroPregunta = 0;
  const secciones = ordenarPorOrden(revision.secciones ?? []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-2xl shadow-slate-950/15 backdrop-blur-2xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-acento">{title}</p>
            <h2 className="text-xl font-black text-slate-950">{formulario?.nombre ?? revision.formulario?.nombre}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">
              {revision.totalPreguntas} preguntas · {revision.totalSecciones} secciones
            </p>
          </div>
          <Button variant="ghost" icon="close" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl md:p-6">
          {secciones.map((seccion, seccionIndex) => (
            <section key={seccion.claveEstable ?? seccion.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-marca-acento">
                  Sección {seccionIndex + 1}
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-950">{seccion.nombre}</h3>
                {seccion.objetivo && (
                  <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
                    <span className="font-black text-slate-800">Objetivo: </span>
                    {seccion.objetivo}
                  </p>
                )}
              </div>

              <ol className="mt-4 space-y-3">
                {ordenarPorOrden(seccion.preguntas ?? []).map((pregunta) => {
                  numeroPregunta += 1;
                  return (
                    <li key={pregunta.claveEstable ?? pregunta.id} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm shadow-slate-950/5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marca-primario/10 text-sm font-black text-marca-primario">
                        {numeroPregunta}
                      </span>
                      <p className="whitespace-pre-line text-sm font-semibold leading-6 text-slate-700">{pregunta.texto}</p>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}

          {!secciones.length && (
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              <Icon name="info" />
              Este formulario todavía no tiene secciones.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
