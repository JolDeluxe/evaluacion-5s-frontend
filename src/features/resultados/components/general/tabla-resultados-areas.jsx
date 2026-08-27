import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPeriodLabel } from '@/features/resultados/utils/resultados-format';
import { getResultadoHeatmapStyle } from '@/features/resultados/utils/resultado-colors';
import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';

function PeriodoCell({ periodo }) {
  if (periodo.porcentaje !== null && periodo.porcentaje !== undefined && periodo.porcentaje !== '') {
    return (
      <td className="px-5 py-3.5 text-center text-slate-800 font-bold">
        {formatPercentTrunc(periodo.porcentaje)}
      </td>
    );
  }

  const estado = periodo.estado;
  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-500';
  let label = 'Pendiente';

  if (estado === 'ATRASADA') {
    dotColor = 'bg-orange-500';
    textColor = 'text-orange-700 font-bold';
    label = 'Atrasada';
  } else if (estado === 'NO_REALIZADA') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-700 font-bold';
    label = 'No realizada';
  }

  return (
    <td className="px-5 py-3.5 text-center">
      <span className={cn('inline-flex items-center gap-1.5 text-xs', textColor)}>
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
        {label}
      </span>
    </td>
  );
}

function ResultadoFinalCell({ value, mostrarResultado }) {
  const hasValue = mostrarResultado && value !== null && value !== undefined && value !== '';

  if (hasValue) {
    const style = getResultadoHeatmapStyle(value);
    return (
      <td className="px-5 py-3.5 text-center transition-colors" style={style}>
        <span className="text-sm font-black">{formatPercentTrunc(value)}</span>
      </td>
    );
  }

  return (
    <td className="px-5 py-3.5 text-center text-slate-400 font-semibold">
      —
    </td>
  );
}

export function TablaResultadosAreas({ areas = [], mes, estadoMes }) {
  const mostrarResultado = Boolean(estadoMes?.mostrarResultado);

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm border-collapse">
          <thead className="sticky top-0 z-10 border-b border-app-border bg-slate-100/95 backdrop-blur text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Área</th>
              <th className="px-5 py-3 text-center">{formatPeriodLabel(1)}</th>
              <th className="px-5 py-3 text-center">{formatPeriodLabel(2)}</th>
              <th className="px-5 py-3 text-center">Resultado final</th>
              <th className="px-5 py-3 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border bg-white">
            {areas.map((item) => (
              <tr key={item.area.id} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5">
                  <p className="font-black uppercase text-slate-900">{item.area.nombre}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {item.area.tipo || 'DESCONOCIDO'}
                  </p>
                </td>
                {item.periodos.map((periodo) => (
                  <PeriodoCell key={periodo.periodo} periodo={periodo} />
                ))}
                <ResultadoFinalCell
                  value={item.resultadoMensual}
                  mostrarResultado={mostrarResultado}
                />
                <td className="px-5 py-3.5 text-right">
                  <Button
                    as={Link}
                    to={`/resultados/areas/${item.area.id}?mes=${mes}`}
                    variant="outline"
                    size="sm"
                    icon="visibility"
                  >
                    Ver área
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
