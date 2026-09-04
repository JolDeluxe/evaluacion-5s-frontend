import { Card, CardBody } from '@/components/ui/card';
import { ResultadoScore } from '@/features/resultados/components/shared/resultado-score';

function StatusText({ estado, reabierta }) {
  if (reabierta) {
    return (
      <span className="inline-flex items-center gap-1 font-extrabold text-[11px] text-rose-700">
        ↻ Reabierta
      </span>
    );
  }
  if (estado === 'NO_REALIZADA') {
    return (
      <span className="inline-flex items-center gap-1 font-extrabold text-[11px] text-rose-700">
        ● No realizada
      </span>
    );
  }
  if (estado === 'ATRASADA' || estado === 'ATRASADA_EN_GRACIA') {
    return (
      <span className="inline-flex items-center gap-1 font-extrabold text-[11px] text-orange-600">
        ● Atrasada
      </span>
    );
  }
  if (estado === 'REALIZADA' || estado === 'COMPLETADA' || estado === 'REALIZADA_A_TIEMPO' || estado === 'REALIZADA_CON_ATRASO') {
    return (
      <span className="inline-flex items-center gap-1 font-extrabold text-[11px] text-emerald-700">
        ✓ Realizada
      </span>
    );
  }
  if (estado === 'PENDIENTE') {
    return (
      <span className="inline-flex items-center gap-1 font-extrabold text-[11px] text-amber-600">
        ● Pendiente
      </span>
    );
  }
  if (estado === 'SIN_AUDITOR') {
    return (
      <span className="inline-flex items-center gap-1 font-extrabold text-[11px] text-rose-600">
        ! Sin auditor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-slate-400">
      ○ Aún no inicia
    </span>
  );
}

function PeriodoCell({ periodoData, auditorNombre }) {
  if (!periodoData || !periodoData.programada) {
    return <span className="text-slate-300 font-bold">—</span>;
  }

  // Si periodoData trae estado / estadoAuditoria explícito, respetarlo primeramente (p. ej. NO_REALIZADA de Resultados)
  const estadoBase = periodoData.estado || periodoData.estadoAuditoria;

  const estado = periodoData.realizada
    ? 'REALIZADA'
    : periodoData.requiereAuditor
    ? 'SIN_AUDITOR'
    : estadoBase === 'NO_REALIZADA'
    ? 'NO_REALIZADA'
    : estadoBase === 'ATRASADA' || estadoBase === 'ATRASADA_EN_GRACIA'
    ? 'ATRASADA'
    : periodoData.vencida && !periodoData.reabiertaHasta
    ? 'NO_REALIZADA'
    : periodoData.vencida
    ? 'ATRASADA'
    : estadoBase || 'PENDIENTE';

  return (
    <div className="flex flex-col items-center gap-0 py-0.5">
      <StatusText estado={estado} reabierta={Boolean(periodoData.reabiertaHasta)} />
      {auditorNombre ? (
        <span className="text-[10px] font-medium text-slate-500 truncate max-w-[110px]" title={auditorNombre}>
          {auditorNombre}
        </span>
      ) : (
        <span className="text-[10px] font-semibold text-rose-600">Sin auditor</span>
      )}
    </div>
  );
}

export function ControlAuditoriasAdmin({
  etiquetaMesControl,
  mostrarMesAnterior = false,
  etiquetaMesAnterior,
  controlFilas = [],
}) {
  return (
    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-0">
      <div className="border-b border-slate-100 p-3 sm:p-4">
        <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">Seguimiento</p>
        <h2 className="text-base font-black text-slate-950 uppercase">Control de auditorías</h2>
        <p className="text-[11px] font-semibold text-slate-500">{etiquetaMesControl}</p>
      </div>

      <CardBody className="p-0">
        {/* Vista Escritorio: Tabla Matriz */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4 pl-5">Área</th>
                {mostrarMesAnterior && etiquetaMesAnterior && (
                  <th className="py-2.5 px-4 text-center border-l border-slate-100 bg-amber-50/30 text-amber-900">
                    {etiquetaMesAnterior}
                  </th>
                )}
                <th className="py-2.5 px-4 text-center border-l border-slate-100">
                  {etiquetaMesControl}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {controlFilas.map((row) => {
                const auditorPrincipal = row.auditorMensual?.nombre;

                return (
                  <tr key={row.area.id} className="hover:bg-slate-50/80 transition">
                    {/* ÁREA */}
                    <td className="py-2 px-4 pl-5 align-middle">
                      <p className="font-black text-slate-900 uppercase text-xs">{row.area.nombre}</p>
                    </td>

                    {/* MES ANTERIOR (Solo si mostrarMesAnterior es true) */}
                    {mostrarMesAnterior && etiquetaMesAnterior && (
                      <td className="py-1.5 px-3 border-l border-slate-100 align-middle">
                        {row.mesAnterior ? (
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-4 flex-1 justify-around">
                              <div className="text-center">
                                <span className="block text-[9px] font-bold text-slate-400 uppercase">P1</span>
                                <PeriodoCell
                                  periodoData={row.mesAnterior.periodos?.p1}
                                  auditorNombre={row.mesAnterior.periodoAnterior?.auditorNombre || auditorPrincipal}
                                />
                              </div>
                              <div className="text-center">
                                <span className="block text-[9px] font-bold text-slate-400 uppercase">P2</span>
                                <PeriodoCell
                                  periodoData={row.mesAnterior.periodos?.p2}
                                  auditorNombre={row.mesAnterior.periodoAnterior?.auditorNombre || auditorPrincipal}
                                />
                              </div>
                            </div>
                            <div className="pl-2 border-l border-slate-200/40 text-center min-w-[65px]">
                              <ResultadoScore value={row.mesAnterior?.resultado} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-slate-300 font-bold">—</div>
                        )}
                      </td>
                    )}

                    {/* MES ACTUAL */}
                    <td className="py-1.5 px-3 border-l border-slate-100 align-middle">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-4 flex-1 justify-around">
                          <div className="text-center">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase">P1</span>
                            <PeriodoCell
                              periodoData={row.mesActual?.periodos?.p1}
                              auditorNombre={auditorPrincipal}
                            />
                          </div>
                          <div className="text-center">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase">P2</span>
                            <PeriodoCell
                              periodoData={row.mesActual?.periodos?.p2}
                              auditorNombre={auditorPrincipal}
                            />
                          </div>
                        </div>
                        <div className="pl-2 border-l border-slate-200/40 text-center min-w-[65px]">
                          <ResultadoScore value={row.mesActual?.resultado} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Vista Móvil: Tarjetas por Área */}
        <div className="md:hidden divide-y divide-slate-100">
          {controlFilas.map((row) => {
            const auditorPrincipal = row.auditorMensual?.nombre;

            return (
              <div key={row.area.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase text-xs">{row.area.nombre}</h3>
                </div>

                <div className="space-y-3">
                  {/* Card MES ANTERIOR (Móvil) */}
                  {mostrarMesAnterior && etiquetaMesAnterior && row.mesAnterior && (
                    <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-100/80 space-y-2">
                      <div className="flex items-center justify-between border-b border-amber-200/50 pb-1.5">
                        <span className="text-[10px] font-black uppercase text-amber-900">
                          {etiquetaMesAnterior}
                        </span>
                        <ResultadoScore value={row.mesAnterior?.resultado} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white/80 p-1.5 rounded border border-slate-100">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">1er Periodo</span>
                          <PeriodoCell
                            periodoData={row.mesAnterior.periodos?.p1}
                            auditorNombre={row.mesAnterior.periodoAnterior?.auditorNombre || auditorPrincipal}
                          />
                        </div>
                        <div className="bg-white/80 p-1.5 rounded border border-slate-100">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">2do Periodo</span>
                          <PeriodoCell
                            periodoData={row.mesAnterior.periodos?.p2}
                            auditorNombre={row.mesAnterior.periodoAnterior?.auditorNombre || auditorPrincipal}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card MES ACTUAL (Móvil) */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-700">
                        {etiquetaMesControl}
                      </span>
                      <ResultadoScore value={row.mesActual?.resultado} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">1er Periodo</span>
                        <PeriodoCell
                          periodoData={row.mesActual?.periodos?.p1}
                          auditorNombre={auditorPrincipal}
                        />
                      </div>
                      <div className="bg-white p-1.5 rounded border border-slate-100">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">2do Periodo</span>
                        <PeriodoCell
                          periodoData={row.mesActual?.periodos?.p2}
                          auditorNombre={auditorPrincipal}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
