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
import { notify } from '@/components/notification/adaptive-notify';
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
  const canRecalculate = ['SUPER_ADMIN', 'ADMINISTRADOR'].includes(user?.rol);

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

  // Filtrado en memoria para las filas operativas
  const filasFiltradas = useMemo(() => {
    return (data.filas || []).filter((fila) => {
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
  }, [data.filas, filtroTipo, searchLocal]);

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

  // Métricas rápidas de cabecera (basadas en datos del periodo actual)
  const totalAreas = data.filas.length;
  const aTiempoP1 = data.filas.filter((f) => f.p1?.chip === 'A_TIEMPO').length;
  const aTiempoP2 = data.filas.filter((f) => f.p2?.chip === 'A_TIEMPO').length;
  const totalATiempo = aTiempoP1 + aTiempoP2;
  const comodinCount = data.filas.filter(
    (f) => f.p1?.esComodin || f.p1?.ejecutadoPor?.esComodin || f.p2?.esComodin || f.p2?.ejecutadoPor?.esComodin,
  ).length;

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

          {canRecalculate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="refresh"
              onClick={handleRecalcular}
              loading={recalculating}
              className="bg-white/80 backdrop-blur-md hover:bg-white"
            >
              Recalcular mes
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas de Resumen Numérico */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            Áreas Monitoreadas
          </span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {totalAreas}
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
            Auditorías a Tiempo
          </span>
          <span className="text-2xl font-black text-emerald-800 block mt-1">
            {totalATiempo}
          </span>
        </div>

        <div className="rounded-2xl border border-purple-200/60 bg-purple-50/40 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
            Intervención Comodín
          </span>
          <span className="text-2xl font-black text-purple-800 block mt-1">
            {comodinCount}
          </span>
        </div>

        <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-4 shadow-sm backdrop-blur-xl">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
            Personal Evaluado
          </span>
          <span className="text-2xl font-black text-indigo-800 block mt-1">
            {data.usuariosKpi.length}
          </span>
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

      {/* Navegación por Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2">
        <button
          type="button"
          onClick={() => setParam('vista', 'matriz')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition',
            vista === 'TABLA'
              ? 'bg-marca-secundario text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          <Icon name="table_chart" size="xs" />
          <span>Matriz Operativa de Cumplimiento</span>
          <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
            {filasFiltradas.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setParam('vista', 'kpi')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition',
            vista === 'KPI'
              ? 'bg-marca-secundario text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          <Icon name="verified" size="xs" />
          <span>KPI 50/50 de Personal Evaluado</span>
          <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
            {usuariosKpiFiltrados.length}
          </span>
        </button>
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

