import { Link } from 'react-router';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { getResultadoColor } from '@/features/resultados/utils/resultado-colors';

const formatPct = (value) => {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
};

export function ResultadoGlobalCard({ resultadoGlobal }) {
  if (!resultadoGlobal) return null;

  const rule = getResultadoColor(resultadoGlobal.porcentaje);
  const pctStr = formatPct(resultadoGlobal.porcentaje);

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
          <p className="text-xs font-semibold text-slate-500">
            {resultadoGlobal.areasConResultado} de {resultadoGlobal.totalAreas} áreas evaluadas
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={rule ? { color: rule.textColor } : undefined}
            >
              {pctStr}
            </span>
            {resultadoGlobal.porcentaje !== null && (
              <span
                className="text-xs font-bold"
                style={rule ? { color: rule.textColor } : undefined}
              >
              </span>
            )}
          </div>

          <Link
            to={`/resultados/general?mes=${resultadoGlobal.clave}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-black text-slate-800 hover:bg-slate-200 transition"
          >
            <span>Ver resultados</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
