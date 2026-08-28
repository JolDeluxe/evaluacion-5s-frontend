import { ResumenAreaHeader } from '@/features/resultados/components/area/resumen-area-header';
import { PeriodosAreaTable } from '@/features/resultados/components/area/periodos-area-table';

export function ResultadoAreaDesktop({ data, mes }) {
  return (
    <div className="space-y-4">
      <ResumenAreaHeader data={data} mes={mes} />
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 px-1">
          Periodos de auditoría
        </h3>
        <PeriodosAreaTable areaId={data.area.id} mes={mes} periodos={data.periodos} />
      </div>
    </div>
  );
}
