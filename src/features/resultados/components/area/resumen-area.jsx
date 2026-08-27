import { Card, CardBody } from '@/components/ui/card';
import { ResultadoBadge } from '@/features/resultados/components/shared/resultado-badge';

export function ResumenArea({ data }) {
  return (
    <Card className="border-slate-900 bg-slate-950 text-white">
      <CardBody className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Área
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase leading-tight text-white">
            {data.area.nombre}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-300">
            {data.mes.etiqueta}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 md:block md:text-right">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
            Resultado mensual
          </p>
          <ResultadoBadge
            value={data.resultadoMensual}
            emptyLabel="Sin resultado"
            className="mt-0 border-white/15 bg-white/10 px-4 py-2 text-lg text-white md:mt-2"
          />
        </div>
      </CardBody>
    </Card>
  );
}
