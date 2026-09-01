import { Card, CardBody } from '@/components/ui/card';
import { getEstadoMesVisual } from '@/features/resultados/utils/resultados-format';
import { ResultadoScore } from '@/features/resultados/components/shared/resultado-score';
import { cn } from '@/utils/cn';

export function EstadoMesCard({ data }) {
  const estado = data?.estadoRango ?? data?.estadoMes ?? {};
  const visual = getEstadoMesVisual(estado.estado);
  const resultado = data?.resultadoGeneral;
  const mostrarResultado = Boolean(estado.mostrarResultado && resultado !== null && resultado !== undefined);

  const tituloHeader = data?.rango?.etiqueta || data?.mes?.etiqueta || 'Resultados General';
  const subTituloHeader = data?.rango?.subEtiqueta;

  return (
    <Card className="border-app-border bg-white shadow-sm">
      <CardBody className="p-3.5 sm:p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-xl font-black uppercase text-slate-950 truncate">
                {tituloHeader}
              </h2>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold',
                  visual.className,
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', visual.dotClassName)} />
                {estado.etiqueta || visual.label}
              </span>
            </div>
            {subTituloHeader && (
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {subTituloHeader}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Resultado
            </span>
            <ResultadoScore
              value={mostrarResultado ? resultado : null}
              empty="—"
              className="text-xl sm:text-2xl md:text-3xl font-black"
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
