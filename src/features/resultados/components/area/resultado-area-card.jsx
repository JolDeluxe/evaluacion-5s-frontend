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
        'shadow-[0_10px_28px_rgba(15,23,42,0.06)] border-app-border bg-white',
        item.area.esPropia && 'border-amber-200/70 bg-amber-50/30',
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 bg-white/45 p-4 border-b border-app-border">
        <div className="min-w-0">
          <h2 className="truncate text-base font-black uppercase text-slate-900">
            {item.posicion !== null && item.posicion !== undefined ? `${String(item.posicion).padStart(2, '0')} · ` : ''}
            {item.area.nombre}
          </h2>
          {item.area.esPropia && (
            <span className="mt-1 inline-flex rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-700">
              A cargo
            </span>
          )}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
          {item.area.tipo || 'Área'}
        </p>
      </CardHeader>

      <CardBody className="p-4 space-y-3">
        {tipoRango === 'mes' && (item.periodos || []).map((periodo) => (
          <div
            key={periodo.periodo}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5"
          >
            <div>
              <p className="text-xs font-black uppercase text-slate-900">
                {formatPeriodLabel(periodo.periodo)}
              </p>
              {periodo.completado && (
                <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                  {periodo.hallazgos} hallazgos
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
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
              />
            </div>
          </div>
        ))}

        {(tipoRango === 'trimestre' || tipoRango === 'semestre') && (
          <div className="grid grid-cols-3 gap-2">
            {(item.mesesDetalle || []).map((m) => (
              <div key={m.clave} className="rounded-lg bg-slate-50 p-2 text-center">
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
              <div key={t.trimestre} className="rounded-lg bg-slate-50 p-2 text-center">
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

        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            {tipoRango === 'mes' ? 'Resultado mensual' : 'Resultado'}
          </p>
          <ResultadoMensualTag value={item.resultadoRango ?? item.resultadoMensual} />
        </div>
      </CardBody>
    </Card>
  );
}
