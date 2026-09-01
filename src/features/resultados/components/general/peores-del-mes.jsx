import { Card, CardBody } from '@/components/ui/card';
import { ResultadoScore } from '@/features/resultados/components/shared/resultado-score';
import { cn } from '@/utils/cn';

function PeorBlock({ label, data, mostrarResultado, mensaje }) {
  const worstScore = data?.resultado;
  const areas = data?.areas ?? [];
  const tienePeores = Boolean(mostrarResultado && worstScore !== null && worstScore !== undefined && areas.length > 0);

  return (
    <div className="flex-1 rounded-lg border border-app-border bg-white p-3.5 sm:p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>

      {!mostrarResultado ? (
        <div className="mt-2 text-xs font-semibold text-slate-500">
          {mensaje || 'Los resultados se definirán al cierre del mes'}
        </div>
      ) : tienePeores ? (
        <div className="mt-2.5 space-y-2 divide-y divide-slate-100">
          {areas.map((area, idx) => (
            <div key={area.id} className={cn('flex items-baseline justify-between gap-3', idx > 0 && 'pt-2')}>
              <p className="min-w-0 flex-1 break-words text-xs sm:text-sm font-black uppercase text-slate-900 leading-tight">
                {area.nombre}
              </p>
              <ResultadoScore
                value={worstScore}
                className="shrink-0 text-base sm:text-lg md:text-xl font-black text-slate-900"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-xs font-semibold text-slate-400">
          Sin áreas evaluables
        </div>
      )}
    </div>
  );
}

export function PeoresDelMes({ peoresPorTipo = {}, mostrarResultado = false, mensaje, titulo = 'Peores del mes' }) {
  const adminData = peoresPorTipo?.administrativo;
  const operData = peoresPorTipo?.operativo;
  const esBasadoEnDisponibles = Boolean(
    (adminData?.rankingProvisional || operData?.rankingProvisional) &&
    (adminData?.resultado !== null || operData?.resultado !== null),
  );

  return (
    <Card className="border-app-border bg-white shadow-sm">
      <CardBody className="p-4 md:p-5 space-y-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            {titulo}
          </h3>
          {esBasadoEnDisponibles && (
            <p className="text-[11px] font-semibold text-slate-500">
              Basado en los resultados disponibles
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <PeorBlock
            label="ADMINISTRATIVO"
            data={adminData}
            mostrarResultado={mostrarResultado}
            mensaje={mensaje}
          />
          <PeorBlock
            label="OPERATIVO"
            data={operData}
            mostrarResultado={mostrarResultado}
            mensaje={mensaje}
          />
        </div>
      </CardBody>
    </Card>
  );
}
