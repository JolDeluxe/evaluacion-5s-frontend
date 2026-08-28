import { Card, CardBody } from '@/components/ui/card';
import { formatPeriodLabel } from '@/features/resultados/utils/resultados-format';
import { getResultadoColor } from '@/features/resultados/utils/resultado-colors';
import { formatPercentTrunc } from '@/utils/format';

export function ResumenPeriodoHeader({ data }) {
  const hasValue = data.resultado.porcentaje !== null && data.resultado.porcentaje !== undefined && data.resultado.porcentaje !== '';
  const semaforo = hasValue ? getResultadoColor(data.resultado.porcentaje) : null;

  return (
    <Card className="border-app-border bg-white shadow-sm overflow-hidden">
      <CardBody className="p-4 md:p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            {data.mes?.etiqueta}
          </span>
          <h1 className="mt-1 text-xl md:text-2xl font-black uppercase text-slate-900 leading-tight">
            {data.area.nombre}
          </h1>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            {formatPeriodLabel(data.periodo)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center border-t border-slate-100 pt-3 md:border-0 md:pt-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            Resultado del periodo
          </p>
          {hasValue ? (
            <span
              className="text-lg md:text-xl font-black"
              style={{ color: semaforo?.textColor }}
            >
              {formatPercentTrunc(data.resultado.porcentaje)}
            </span>
          ) : (
            <span className="text-base font-semibold text-slate-400">Pendiente</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
