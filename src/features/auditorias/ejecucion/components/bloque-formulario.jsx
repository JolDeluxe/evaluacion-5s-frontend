import { ImagenFormulario } from '@/features/auditorias/ejecucion/components/imagen-formulario';

export function BloqueFormulario({ bloque }) {
  if (!bloque) return null;

  if (bloque.tipo === 'TEXTO') {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/55 p-4 text-sm font-semibold leading-6 text-slate-600 shadow-sm shadow-slate-950/5">
        {bloque.etiqueta && <p className="font-black text-slate-800">{bloque.etiqueta}</p>}
        {bloque.descripcion && <p className="mt-1 whitespace-pre-line">{bloque.descripcion}</p>}
      </div>
    );
  }

  if (bloque.tipo === 'IMAGEN') return <ImagenFormulario bloque={bloque} />;

  if (bloque.tipo === 'SEPARADOR') {
    return <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />;
  }

  return null;
}
