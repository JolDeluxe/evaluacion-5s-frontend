import { Card, CardBody } from '@/components/ui/card';
import { ResultadoScore } from '@/features/resultados/components/shared/resultado-score';

function WinnerBlock({ label, data, mostrarResultado, mensaje }) {
  const winnerScore = data?.resultado;
  const areas = data?.areas ?? [];
  const tieneGanador = Boolean(mostrarResultado && winnerScore !== null && winnerScore !== undefined && areas.length > 0);

  return (
    <div className="flex-1 rounded-lg border border-app-border bg-white p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>

      {!mostrarResultado ? (
        <div className="mt-2 text-xs font-semibold text-slate-500">
          {mensaje || 'Ganadores disponibles al cierre del mes'}
        </div>
      ) : tieneGanador ? (
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            {areas.map((area) => (
              <p key={area.id} className="truncate text-sm font-black uppercase text-slate-900">
                {area.nombre}
              </p>
            ))}
          </div>
          <ResultadoScore
            value={winnerScore}
            className="text-xl md:text-2xl font-black text-slate-900"
          />
        </div>
      ) : (
        <div className="mt-2 text-xs font-semibold text-slate-400">
          Sin ganadores elegibles
        </div>
      )}
    </div>
  );
}

export function GanadoresMes({ ganadoresPorTipo = {}, mostrarResultado = false, mensaje }) {
  const adminData = ganadoresPorTipo?.administrativo;
  const operData = ganadoresPorTipo?.operativo;

  return (
    <Card className="border-app-border bg-white shadow-sm">
      <CardBody className="p-4 md:p-5 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          Ganadores del mes
        </h3>
        <div className="flex flex-col gap-3 md:flex-row">
          <WinnerBlock
            label="ADMINISTRATIVO"
            data={adminData}
            mostrarResultado={mostrarResultado}
            mensaje={mensaje}
          />
          <WinnerBlock
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
