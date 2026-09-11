import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getResultadoCenterGlowStyle } from '@/features/resultados/utils/resultado-colors';
import { canViewAreaDetail } from '@/features/resultados/utils/resultados-permissions';
import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';

import { EstadoBadge } from '@/features/auditorias/shared/components/estado-badge';
import { obtenerEstadoVisualAuditoria } from '@/features/auditorias/shared/utils/estados-auditoria';

function PeriodoTextoCell({ periodo, areaId, mes, canViewDetail = true }) {
  const location = useLocation();
  const hasValue = periodo.porcentaje !== null && periodo.porcentaje !== undefined && periodo.porcentaje !== '';

  if (hasValue) {
    const isGeneral = location.pathname.includes('/resultados/general');
    const fromLabel = isGeneral ? 'General' : 'Áreas';
    const estadoVisual = obtenerEstadoVisualAuditoria(periodo);
    const esTarde = estadoVisual === 'REALIZADA_TARDE';

    return (
      <td className="px-5 py-3.5 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-800">{formatPercentTrunc(periodo.porcentaje)}</span>
              {esTarde && (
                <EstadoBadge estado="REALIZADA_TARDE" className="text-[10px] px-1.5 py-0" />
              )}
            </div>
            {periodo.auditorEjecutor?.etiqueta && (
              <span
                className="mt-0.5 block text-[10px] font-medium text-slate-400 truncate max-w-[130px]"
                title={periodo.auditorEjecutor.etiqueta}
              >
                {periodo.auditorEjecutor.etiqueta}
              </span>
            )}
          </div>
          {canViewDetail && (
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
          )}
        </div>
      </td>
    );
  }

  return (
    <td className="px-5 py-3.5 text-center">
      <EstadoBadge estado={periodo} />
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
  const { user } = useAuth();
  const canViewDetail = canViewAreaDetail(user?.rol);

  const valorResultado = item.resultadoMensual;
  const tieneResultado = valorResultado !== null && valorResultado !== undefined && valorResultado !== '';
  const todosNoRealizada = (item.periodos || []).length > 0 &&
    (item.periodos || []).every((p) => obtenerEstadoVisualAuditoria(p) === 'NO_REALIZADA');
  const estaInactiva = !tieneResultado || todosNoRealizada;

  return (
    <tr
      className={cn(
        'bg-white transition hover:bg-slate-50/70',
        item.area.esPropia && 'bg-amber-50/35 hover:bg-amber-50/55',
        estaInactiva && 'opacity-60 bg-slate-50/50 hover:bg-slate-100/50'
      )}
    >
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
          canViewDetail={canViewDetail}
        />
      ))}

      <ResultadoMensualCell value={item.resultadoMensual} />

      <td className="px-5 py-3.5 text-right">
        {canViewDetail ? (
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
        ) : (
          <span className="text-xs text-slate-400 font-semibold">—</span>
        )}
      </td>
    </tr>
  );
}
