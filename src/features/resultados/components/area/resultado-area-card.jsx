import { Link, useLocation } from 'react-router';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatPeriodLabel } from '@/features/resultados/utils/resultados-format';
import { getResultadoCenterGlowStyle } from '@/features/resultados/utils/resultado-colors';
import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';

function EstadoPeriodoTexto({ periodo }) {
  const hasValue = periodo.porcentaje !== null && periodo.porcentaje !== undefined && periodo.porcentaje !== '';
  if (hasValue) {
    return <span className="text-sm font-black text-slate-800">{formatPercentTrunc(periodo.porcentaje)}</span>;
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
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', textColor)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
      {label}
    </span>
  );
}

function ResultadoMensualTag({ value }) {
  const hasValue = value !== null && value !== undefined && value !== '';

  if (hasValue) {
    const style = getResultadoCenterGlowStyle(value);
    return (
      <div className="rounded-lg px-3 py-1.5 text-center transition-colors" style={style}>
        <span className="text-base font-black">{formatPercentTrunc(value)}</span>
      </div>
    );
  }

  return <span className="text-sm font-semibold text-slate-400">—</span>;
}

export function ResultadoAreaCard({ item, mes, rango }) {
  const location = useLocation();

  const isGeneral = location.pathname.includes('/resultados/general');
  const fromLabel = isGeneral ? 'General' : 'Áreas';
  const tipoRango = rango?.tipo || 'mes';

  return (
    <Card
      variant="glass"
      className={cn(
        'shadow-[0_4px_16px_rgba(15,23,42,0.04)] border-app-border bg-white overflow-hidden',
        item.area.esPropia && 'border-amber-200/80 bg-amber-50/20',
      )}
    >
      <div className="flex items-start justify-between gap-2.5 p-3.5 sm:p-4 bg-slate-50/50 border-b border-app-border">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 leading-none">
            {item.area.tipo || 'Área'}
          </p>
          <h2 className="mt-1 break-words text-sm sm:text-base font-black uppercase text-slate-900 leading-tight">
            {item.posicion !== null && item.posicion !== undefined ? `${String(item.posicion).padStart(2, '0')} · ` : ''}
            {item.area.nombre}
          </h2>
        </div>
      </div>

      <CardBody className="p-3 sm:p-4 space-y-2.5">
        {tipoRango === 'mes' && (item.periodos || []).map((periodo) => (
          <div
            key={periodo.periodo}
            className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/80 px-3 py-2 text-xs border border-slate-100"
          >
            <div className="min-w-0 flex-1">
              <span className="font-black uppercase text-slate-800">
                {formatPeriodLabel(periodo.periodo)}
              </span>
              {periodo.completado && (
                <span className="ml-2 text-[10px] font-medium text-slate-400">
                  {periodo.hallazgos} hallazgos
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <EstadoPeriodoTexto periodo={periodo} />
              <Button
                as={Link}
                to={`/resultados/areas/${item.area.id}/periodos/${periodo.periodo}?mes=${mes}`}
                state={{
                  from: `${location.pathname}${location.search}`,
                  fromLabel,
                }}
                variant="ghost"
                size="sm"
                icon="open_in_new"
                disabled={!periodo.completado}
                aria-label={`Ver ${formatPeriodLabel(periodo.periodo)}`}
                className="h-7 w-7 p-0"
              />
            </div>
          </div>
        ))}

        {(tipoRango === 'trimestre' || tipoRango === 'semestre') && (
          <div className="grid grid-cols-3 gap-1.5">
            {(item.mesesDetalle || []).map((m) => (
              <div key={m.clave} className="rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400">{m.abrev}</p>
                <p className="mt-0.5 text-xs font-black text-slate-900">
                  {m.resultadoMensual !== null && m.resultadoMensual !== undefined
                    ? formatPercentTrunc(m.resultadoMensual)
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        {tipoRango === 'anio' && (
          <div className="grid grid-cols-4 gap-1.5">
            {(item.trimestresDetalle || []).map((t) => (
              <div key={t.trimestre} className="rounded-lg bg-slate-50 p-2 text-center border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400">T{t.trimestre}</p>
                <p className="mt-0.5 text-xs font-black text-slate-900">
                  {t.resultado !== null && t.resultado !== undefined
                    ? formatPercentTrunc(t.resultado)
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <span className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">
            {tipoRango === 'mes' ? 'Resultado mensual' : 'Resultado'}
          </span>
          <ResultadoMensualTag value={item.resultadoRango ?? item.resultadoMensual} />
        </div>
      </CardBody>
    </Card>
  );
}
