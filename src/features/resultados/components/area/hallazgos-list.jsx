import { HallazgoResultado } from '@/features/resultados/components/area/hallazgo-resultado';

export function HallazgosList({ hallazgos = [] }) {
  if (hallazgos.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          Hallazgos ({hallazgos.length})
        </h3>
      </div>

      <div className="space-y-3">
        {hallazgos.map((hallazgo, index) => (
          <HallazgoResultado
            key={hallazgo.id || index}
            hallazgo={hallazgo}
            numero={index + 1}
            total={hallazgos.length}
          />
        ))}
      </div>
    </div>
  );
}
