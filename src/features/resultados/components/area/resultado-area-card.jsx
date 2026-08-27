import { Link } from 'react-router';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResultadoBadge } from '@/features/resultados/components/shared/resultado-badge';
import { formatPeriodLabel } from '@/features/resultados/utils/resultados-format';
import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';

export function ResultadoAreaCard({ item, mes }) {
  return (
    <Card
      variant="glass"
      className={cn(
        'shadow-[0_10px_28px_rgba(15,23,42,0.06)]',
        item.area.esPropia && 'border-amber-200/70 bg-amber-50/30',
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 bg-white/45">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black uppercase text-slate-900">
            {item.area.nombre}
          </h2>
          {item.area.esPropia && (
            <span className="mt-1 inline-flex rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-700">
              A cargo
            </span>
          )}
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            Resultado final
          </p>
        </div>
        <ResultadoBadge value={item.resultadoMensual} emptyLabel="—" />
      </CardHeader>

      <CardBody className="space-y-3">
        {item.periodos.map((periodo) => {
          const hasValue = periodo.porcentaje !== null && periodo.porcentaje !== undefined && periodo.porcentaje !== '';
          return (
            <div
              key={periodo.periodo}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/70 bg-white/55 px-3 py-3"
            >
              <div>
                <p className="text-sm font-black text-slate-900">
                  {formatPeriodLabel(periodo.periodo)}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  {periodo.completado ? `${periodo.hallazgos} hallazgos` : 'Pendiente'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {hasValue ? formatPercentTrunc(periodo.porcentaje) : '—'}
                </span>
                <Button
                  as={Link}
                  to={`/resultados/areas/${item.area.id}/periodo/${periodo.periodo}?mes=${mes}`}
                  variant="icon"
                  size="icon"
                  icon="chevron_right"
                  disabled={!periodo.completado}
                  aria-label={`Ver ${formatPeriodLabel(periodo.periodo)}`}
                />
              </div>
            </div>
          );
        })}

        <Button
          as={Link}
          to={`/resultados/areas/${item.area.id}?mes=${mes}`}
          variant="outline"
          size="sm"
          icon="visibility"
          className="w-full"
        >
          Ver área
        </Button>
      </CardBody>
    </Card>
  );
}
