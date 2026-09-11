import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { CumplimientoChip } from '@/features/cumplimientos/components/cumplimiento-chip';
import { getResultadoCenterGlowStyle } from '@/features/resultados/utils/resultado-colors';
import { formatPercentTrunc } from '@/utils/format';
import { cn } from '@/utils/cn';

export function CumplimientosTable({
  filas = [],
  busqueda: busquedaProp,
  onBusquedaChange,
  filtroTipo: filtroTipoProp,
  onFiltroTipoChange,
}) {
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const [filtroTipoLocal, setFiltroTipoLocal] = useState('TODAS');

  const busqueda = busquedaProp !== undefined ? busquedaProp : busquedaLocal;
  const setBusqueda = onBusquedaChange || setBusquedaLocal;

  const filtroTipo = filtroTipoProp !== undefined ? filtroTipoProp : filtroTipoLocal;
  const setFiltroTipo = onFiltroTipoChange || setFiltroTipoLocal;

  const filasFiltradas = useMemo(() => {
    return filas.filter((fila) => {
      const matchTipo =
        filtroTipo === 'TODAS' ||
        filtroTipo === '' ||
        fila.tipoArea?.toUpperCase() === filtroTipo?.toUpperCase();
      if (!matchTipo) return false;

      if (!busqueda?.trim()) return true;
      const q = busqueda.toLowerCase().trim();
      const area = fila.nombreArea?.toLowerCase() || '';
      const codigo = fila.codigoArea?.toLowerCase() || '';
      const auditor = fila.auditorAsignado?.nombre?.toLowerCase() || '';
      const resp = fila.responsableCumplimiento?.nombre?.toLowerCase() || '';
      const prop = (fila.propietarios || []).some((p) => p.nombre?.toLowerCase().includes(q));

      return area.includes(q) || codigo.includes(q) || auditor.includes(q) || resp.includes(q) || prop;
    });
  }, [filas, busqueda, filtroTipo]);

  // Solo mostrar barra de filtros interna si el padre NO controla los filtros
  const showInternalFilters = busquedaProp === undefined && filtroTipoProp === undefined;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros (solo si el padre no controla los filtros via URL) */}
      {showInternalFilters && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por área, auditor, responsable..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {['TODAS', 'OPERATIVO', 'ADMINISTRATIVO'].map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltroTipo(tipo)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition',
                  filtroTipo === tipo
                    ? 'bg-marca-secundario text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
                )}
              >
                {tipo === 'TODAS' ? 'Todas' : tipo === 'OPERATIVO' ? 'Operativas' : 'Administrativas'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabla Desktop */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/70 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Área</th>
                <th className="px-4 py-3.5">Responsables</th>
                <th className="px-4 py-3.5 text-center">Corte 1</th>
                <th className="px-4 py-3.5 text-center">Corte 2</th>
                <th className="px-4 py-3.5 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-semibold">
                    No se encontraron registros para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filasFiltradas.map((fila) => {
                  const esDelegado = fila.responsableCumplimiento?.esDelegado;
                  const resStyle = fila.resultadoMensual !== null && fila.resultadoMensual !== undefined
                    ? getResultadoCenterGlowStyle(fila.resultadoMensual)
                    : {};

                  return (
                    <tr key={fila.areaId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-black text-slate-900 leading-snug">
                          {fila.nombreArea}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1">
                          {/* Auditor */}
                          <div className="flex items-center gap-1.5">
                            <Icon name="person_search" size="12px" className="text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-800 text-xs">
                              {fila.auditorAsignado?.nombre || 'Sin auditor'}
                            </span>
                          </div>
                          {/* Responsable KPI — solo si es distinto al auditor (delegación) */}
                          {esDelegado && (
                            <div className="flex items-center gap-1.5">
                              <Icon name="verified_user" size="12px" className="text-indigo-400 shrink-0" />
                              <span className="font-bold text-indigo-700 text-xs">
                                {fila.responsableCumplimiento?.nombre}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[9px] font-black text-indigo-700">
                                <Icon name="swap_horiz" size="10px" />
                                Del.
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <CumplimientoChip corteInfo={fila.p1} />
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <CumplimientoChip corteInfo={fila.p2} />
                      </td>

                      <td className="px-4 py-3.5 text-center font-black" style={resStyle}>
                        {fila.resultadoMensual !== null && fila.resultadoMensual !== undefined ? (
                          <span className="text-sm font-black text-slate-800">
                            {formatPercentTrunc(fila.resultadoMensual)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista Mobile Cards */}
      <div className="block md:hidden space-y-3">
        {filasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white/70 rounded-2xl border border-white">
            No se encontraron registros.
          </div>
        ) : (
          filasFiltradas.map((fila) => (
            <div
              key={fila.areaId}
              className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-md backdrop-blur-md space-y-3"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {fila.tipoArea}
                  </span>
                  <h2 className="text-base font-black text-slate-900 leading-tight">
                    {fila.nombreArea}
                  </h2>
                </div>
                {fila.resultadoMensual !== null && fila.resultadoMensual !== undefined && (
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                    {formatPercentTrunc(fila.resultadoMensual)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Auditor</span>
                  <span className="font-bold text-slate-800">{fila.auditorAsignado?.nombre || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Responsable KPI</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-800">{fila.responsableCumplimiento?.nombre || '—'}</span>
                    {fila.responsableCumplimiento?.esDelegado && (
                      <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                        Del.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2.5">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Corte 1 (P1)</span>
                  <CumplimientoChip corteInfo={fila.p1} />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Corte 2 (P2)</span>
                  <CumplimientoChip corteInfo={fila.p2} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
