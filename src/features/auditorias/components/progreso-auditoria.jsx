export function ProgresoAuditoria({ actual, total, seccion }) {
  const porcentaje = total > 0 ? Math.round((actual / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-acento">{seccion}</p>
          <p className="text-sm font-black text-slate-700">Pregunta {actual} de {total}</p>
        </div>
        <span className="text-sm font-black text-slate-500">{porcentaje}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/70 shadow-inner shadow-slate-950/5">
        <div
          className="h-full rounded-full bg-marca-primario transition-all duration-300"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}
