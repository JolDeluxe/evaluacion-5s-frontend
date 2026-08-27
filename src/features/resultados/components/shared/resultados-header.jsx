import { Link } from 'react-router';
import { SelectorMes } from '@/features/resultados/components/shared/selector-mes';
import { cn } from '@/utils/cn';

export function ResultadosHeader({ mes, onMesChange, activeView, canViewGeneral }) {
  const tabs = [
    ...(canViewGeneral ? [{ id: 'general', label: 'General', to: `/resultados/general?mes=${mes}` }] : []),
    { id: 'areas', label: 'Áreas', to: `/resultados/areas?mes=${mes}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
            Monitoreo
          </p>
          <h1 className="fuente-titulos text-3xl font-normal uppercase leading-none text-marca-primario">
            Resultados 5S
          </h1>
        </div>

        <SelectorMes value={mes} onChange={onMesChange} />
      </div>

      <div className="flex gap-2 border-b border-app-border">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.to}
            className={cn(
              'border-b-2 px-2 pb-3 text-sm font-black transition',
              activeView === tab.id
                ? 'border-marca-secundario text-marca-primario'
                : 'border-transparent text-slate-500 hover:text-slate-800',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
