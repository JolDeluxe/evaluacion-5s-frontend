import { Button } from '@/components/ui/button';
import { BloqueFormulario } from '@/features/auditorias/components/bloque-formulario';

export function SeccionFormulario({ seccion, indice, totalSecciones, onStart }) {
  const bloquesIntro = seccion.bloques.filter((bloque) => ['TEXTO', 'IMAGEN', 'SEPARADOR'].includes(bloque.tipo));

  return (
    <section className="space-y-5 rounded-[2rem] border border-white/75 bg-white/75 p-5 shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">
          Seccion {indice + 1} de {totalSecciones}
        </p>
        <h1 className="mt-2 text-pretty text-3xl font-black leading-none text-slate-950">
          {seccion.titulo?.etiqueta ?? 'Evaluacion'}
        </h1>
        {seccion.titulo?.descripcion && (
          <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
            {seccion.titulo.descripcion}
          </p>
        )}
      </div>

      {bloquesIntro.map((bloque) => <BloqueFormulario key={bloque.id ?? bloque.claveEstable} bloque={bloque} />)}

      <div className="rounded-3xl bg-slate-50/80 p-4 text-center text-sm font-black text-slate-700">
        {seccion.criterios.length} criterios
      </div>

      <Button type="button" size="lg" icon="play_arrow" className="min-h-14 w-full rounded-2xl" onClick={onStart}>
        Comenzar
      </Button>
    </section>
  );
}
