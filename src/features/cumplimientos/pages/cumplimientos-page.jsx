import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/form/input';
import { SelectorMesNavegacion } from '@/components/ui/selector-mes-navegacion';
import { CumplimientosTable } from '@/features/cumplimientos/components/cumplimientos-table';
import { KpiSummaryView } from '@/features/cumplimientos/components/kpi-summary-view';
import { cumplimientosApi } from '@/features/cumplimientos/api/cumplimientos-api';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useUrlState, parseMonthParam, parseYearParam } from '@/hooks/use-url-state';
import { SectionTabs } from '@/components/ui/section-tabs';
import { cn } from '@/utils/cn';

const URL_DEFAULTS_CUMPLIMIENTOS = {
  anio: String(new Date().getFullYear()),
  mes: String(new Date().getMonth() + 1),
  q: '',
  tipo: 'TODAS',
  vista: 'matriz',
};

export function CumplimientosPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.rol === 'SUPER_ADMIN';

  const { params, setParam, setParams, setSearch } = useUrlState(URL_DEFAULTS_CUMPLIMIENTOS);

  const anio = parseYearParam(params.anio);
  const mes = parseMonthParam(params.mes);
  const busqueda = params.q || '';
  const filtroTipo = params.tipo ? params.tipo.toUpperCase() : 'TODAS';
  const vista = params.vista === 'kpi' ? 'KPI' : 'TABLA';

  const [searchLocal, setSearchLocal] = useState(busqueda);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [data, setData] = useState({ filas: [], usuariosKpi: [] });

  // Sincronizar input local si la URL cambia externamente
  useEffect(() => {
    setSearchLocal(busqueda);
  }, [busqueda]);

  // Debouncer para la búsqueda por texto (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchLocal !== busqueda) {
        setSearch('q', searchLocal);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchLocal, busqueda, setSearch]);

  const cargarDatos = useCallback(async (a, m) => {
    setLoading(true);
    try {
      const res = await cumplimientosApi.mensual({ anio: a, mes: m });
      setData({
        filas: res.filas || [],
        usuariosKpi: res.usuariosKpi || [],
      });
    } catch (err) {
      notify.error(err.message || 'No se pudieron cargar los datos de cumplimiento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos(anio, mes);
  }, [anio, mes, cargarDatos]);

  const handleMonthChange = ({ anio: nuevoAnio, mes: nuevoMes }) => {
    setParams({ anio: String(nuevoAnio), mes: String(nuevoMes) });
  };

  const handleRecalcular = async () => {
    setRecalculating(true);
    try {
      await cumplimientosApi.recalcular({ anio, mes });
      notify.success('Cálculo de KPI y cumplimientos actualizado con éxito');
      await cargarDatos(anio, mes);
    } catch (err) {
      notify.error(err.message || 'Error al recalcular el periodo');
    } finally {
      setRecalculating(false);
    }
  };

  // Filtrar estrictamente solo áreas activas (no eliminadas/inactivas)
  const filasActivas = useMemo(() => {
    return (data.filas || []).filter(
      (fila) => fila.activo !== false && fila.activa !== false && fila.area?.activo !== false,
    );
  }, [data.filas]);

  // Filtrado en memoria para las filas operativas
  const filasFiltradas = useMemo(() => {
    return filasActivas.filter((fila) => {
      const matchTipo =
        filtroTipo === 'TODAS' ||
        !filtroTipo ||
        fila.tipoArea?.toUpperCase() === filtroTipo;
      if (!matchTipo) return false;

      if (!searchLocal.trim()) return true;
      const q = searchLocal.toLowerCase().trim();
      const area = fila.nombreArea?.toLowerCase() || '';
      const codigo = fila.codigoArea?.toLowerCase() || '';
      const auditor = fila.auditorAsignado?.nombre?.toLowerCase() || '';
      const resp = fila.responsableCumplimiento?.nombre?.toLowerCase() || '';
      const prop = (fila.propietarios || []).some((p) => p.nombre?.toLowerCase().includes(q));

      return area.includes(q) || codigo.includes(q) || auditor.includes(q) || resp.includes(q) || prop;
    });
  }, [filasActivas, filtroTipo, searchLocal]);

  // Filtrado en memoria para los usuarios KPI
  const usuariosKpiFiltrados = useMemo(() => {
    if (!searchLocal.trim()) return data.usuariosKpi || [];
    const q = searchLocal.toLowerCase().trim();
    return (data.usuariosKpi || []).filter((u) => {
      const nombre = (u.nombre || u.usuario?.nombre || '').toLowerCase();
      const username = (u.nombreUsuario || u.usuario?.nombreUsuario || '').toLowerCase();
      const rol = (u.rol || u.usuario?.rol || '').toLowerCase();
      const areas = (u.detallesAreas || []).some((a) =>
        (a.areaNombre || a.nombreArea || '').toLowerCase().includes(q)
      );
      return nombre.includes(q) || username.includes(q) || rol.includes(q) || areas;
    });
  }, [data.usuariosKpi, searchLocal]);

  // Métricas de Total General discretas con desglose de origen (P1 y P2)
  const metricasResumen = useMemo(() => {
    const filas = filasActivas;
    const totalAreas = filas.length;

    const contarPorPeriodo = (periodoKey) => {
      let aTiempo = 0;
      let tarde = 0;
      let noRealizada = 0;

      filas.forEach((fila) => {
        const estado = fila[periodoKey]?.chip || fila[periodoKey]?.estadoChip;
        if (estado === 'A_TIEMPO') aTiempo++;
        else if (estado === 'TARDE') tarde++;
        else if (estado === 'NO_REALIZADA') noRealizada++;
      });

      return {
        total: totalAreas,
        aTiempo,
        tarde,
        noRealizada,
      };
    };

    const p1 = contarPorPeriodo('p1');
    const p2 = contarPorPeriodo('p2');

    return {
      totalAreas,
      totalAuditorias: p1.total + p2.total,
      p1Total: p1.total,
      p2Total: p2.total,
      totalATiempo: p1.aTiempo + p2.aTiempo,
      p1ATiempo: p1.aTiempo,
      p2ATiempo: p2.aTiempo,
      totalTarde: p1.tarde + p2.tarde,
      p1Tarde: p1.tarde,
      p2Tarde: p2.tarde,
      totalNoRealizada: p1.noRealizada + p2.noRealizada,
      p1NoRealizada: p1.noRealizada,
      p2NoRealizada: p2.noRealizada,
    };
  }, [filasActivas]);

  return (
    <section className="space-y-6 pt-4 sm:pt-0">
      {/* Header Principal */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
            Seguimiento Operativo
          </p>
          <h1 className="text-3xl font-black text-slate-950">
            Cumplimientos y KPI
          </h1>
        </div>

        

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-auto">
            <SelectorMesNavegacion
              anio={anio}
              mes={mes}
              onChange={handleMonthChange}
            />
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas (Sticky) */}
      <SectionTabs
        tabs={[
          {
            id: 'matriz',
            label: `Cumplimiento por Área (${filasFiltradas.length})`,
            to: `?${new URLSearchParams({ ...params, vista: 'matriz' }).toString()}`,
          },
          ...(isSuperAdmin
            ? [
                {
                  id: 'kpi',
                  label: `KPI Personal (${usuariosKpiFiltrados.length})`,
                  to: `?${new URLSearchParams({ ...params, vista: 'kpi' }).toString()}`,
                },
              ]
            : []),
        ]}
      />

      {/* Barra de Resumen Global Discreta (Total de Planta con indicador de origen P1 y P2) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-3 sm:p-3.5 shadow-sm backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Total Auditorías */}
          <div className="flex flex-col justify-center rounded-xl bg-slate-50/90 px-3 py-2 border border-slate-100 min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1 min-w-0 truncate">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate shrink min-w-0">
                Total Auditorías
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100/80 px-1.5 py-0.5 rounded shrink-0">
                P1: {metricasResumen.p1Total} · P2: {metricasResumen.p2Total}
              </span>
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none shrink-0">
                {metricasResumen.totalAuditorias}
              </span>
              <span className="text-[10px] font-bold text-slate-400 truncate min-w-0">
                {metricasResumen.totalAreas} áreas
              </span>
            </div>
          </div>

          {/* A tiempo */}
          <div className="flex flex-col justify-center rounded-xl bg-emerald-50/60 px-3 py-2 border border-emerald-100 min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1 min-w-0 truncate">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider truncate shrink min-w-0">
                A tiempo
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded shrink-0">
                P1: {metricasResumen.p1ATiempo} · P2: {metricasResumen.p2ATiempo}
              </span>
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-emerald-800 leading-none shrink-0">
                {metricasResumen.totalATiempo}
              </span>
              {metricasResumen.totalAuditorias > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 shrink-0">
                  {Math.round((metricasResumen.totalATiempo / metricasResumen.totalAuditorias) * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* Tarde */}
          <div className="flex flex-col justify-center rounded-xl bg-amber-50/60 px-3 py-2 border border-amber-100 min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1 min-w-0 truncate">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider truncate shrink min-w-0">
                Tarde
              </span>
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-100/70 px-1.5 py-0.5 rounded shrink-0">
                P1: {metricasResumen.p1Tarde} · P2: {metricasResumen.p2Tarde}
              </span>
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-amber-800 leading-none shrink-0">
                {metricasResumen.totalTarde}
              </span>
              {metricasResumen.totalAuditorias > 0 && (
                <span className="text-[10px] font-bold text-amber-600 shrink-0">
                  {Math.round((metricasResumen.totalTarde / metricasResumen.totalAuditorias) * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* No realizadas */}
          <div className="flex flex-col justify-center rounded-xl bg-rose-50/60 px-3 py-2 border border-rose-100 min-w-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mb-1 min-w-0 truncate">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider truncate shrink min-w-0">
                No realizadas
              </span>
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/70 px-1.5 py-0.5 rounded shrink-0">
                P1: {metricasResumen.p1NoRealizada} · P2: {metricasResumen.p2NoRealizada}
              </span>
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xl sm:text-2xl font-black text-rose-800 leading-none shrink-0">
                {metricasResumen.totalNoRealizada}
              </span>
              {metricasResumen.totalAuditorias > 0 && (
                <span className="text-[10px] font-bold text-rose-600 shrink-0">
                  {Math.round((metricasResumen.totalNoRealizada / metricasResumen.totalAuditorias) * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra Global de Filtros Sincronizados con URL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" size="xs" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            placeholder="Buscar por área, responsable, auditor..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Tipo:</span>
          {['TODAS', 'OPERATIVA', 'ADMINISTRATIVA'].map((tipo) => {
            const isMatch =
              (tipo === 'TODAS' && (filtroTipo === 'TODAS' || !filtroTipo)) ||
              filtroTipo === tipo ||
              (tipo === 'OPERATIVA' && filtroTipo === 'OPERATIVO') ||
              (tipo === 'ADMINISTRATIVA' && filtroTipo === 'ADMINISTRATIVO');

            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setParam('tipo', tipo === 'TODAS' ? '' : tipo)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition',
                  isMatch
                    ? 'bg-marca-secundario text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
                )}
              >
                {tipo === 'TODAS' ? 'Todas' : tipo === 'OPERATIVA' ? 'Operativas' : 'Administrativas'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido Dinámico */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : vista === 'TABLA' ? (
        <CumplimientosTable
          filas={filasFiltradas}
          busqueda={searchLocal}
          onBusquedaChange={setSearchLocal}
          filtroTipo={filtroTipo}
          onFiltroTipoChange={(val) => setParam('tipo', val === 'TODAS' ? '' : val)}
        />
      ) : (
        <KpiSummaryView usuariosKpi={usuariosKpiFiltrados} />
      )}
    </section>
  );
}

