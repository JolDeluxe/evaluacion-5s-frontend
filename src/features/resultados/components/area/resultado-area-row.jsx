import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { getResultadoCenterGlowStyle } from '@/features/resultados/utils/resultado-colors';
import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';

function PeriodoTextoCell({ periodo, areaId, mes }) {
  const location = useLocation();
  const hasValue = periodo.porcentaje !== null && periodo.porcentaje !== undefined && periodo.porcentaje !== '';

  if (hasValue) {
    const isGeneral = location.pathname.includes('/resultados/general');
    const fromLabel = isGeneral ? 'General' : 'Áreas';
    return (
      <td className="px-5 py-3.5 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-black text-slate-800">{formatPercentTrunc(periodo.porcentaje)}</span>
          <Button
            as={Link}
            to={`/resultados/areas/${areaId}/periodos/${periodo.periodo}?mes=${mes}`}
            state={{
              from: `${location.pathname}${location.search}`,
              fromLabel,
            }}
            variant="ghost"
            size="sm"
            icon="open_in_new"
            aria-label="Ver resultado"
          />
        </div>
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
      <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', textColor)}>
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
        {label}
      </span>
    </td>
  );
}

function ResultadoMensualCell({ value }) {
  const hasValue = value !== null && value !== undefined && value !== '';

  if (hasValue) {
    const style = getResultadoCenterGlowStyle(value);
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

export function ResultadoAreaRow({ item, mes }) {
  return (
    <tr className={cn('bg-white transition hover:bg-slate-50/70', item.area.esPropia && 'bg-amber-50/35 hover:bg-amber-50/55')}>
      <td className="px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-black uppercase text-slate-900">{item.area.nombre}</p>
        </div>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{item.area.tipo}</p>
      </td>

      {item.periodos.map((periodo) => (
        <PeriodoTextoCell
          key={periodo.periodo}
          periodo={periodo}
          areaId={item.area.id}
          mes={mes}
        />
      ))}

      <ResultadoMensualCell value={item.resultadoMensual} />

      <td className="px-5 py-3.5 text-right">
        <Button
          as={Link}
          to={`/resultados/areas/${item.area.id}?mes=${mes}`}
          state={{
            from: `${location.pathname}${location.search}`,
            fromLabel: location.pathname.includes('/resultados/general') ? 'General' : 'Áreas',
          }}
          variant="outline"
          size="sm"
          icon="visibility"
        >
          Ver área
        </Button>
      </td>
    </tr>
  );
}
