import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

function BadgeEstadoTemporal({ estadoTemporal }) {
  if (estadoTemporal === 'EN_CURSO') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] sm:text-xs font-black uppercase tracking-wider text-emerald-700 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        EN CURSO
      </span>
    );
  }
  if (estadoTemporal === 'ATRASADO') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] sm:text-xs font-black uppercase tracking-wider text-amber-700 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        ATRASADO
      </span>
    );
  }
  if (estadoTemporal === 'FINALIZADO') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] sm:text-xs font-black uppercase tracking-wider text-slate-600 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        FINALIZADO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/80 px-2 py-0.5 text-[9px] sm:text-xs font-black uppercase tracking-wider text-slate-500 shrink-0">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      AÚN NO INICIA
    </span>
  );
}

function TarjetaPeriodo({ item, esAdmin }) {
  const {
    etiqueta,
    rangoFechas,
    estadoTemporal,
    totalAuditorias,
    realizadas,
    pendientes,
    atrasadas,
    noRealizadas,
    areasSinAuditor,
  } = item;

  const esFuturo = estadoTemporal === 'AUN_NO_INICIA';

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
      <CardBody className="p-3 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        {/* Cabecera del Periodo: NUNCA se corta con ellipsis */}
        <div className="space-y-1 border-b border-slate-100 pb-2.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5 min-w-0">
            <span className="text-[11px] sm:text-base font-black uppercase tracking-tight text-slate-950 leading-tight">
              {etiqueta}
            </span>
            <BadgeEstadoTemporal estadoTemporal={estadoTemporal} />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 capitalize">
            {rangoFechas}
          </p>
        </div>

        {/* Métricas internas */}
        {esFuturo ? (
          <div className="space-y-2 pt-0.5">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-950 leading-none">
                {totalAuditorias}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-600">
                {totalAuditorias === 1 ? 'auditoría' : 'auditorías'}
              </span>
            </div>

            {esAdmin && (
              <div className="flex items-baseline gap-1.5 text-xs">
                <span className={`text-base sm:text-xl font-black leading-none ${areasSinAuditor > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {areasSinAuditor}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 lowercase">
                  {areasSinAuditor === 1 ? 'área sin auditor' : 'áreas sin auditor'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 pt-0.5">
            {/* Total auditorías */}
            <div className="flex items-baseline gap-1.5 pb-1.5 border-b border-slate-100/70 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-950 leading-none">
                {totalAuditorias}
              </span>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-slate-600">
                {totalAuditorias === 1 ? 'auditoría' : 'auditorías'}
              </span>
            </div>

            {/* Lista de indicadores por estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {/* Pendientes */}
              {pendientes > 0 && (
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-base sm:text-xl font-black text-amber-600 leading-none">
                    {pendientes}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-amber-900/80 lowercase">
                    {pendientes === 1 ? 'pendiente' : 'pendientes'}
                  </span>
                </div>
              )}

              {/* Realizadas */}
              {realizadas > 0 && (
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-base sm:text-xl font-black text-emerald-600 leading-none">
                    {realizadas}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-900/80 lowercase">
                    {realizadas === 1 ? 'realizada' : 'realizadas'}
                  </span>
                </div>
              )}

              {/* Atrasadas */}
              {atrasadas > 0 && (
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-base sm:text-xl font-black text-rose-600 leading-none">
                    {atrasadas}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-rose-900/80 lowercase">
                    {atrasadas === 1 ? 'atrasada' : 'atrasadas'}
                  </span>
                </div>
              )}

              {/* No realizadas */}
              {noRealizadas > 0 && (
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-base sm:text-xl font-black text-rose-700 leading-none">
                    {noRealizadas}
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-rose-950/80 lowercase">
                    no {noRealizadas === 1 ? 'realizada' : 'realizadas'}
                  </span>
                </div>
              )}
            </div>

            {/* Áreas sin auditor (SOLO ADMINISTRADOR) */}
            {esAdmin && (
              <div className="pt-1.5 border-t border-slate-100 flex items-baseline gap-1.5 text-xs min-w-0">
                <span className={`text-base sm:text-xl font-black leading-none ${areasSinAuditor > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {areasSinAuditor}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 lowercase">
                  {areasSinAuditor === 1 ? 'área sin auditor' : 'áreas sin auditor'}
                </span>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function ResumenTarjetasMes({ periodosResumen, resumen, esAdmin, etiquetaMesControl }) {
  if (!periodosResumen && !resumen) return null;

  return (
    <div className="space-y-3">
      {/* Encabezado General */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Auditorías de {etiquetaMesControl}
        </h2>

        {esAdmin && (
          <Button
            as={Link}
            to="/admin/asignaciones"
            variant="outline"
            size="sm"
            icon="tune"
            className="self-start sm:self-auto shrink-0"
          >
            Gestionar asignaciones
          </Button>
        )}
      </div>

      {/* Contenedor de Periodos: SIEMPRE 2 COLUMNAS LADO A LADO (grid-cols-2) */}
      {periodosResumen && periodosResumen.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {periodosResumen.map((item) => (
            <TarjetaPeriodo key={item.periodo} item={item} esAdmin={esAdmin} />
          ))}
        </div>
      ) : (
        /* Fallback legacy si no existe periodosResumen */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-slate-200/80 bg-white shadow-sm p-4">
            <p className="text-xl font-black text-slate-950">{resumen?.asignadas}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-500">Asignadas</p>
          </Card>
          <Card className="border-slate-200/80 bg-white shadow-sm p-4">
            <p className="text-xl font-black text-slate-950">{resumen?.pendientes}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-500">Pendientes</p>
          </Card>
          <Card className="border-slate-200/80 bg-white shadow-sm p-4">
            <p className="text-xl font-black text-slate-950">{resumen?.realizadas}</p>
            <p className="text-[10px] font-extrabold uppercase text-slate-500">Realizadas</p>
          </Card>
          {esAdmin && (
            <Card className="border-slate-200/80 bg-white shadow-sm p-4">
              <p className="text-xl font-black text-slate-950">{resumen?.sinAuditor}</p>
              <p className="text-[10px] font-extrabold uppercase text-slate-500">Sin auditor</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}



