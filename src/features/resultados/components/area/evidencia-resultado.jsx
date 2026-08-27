export function EvidenciaResultado({ evidencia, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(evidencia)}
      className="h-20 w-20 overflow-hidden rounded-lg border border-app-border bg-slate-100 transition hover:opacity-90 focus-visible:outline-focus-ring/40"
      aria-label="Ver evidencia"
    >
      <img
        src={evidencia.url}
        alt="Evidencia del hallazgo"
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </button>
  );
}
