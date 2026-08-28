import { Link, useLocation } from 'react-router';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResumenAreaHeader } from '@/features/resultados/components/area/resumen-area-header';
import { formatPeriodLabel } from '@/features/resultados/utils/resultados-format';
import { getResultadoCenterGlowStyle } from '@/features/resultados/utils/resultado-colors';
import { formatPercentTrunc } from '@/utils/format';

function EstadoPeriodoValor({ periodo }) {
  if (periodo.completado && periodo.porcentaje !== null && periodo.porcentaje !== undefined) {
    const glowStyle = getResultadoCenterGlowStyle(periodo.porcentaje);
    return (
      <div className="rounded-lg px-2.5 py-1 text-center transition-colors" style={glowStyle}>
        <span className="text-sm font-black">{formatPercentTrunc(periodo.porcentaje)}</span>
      </div>
    );
  }

  const estado = periodo.estado;
  if (estado === 'NO_REALIZADA') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        No realizada
      </span>
    );
  }
  if (estado === 'ATRASADA') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Atrasada
      </span>
    );
  }
  return <span className="text-xs font-semibold text-slate-400">Pendiente</span>;
}

export function ResultadoAreaMobile({ data, mes }) {
  const location = useLocation();

  return (
    <div className="space-y-4">
      <ResumenAreaHeader data={data} mes={mes} />

      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 px-1">
          Periodos de auditoría
        </h3>

        {data.periodos.map((periodo) => (
          <Card key={periodo.periodo} variant="glass" className="shadow-sm border-app-border bg-white">
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-white/45 p-4">
              <h4 className="text-sm font-black uppercase text-slate-900">
                {formatPeriodLabel(periodo.periodo)}
              </h4>
              <EstadoPeriodoValor periodo={periodo} />
            </CardHeader>
            <CardBody className="p-4 pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Puntos</p>
                  <p className="mt-0.5 text-xs font-black text-slate-900">
                    {periodo.puntosObtenidos === null ? '—' : `${periodo.puntosObtenidos} / ${periodo.puntosPosibles}`}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Hallazgos</p>
                  <p className="mt-0.5 text-xs font-black text-slate-900">
                    {periodo.completado ? periodo.hallazgos : '—'}
                  </p>
                </div>
              </div>

              <Button
                as={Link}
                to={`/resultados/areas/${data.area.id}/periodos/${periodo.periodo}?mes=${mes}`}
                state={{
                  from: `${location.pathname}${location.search}`,
                  fromLabel: 'Área',
                }}
                variant="outline"
                size="sm"
                icon="visibility"
                className="w-full"
                disabled={!periodo.completado}
              >
                Ver detalle
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
