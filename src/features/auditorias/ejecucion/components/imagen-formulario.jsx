import { buildCloudinaryUrl } from '@/features/auditorias/ejecucion/components/formulario-dinamico.helpers';

export function ImagenFormulario({ bloque }) {
  const configuracion = bloque?.configuracion ?? {};
  const src = buildCloudinaryUrl(configuracion);
  const alt = configuracion.alt || bloque?.etiqueta || 'Imagen informativa del formulario';

  if (!src) return null;

  return (
    <figure className="overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-lg shadow-slate-950/5">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="aspect-[4/3] w-full object-cover"
      />
    </figure>
  );
}
