import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { ResultadoBadge } from '@/features/resultados/components/shared/resultado-badge';
import { formatPeriodLabel } from '@/features/resultados/utils/resultados-format';
import { cn } from '@/utils/cn';

export function ResultadoAreaRow({ item, mes }) {
  return (
    <tr className={cn('bg-white transition hover:bg-slate-50/70', item.area.esPropia && 'bg-amber-50/35 hover:bg-amber-50/55')}>
      <td className="px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-black uppercase text-slate-900">{item.area.nombre}</p>
          {item.area.esPropia && (
            <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-700">
              A cargo
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{item.area.tipo}</p>
      </td>
      <td className="px-5 py-4 text-center">
        <ResultadoBadge value={item.resultadoMensual} emptyLabel="Sin resultado" />
      </td>
      {item.periodos.map((periodo) => (
        <td key={periodo.periodo} className="px-5 py-4">
          <div className="flex items-center justify-center gap-2">
            <ResultadoBadge value={periodo.porcentaje} emptyLabel="Pendiente" />
            <Button
              as={Link}
              to={`/resultados/areas/${item.area.id}/periodo/${periodo.periodo}?mes=${mes}`}
              variant="soft"
              size="sm"
              icon="open_in_new"
              disabled={!periodo.completado}
            >
              Ver resultado
            </Button>
          </div>
        </td>
      ))}
      <td className="px-5 py-4 text-right">
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
  );
}
