import { Card, CardBody } from '@/components/ui/card';
import { ResultadoScore } from '@/features/resultados/components/shared/resultado-score';
import { EstadoBadge } from '@/features/auditorias/shared/components/estado-badge';

function PeriodoMiniBadge({ periodoData, label }) {
  if (!periodoData || !periodoData.programada) {
    return (
      <span className="inline-flex items-center justify-center text-[10px] font-bold text-slate-300 w-6 h-5">
        —
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1">
      {label && <span className="text-[9px] font-black uppercase text-slate-400">{label}</span>}
      <EstadoBadge
        estado={periodoData}
        className="px-2 py-0 text-[10px] font-bold tracking-tight shadow-none h-5"
      />
    </div>
  );
}

export function ControlAuditoriasAdmin({
  etiquetaMesControl,
  mostrarMesAnterior = false,
  etiquetaMesAnterior = 'Agosto',
  controlFilas = [],
}) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-0">
      <div className="border-b border-slate-100 px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento leading-none">Seguimiento</p>
          <h2 className="text-sm font-black text-slate-950 uppercase mt-0.5 leading-tight">Control de auditorías</h2>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
          {etiquetaMesControl}
        </span>
      </div>

      <CardBody className="p-2.5 sm:p-4">
        {controlFilas.length === 0 ? (
          <div className="py-6 text-center text-xs font-medium text-slate-400">
            No hay áreas asignadas para control.
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar flex flex-col gap-2.5 pr-2">
            {controlFilas.map((row) => {
              const auditorActualNombre =
                row.auditorMensual?.nombre ||
                row.mesActual?.auditorMensual?.nombre ||
                row.periodos?.p1?.auditorEfectivo?.nombre ||
                row.periodos?.p2?.auditorEfectivo?.nombre ||
                row.mesActual?.periodos?.p1?.auditorEfectivo?.nombre ||
                row.mesActual?.periodos?.p2?.auditorEfectivo?.nombre ||
                'Sin asignar';

              const auditorAntNombre =
                row.auditorAnterior?.nombre ||
                row.mesAnterior?.auditor?.nombre ||
                row.mesAnterior?.periodoAnterior?.auditorNombre ||
                row.mesAnterior?.periodos?.p1?.auditorEfectivo?.nombre ||
                row.mesAnterior?.periodos?.p2?.auditorEfectivo?.nombre ||
                'Sin asignar';

              if (!mostrarMesAnterior) {
                return (
                  <div
                    key={row.area.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-2.5 px-3.5 bg-white rounded-xl border border-slate-200 shadow-sm transition-colors hover:border-slate-300"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black text-slate-800 truncate leading-snug">
                        {row.area.nombre}
                      </span>
                      <span className="text-xs font-medium text-slate-500 truncate mt-0.5">
                        {auditorActualNombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">P1</span>
                        <PeriodoMiniBadge
                          periodoData={row.mesActual?.periodos?.p1 || row.periodos?.p1}
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400">P2</span>
                        <PeriodoMiniBadge
                          periodoData={row.mesActual?.periodos?.p2 || row.periodos?.p2}
                        />
                      </div>
                      <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />
                      <div className="w-12 text-right">
                        <ResultadoScore
                          value={row.mesActual?.resultado ?? null}
                          className="text-xs font-black"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={row.area.id}
                  className="flex flex-col gap-2.5 py-3 px-3.5 bg-white rounded-xl border border-slate-200 shadow-sm"
                >
                  {/* Parte Superior: Solo nombre del Departamento en grande */}
                  <div>
                    <p className="font-black text-slate-900 uppercase text-xs sm:text-sm truncate leading-tight" title={row.area.nombre}>
                      {row.area.nombre}
                    </p>
                  </div>

                  {/* Parte Inferior (Meses): Apilamiento inteligente en móvil/tablet y fila en xl */}
                  <div className="flex flex-col xl:flex-row gap-2 xl:gap-4 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    {/* Bloque Mes Anterior */}
                    {mostrarMesAnterior && etiquetaMesAnterior && (
                      <div className="flex items-center justify-between gap-2 w-full min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                            MES ANT.
                          </span>
                          <span className="text-slate-300 shrink-0">•</span>
                          <span className="text-xs text-slate-500 font-medium truncate max-w-[130px] sm:max-w-[180px]" title={auditorAntNombre}>
                            {auditorAntNombre}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {row.mesAnterior ? (
                            <>
                              <PeriodoMiniBadge periodoData={row.mesAnterior.periodos?.p1} label="P1" />
                              <PeriodoMiniBadge periodoData={row.mesAnterior.periodos?.p2} label="P2" />
                              <div className="w-12 text-right pl-1 border-l border-slate-200/60">
                                <ResultadoScore value={row.mesAnterior?.resultado} className="text-xs font-black" />
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-300 font-bold text-xs">—</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Bloque Mes Actual */}
                    <div className="flex items-center justify-between gap-2 w-full min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                          MES ACT.
                        </span>
                        <span className="text-slate-300 shrink-0">•</span>
                        <span className="text-xs text-slate-500 font-medium truncate max-w-[130px] sm:max-w-[180px]" title={auditorActualNombre}>
                          {auditorActualNombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PeriodoMiniBadge periodoData={row.mesActual?.periodos?.p1} label="P1" />
                        <PeriodoMiniBadge periodoData={row.mesActual?.periodos?.p2} label="P2" />
                        <div className="w-12 text-right pl-1 border-l border-slate-200/60">
                          <ResultadoScore value={row.mesActual?.resultado} className="text-xs font-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
