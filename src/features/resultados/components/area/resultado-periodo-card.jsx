import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ResultadoBadge } from '@/features/resultados/components/shared/resultado-badge';
import { formatPeriodLabel, formatShortDate } from '@/features/resultados/utils/resultados-format';

export function ResultadoPeriodoCard({ areaId, mes, periodo }) {
  return (
    <Card variant="glass">
      <CardHeader className="flex flex-row items-start justify-between gap-3 bg-white/45">
        <div>
          <h2 className="text-base font-black uppercase text-slate-900">
            {formatPeriodLabel(periodo.periodo)}
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {periodo.completado
              ? `Finalizado ${formatShortDate(periodo.finalizadoEn)}`
              : 'Pendiente'}
          </p>
        </div>
        <ResultadoBadge value={periodo.porcentaje} emptyLabel="Pendiente" />
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Puntos</p>
            <p className="mt-1 text-sm font-black text-slate-900">
              {periodo.puntosObtenidos === null ? '-' : `${periodo.puntosObtenidos} / ${periodo.puntosPosibles}`}
            </p>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Hallazgos</p>
            <p className="mt-1 text-sm font-black text-slate-900">{periodo.hallazgos}</p>
          </div>
          <div className="rounded-lg bg-white/60 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Imágenes</p>
            <p className="mt-1 text-sm font-black text-slate-900">{periodo.imagenes}</p>
          </div>
        </div>

        <Button
          as={Link}
          to={`/resultados/areas/${areaId}/periodo/${periodo.periodo}?mes=${mes}`}
          variant="outline"
          size="sm"
          icon="visibility"
          className="w-full"
          disabled={!periodo.completado}
        >
          Ver resultado
        </Button>
      </CardBody>
    </Card>
  );
}
