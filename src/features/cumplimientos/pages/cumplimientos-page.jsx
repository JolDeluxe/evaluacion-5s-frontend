import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { SelectorMesNavegacion } from '@/components/ui/selector-mes-navegacion';
import { CumplimientosTable } from '@/features/cumplimientos/components/cumplimientos-table';
import { KpiSummaryView } from '@/features/cumplimientos/components/kpi-summary-view';
import { cumplimientosApi } from '@/features/cumplimientos/api/cumplimientos-api';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { notify } from '@/components/notification/adaptive-notify';
import { cn } from '@/utils/cn';

export function CumplimientosPage() {
  const { user } = useAuth();
  const canRecalculate = ['SUPER_ADMIN', 'ADMINISTRADOR'].includes(user?.rol);

  const hoy = new Date();
  const [periodo, setPeriodo] = useState({
    anio: hoy.getFullYear(),
    mes: hoy.getMonth() + 1,
  });

  const [vista, setVista] = useState('TABLA'); // 'TABLA' | 'KPI'
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [data, setData] = useState({ filas: [], usuariosKpi: [] });

  const cargarDatos = useCallback(async (anio, mes) => {
    setLoading(true);
    try {
      const res = await cumplimientosApi.mensual({ anio, mes });
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
    cargarDatos(periodo.anio, periodo.mes);
  }, [periodo.anio, periodo.mes, cargarDatos]);

  const handleMonthChange = ({ anio, mes }) => {
    setPeriodo({ anio, mes });
  };

  const handleRecalcular = async () => {
    setRecalculating(true);
    try {
      await cumplimientosApi.recalcular(periodo);
      notify.success('Cálculo de KPI y cumplimientos actualizado con éxito');
      await cargarDatos(periodo.anio, periodo.mes);
    } catch (err) {
      notify.error(err.message || 'Error al recalcular el periodo');
    } finally {
      setRecalculating(false);
    }
  };

  // Métricas rápidas de cabecera
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
              anio={periodo.anio}
              mes={periodo.mes}
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

      {/* Navegación por Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200/70 pb-2">
        <button
          type="button"
          onClick={() => setVista('TABLA')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition',
            vista === 'TABLA'
              ? 'bg-marca-secundario text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          <Icon name="table_chart" size="xs" />
          <span>Matriz Operativa de Cumplimiento</span>
        </button>

        <button
          type="button"
          onClick={() => setVista('KPI')}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition',
            vista === 'KPI'
              ? 'bg-marca-secundario text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          <Icon name="verified" size="xs" />
          <span>KPI 50/50 de Personal Evaluado</span>
          {data.usuariosKpi.length > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {data.usuariosKpi.length}
            </span>
          )}
        </button>
      </div>

      {/* Contenido Dinámico */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : vista === 'TABLA' ? (
        <CumplimientosTable filas={data.filas} />
      ) : (
        <KpiSummaryView usuariosKpi={data.usuariosKpi} />
      )}
    </section>
  );
}
