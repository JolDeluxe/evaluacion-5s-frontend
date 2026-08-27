import { Card, CardBody } from '@/components/ui/card';
import { getEstadoMesVisual } from '@/features/resultados/utils/resultados-format';
import { ResultadoScore } from '@/features/resultados/components/shared/resultado-score';
import { getResultadoHeatmapStyle } from '@/features/resultados/utils/resultado-colors';
import { cn } from '@/utils/cn';

export function EstadoMesCard({ data }) {
  const estado = data?.estadoMes ?? {};
  const visual = getEstadoMesVisual(estado.estado);
  const resultado = data?.resultadoGeneral;
  const mostrarResultado = Boolean(estado.mostrarResultado && resultado !== null && resultado !== undefined);

  const scoreStyle = mostrarResultado ? getResultadoHeatmapStyle(resultado) : {};

  return (
    <Card className="border-app-border bg-white shadow-sm">
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 md:p-5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black uppercase text-slate-950 md:text-2xl">
              {data?.mes?.etiqueta}
            </h2>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold',
                visual.className,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', visual.dotClassName)} />
              {estado.etiqueta || visual.label}
            </span>
          </div>
        </div>

        <div
          className="flex items-baseline gap-3 rounded-lg border border-app-border px-5 py-3 text-right sm:self-center transition-colors"
          style={scoreStyle}
        >
          <div>
            <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
              Resultado general
            </span>
            <ResultadoScore
              value={mostrarResultado ? resultado : null}
              empty="—"
              className="text-2xl md:text-3xl"
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
