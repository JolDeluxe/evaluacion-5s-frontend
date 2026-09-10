import React, { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';

export function KpiSummaryView({ usuariosKpi = [] }) {
  const [expandedUsers, setExpandedUsers] = useState({});

  const toggleExpand = (userId) => {
    setExpandedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="space-y-6">
      {/* Banner Explicativo de la Fórmula 50/50 */}
      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-indigo-50/30 to-white/80 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Icon name="calculate" size="md" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">
              Metodología de Evaluación
            </span>
            <h2 className="text-base font-black text-slate-900">
              Fórmula de KPI Consolidado 50/50
            </h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-3 text-xs text-slate-600">
          <div className="rounded-xl border border-white/90 bg-white/70 p-3 shadow-xs">
            <span className="font-black text-indigo-900 block mb-1">
              Componente 1: Cumplimiento (50%)
            </span>
            <p>
              Porcentaje de auditorías ordinarias ejecutadas estrictamente a tiempo respecto a las esperadas.
              Si no tenía auditorías programadas, es N/A y las áreas asumen el 100%.
            </p>
          </div>
          <div className="rounded-xl border border-white/90 bg-white/70 p-3 shadow-xs">
            <span className="font-black text-indigo-900 block mb-1">
              Componente 2: Áreas a Cargo (50%)
            </span>
            <p>
              Promedio de las calificaciones mensuales de las áreas bajo su responsabilidad que tuvieron auditorías realizadas.
              Si ninguna área fue auditada, es N/A y el cumplimiento asume el 100%.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Usuarios Evaluados */}
      {usuariosKpi.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center">
          <Icon name="person_search" size="xl" className="mx-auto text-slate-400 mb-2" />
          <h3 className="text-base font-black text-slate-800">No hay usuarios con evaluación activa</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Ningún usuario tiene activada la casilla "Se evalúa con KPI 50/50" en el módulo de Usuarios para este periodo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {usuariosKpi.map((u) => {
            const userId = u.usuarioId ?? u.usuario?.id;
            const userName = u.nombre ?? u.usuario?.nombre;
            const username = u.nombreUsuario ?? u.usuario?.nombreUsuario;
            const userRole = u.rol ?? u.usuario?.rol;

            const isExpanded = Boolean(expandedUsers[userId]);
            const hasKpi = u.kpiFinal !== null && u.kpiFinal !== undefined;
            const hasCumplimiento = u.porcentajeCumplimiento !== null && u.porcentajeCumplimiento !== undefined;
            const hasAreas = u.promedioAreas !== null && u.promedioAreas !== undefined;

            return (
              <div
                key={userId}
                className="flex flex-col justify-between rounded-2xl border border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur-xl transition hover:shadow-xl"
              >
                <div>
                  {/* Header de Usuario */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-900 truncate">
                        {userName}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-semibold">
                        <span>{username}</span>
                        <span>·</span>
                        <span className="uppercase text-[10px] font-black text-slate-400">{userRole}</span>
                      </div>
                    </div>

                    {/* Badge KPI Final */}
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        KPI Final
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-xl px-2.5 py-1 text-sm font-black border',
                          hasKpi && u.kpiFinal >= 90
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : hasKpi && u.kpiFinal >= 80
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : hasKpi
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : 'bg-slate-100 text-slate-500 border-slate-200',
                        )}
                      >
                        {hasKpi ? formatPercentTrunc(u.kpiFinal) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Componentes de la Fórmula */}
                  <div className="grid grid-cols-2 gap-2.5 my-3.5">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        50% Cumplimiento
                      </span>
                      <span className="text-base font-black text-slate-800 block mt-0.5">
                        {hasCumplimiento ? formatPercentTrunc(u.porcentajeCumplimiento) : 'N/A'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {u.auditoriasATiempo} de {u.auditoriasEsperadas} a tiempo
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        50% Promedio Áreas
                      </span>
                      <span className="text-base font-black text-slate-800 block mt-0.5">
                        {hasAreas ? formatPercentTrunc(u.promedioAreas) : 'N/A'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {u.areasConResultado} áreas auditadas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Desglose de Áreas Evaluadas */}
                <div className="border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(u.usuarioId)}
                    className="flex w-full items-center justify-between text-xs font-black text-slate-600 hover:text-slate-900 transition"
                  >
                    <span>Áreas bajo su responsabilidad ({(u.areasDetalle || []).length})</span>
                    <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size="xs" />
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 space-y-1.5 pt-1">
                      {(u.areasDetalle || []).map((ad) => (
                        <div
                          key={ad.areaId}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs border border-slate-100"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-black text-slate-800 block truncate">
                              {ad.nombreArea}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {ad.tipoArea}
                            </span>
                          </div>
                          <span className="font-black text-slate-800 text-xs shrink-0">
                            {ad.resultadoMensual !== null && ad.resultadoMensual !== undefined
                              ? formatPercentTrunc(ad.resultadoMensual)
                              : 'Sin calif.'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
