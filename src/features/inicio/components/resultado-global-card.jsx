import { Link } from 'react-router';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { getResultadoColor } from '@/features/resultados/utils/resultado-colors';

const formatPct = (value) => {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
};

export function ResultadoGlobalCard({ resultadoGlobal, resultadoMisAreas }) {
  if (!resultadoGlobal) return null;

  const rule = getResultadoColor(resultadoGlobal.porcentaje);
  const pctStr = formatPct(resultadoGlobal.porcentaje);
  const pctMisAreasStr = formatPct(resultadoMisAreas);
  const ruleMisAreas = resultadoMisAreas !== null && resultadoMisAreas !== undefined ? getResultadoColor(resultadoMisAreas) : null;

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <CardBody className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-marca-acento">
              RESULTADOS · {resultadoGlobal.etiqueta.toUpperCase()}
            </span>
            {rule && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: `rgba(${rule.rgb.join(',')}, 0.12)`, color: rule.textColor }}
              >
                {rule.label}
              </span>
            )}
          </div>
          <h2 className="text-lg font-black text-slate-950 uppercase">Resultado global</h2>

        </div>

        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-baseline gap-2">
              <span
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={rule ? { color: rule.textColor } : undefined}
              >
                {pctStr}
              </span>
            </div>

            {resultadoMisAreas !== null && resultadoMisAreas !== undefined && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Promedio de tus áreas:{' '}
                <span
                  className="font-bold"
                  style={ruleMisAreas ? { color: ruleMisAreas.textColor } : undefined}
                >
                  {pctMisAreasStr}
                </span>
              </p>
            )}
          </div>

          <Link
            to={`/resultados/general?mes=${resultadoGlobal.clave}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-black text-slate-800 hover:bg-slate-200 transition shrink-0"
          >
            <span>Ver resultados</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
