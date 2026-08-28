import { Link, useLocation } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPeriodLabel, formatShortDate } from '@/features/resultados/utils/resultados-format';
import { getResultadoColor } from '@/features/resultados/utils/resultado-colors';
import { formatPercentTrunc } from '@/utils/format';

function ResultadoPeriodoCelda({ periodo }) {
  if (periodo.completado && periodo.porcentaje !== null && periodo.porcentaje !== undefined) {
    const semaforo = getResultadoColor(periodo.porcentaje);
    return (
      <span className="text-sm font-black" style={{ color: semaforo?.textColor }}>
        {formatPercentTrunc(periodo.porcentaje)}
      </span>
    );
  }

  const estado = periodo.estado;
  if (estado === 'NO_REALIZADA') {
    return <span className="text-xs font-semibold text-rose-600">No realizada</span>;
  }
  if (estado === 'ATRASADA') {
    return <span className="text-xs font-semibold text-amber-600">Atrasada</span>;
  }
  return <span className="text-xs font-semibold text-slate-400">Pendiente</span>;
}

export function PeriodosAreaTable({ areaId, mes, periodos = [] }) {
  const location = useLocation();

  return (
    <Card className="overflow-hidden shadow-sm border-app-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-app-border bg-slate-50/70 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Periodo</th>
              <th className="px-5 py-3 text-center">Resultado</th>
              <th className="px-5 py-3 text-center">Puntos</th>
              <th className="px-5 py-3 text-center">Hallazgos</th>
              <th className="px-5 py-3 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border bg-white">
            {periodos.map((p) => (
              <tr key={p.periodo} className="transition hover:bg-slate-50/70">
                <td className="px-5 py-3.5 font-black uppercase text-slate-900">
                  {formatPeriodLabel(p.periodo)}
                  {p.finalizadoEn && (
                    <span className="block text-[10px] font-normal text-slate-400">
                      {formatShortDate(p.finalizadoEn)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <ResultadoPeriodoCelda periodo={p} />
                </td>
                <td className="px-5 py-3.5 text-center text-xs font-semibold text-slate-700">
                  {p.puntosObtenidos === null ? '—' : `${p.puntosObtenidos} / ${p.puntosPosibles}`}
                </td>
                <td className="px-5 py-3.5 text-center text-xs font-semibold text-slate-700">
                  {p.completado ? p.hallazgos : '—'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Button
                    as={Link}
                    to={`/resultados/areas/${areaId}/periodos/${p.periodo}?mes=${mes}`}
                    state={{
                      from: `${location.pathname}${location.search}`,
                      fromLabel: 'Área',
                    }}
                    variant="ghost"
                    size="sm"
                    icon="visibility"
                    disabled={!p.completado}
                  >
                    Ver detalle
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
