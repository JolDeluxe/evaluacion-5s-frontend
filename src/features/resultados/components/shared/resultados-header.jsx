import { Link } from 'react-router';
import { SelectorMes } from '@/features/resultados/components/shared/selector-mes';
import { SelectorRangoResultados } from '@/features/resultados/components/general/selector-rango-resultados';
import { ExportarResultadosButton } from '@/features/resultados/components/general/exportar-resultados-button';
import { SectionTabs } from '@/components/ui/section-tabs';
import { cn } from '@/utils/cn';

export function ResultadosHeader({
  mes,
  onMesChange,
  activeView,
  canViewGeneral,
  rangoParams = {},
  onRangoChange,
  searchParamsStr = '',
  data,
}) {
  const currentQueryStr = searchParamsStr ? `?${searchParamsStr}` : `?mes=${mes}`;

  const tabs = [
    ...(canViewGeneral ? [{ id: 'general', label: 'General', to: `/resultados/general${currentQueryStr}` }] : []),
    { id: 'areas', label: 'Áreas', to: `/resultados/areas?mes=${mes}` },
  ];

  return (
    <div className="space-y-3">
      {/* 1. Encabezado */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento leading-none">
          Monitoreo
        </p>
        <h1 className="fuente-titulos text-2xl sm:text-3xl font-normal uppercase leading-tight text-marca-primario mt-0.5">
          Resultados 5S
        </h1>
      </div>

      {activeView === 'general' ? (
        <div className="space-y-2">
          {/* Selector de Rango (Tabs de rango + Navegación por fecha) */}
          <SelectorRangoResultados
            tipo={rangoParams.tipo}
            mes={rangoParams.mes || mes}
            anio={rangoParams.anio}
            trimestre={rangoParams.trimestre}
            semestre={rangoParams.semestre}
            onChange={onRangoChange}
          />

          {/* Fila exclusiva del botón PDF a la derecha en mobile / desktop */}
          <div className="flex justify-end pt-0.5">
            <ExportarResultadosButton rangoParams={rangoParams} data={data} />
          </div>
        </div>
      ) : (
        <div className="w-full sm:w-[260px]">
          <SelectorMes value={mes} onChange={onMesChange} />
        </div>
      )}

      {/* Tabs General / Áreas */}
      <SectionTabs tabs={tabs} />
    </div>
  );
}
