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
    <>
      {/* 1. Encabezado */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento leading-none">
          Monitoreo
        </p>
        <h1 className="fuente-titulos text-2xl sm:text-3xl font-normal uppercase leading-tight text-marca-primario mt-0.5">
          Resultados 5S
        </h1>
      </div>

      {/* 2. Tabs General / Áreas (Fijos / Sticky) */}
      <SectionTabs tabs={tabs} />

      {/* 3. Selector de Fecha / Periodo POR DEBAJO DEL MENÚ */}
      {activeView === 'general' ? (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:p-4 backdrop-blur-xl shadow-xs">
          <SelectorRangoResultados
            tipo={rangoParams.tipo}
            mes={rangoParams.mes || mes}
            anio={rangoParams.anio}
            trimestre={rangoParams.trimestre}
            semestre={rangoParams.semestre}
            onChange={onRangoChange}
            rightAction={<ExportarResultadosButton rangoParams={rangoParams} data={data} />}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:p-4 backdrop-blur-xl shadow-xs w-full">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtrar por periodo</p>
            <p className="text-xs sm:text-sm font-black text-slate-900">Periodo {mes}</p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[260px]">
            <SelectorMes value={mes} onChange={onMesChange} />
          </div>
        </div>
      )}
    </>
  );
}
