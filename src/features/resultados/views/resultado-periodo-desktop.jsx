import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { HallazgoResultado } from '@/features/resultados/components/area/hallazgo-resultado';
import { HallazgosNavigator } from '@/features/resultados/components/area/hallazgos-navigator';
import { ResumenPeriodoHeader } from '@/features/resultados/components/area/resumen-periodo-header';
import { formatPeriodLabel } from '@/features/resultados/utils/resultados-format';

function CompactSinHallazgos() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
        <Icon name="check_circle" size="20px" />
      </div>
      <div>
        <h4 className="text-xs font-black uppercase text-slate-900">Sin hallazgos</h4>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">
          No se registraron hallazgos en este periodo.
        </p>
      </div>
    </div>
  );
}

export function ResultadoPeriodoDesktop({ data, areaId, mes }) {
  const [currentHallazgoIndex, setCurrentHallazgoIndex] = useState(0);
  const hallazgos = data.hallazgos ?? [];
  const totalHallazgos = hallazgos.length;

  return (
    <div className="space-y-4">
      <ResumenPeriodoHeader data={data} areaId={areaId} mes={mes} />

      {/* Stats Bar Compacta */}
      <Card className="border-app-border bg-white shadow-sm overflow-hidden">
        <CardBody className="p-3 grid grid-cols-2 divide-x divide-slate-100 text-center">
          <div className="px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Puntos</p>
            <p className="mt-0.5 text-xs font-black text-slate-900">
              {data.resultado.puntosObtenidos === null
                ? '—'
                : `${data.resultado.puntosObtenidos} / ${data.resultado.puntosPosibles}`}
            </p>
          </div>
          <div className="px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Hallazgos</p>
            <p className="mt-0.5 text-xs font-black text-slate-900">{data.resultado.hallazgos}</p>
          </div>
        </CardBody>
      </Card>

      {/* Content */}
      {!data.resultado.completado ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs font-black uppercase text-slate-700">{formatPeriodLabel(data.periodo)} pendiente</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Este periodo todavía no tiene resultado registrado.</p>
        </div>
      ) : totalHallazgos === 0 ? (
        <CompactSinHallazgos />
      ) : (
        <div className="space-y-3">
          <HallazgosNavigator
            total={totalHallazgos}
            current={currentHallazgoIndex}
            onChange={setCurrentHallazgoIndex}
          />
          {hallazgos[currentHallazgoIndex] && (
            <HallazgoResultado hallazgo={hallazgos[currentHallazgoIndex]} />
          )}
        </div>
      )}
    </div>
  );
}
