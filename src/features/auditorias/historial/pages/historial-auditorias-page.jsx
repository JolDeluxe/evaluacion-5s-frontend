
import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { SectionTabs } from '@/components/ui/section-tabs';
import { SelectorMesNavegacion } from '@/components/ui/selector-mes-navegacion';
import { ResultadoBadge } from '@/features/resultados/components/shared/resultado-badge';
import { apiClient } from '@/lib/api/api-client';
import { formatPercentTrunc } from '@/utils/format';

// ─── Constants ────────────────────────────────────────────────────────────────

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MESES_CORTOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fechaCorta = (fechaStr) => {
  if (!fechaStr) return '';

  const d = new Date(fechaStr);

  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()].toLowerCase()}`;
};

// ─── Period Cell Component ────────────────────────────────────────────────────

// ─── Period Cell Component ────────────────────────────────────────────────────

function EstadoAuditoriaHistorial({ asig, align = 'center' }) {
  const isStart = align === 'start';
  const containerClass = isStart ? 'flex flex-col items-start text-left gap-0.5' : 'flex flex-col items-center text-center gap-0.5';
  const realizadaRowClass = isStart ? 'flex flex-wrap items-center justify-start gap-2' : 'flex flex-wrap items-center justify-center gap-2';

  if (!asig) {
    return <span className="text-xs font-bold text-slate-300">—</span>;
  }

  const { estado, infoPeriodo, objetivoAuditoria } = asig;
  const envio = objetivoAuditoria?.envioResultado;

  // 1. REALIZADA
  if (estado === 'COMPLETADA' || envio) {
    const pct = envio?.porcentaje != null ? Number(envio.porcentaje) : 100;
    const fecha = fechaCorta(asig.completadoEn || envio?.verificadoEn);
    const realizadoPor = envio?.enlaceInvitadoId ? 'Invitado' : null;

    return (
      <div className={containerClass}>
        <div className={realizadaRowClass}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <span>✓</span>
            <span>Realizada</span>
          </span>
          <span className="text-xs font-bold text-slate-700">
            {formatPercentTrunc(pct)}
          </span>
        </div>
        <p className="text-[11px] font-semibold text-slate-400">
          {realizadoPor ? `${realizadoPor} · ${fecha}` : (fecha || 'Completada')}
        </p>
      </div>
    );
  }

  // 2. OTROS ESTADOS
  const status = infoPeriodo?.status;
  const texto = infoPeriodo?.texto ?? 'Pendiente';

  if (status === 'AUN_NO_INICIA') {
    const iniciaFmt = objetivoAuditoria?.iniciaEn ? fechaCorta(objetivoAuditoria.iniciaEn) : null;
    const terminaFmt = objetivoAuditoria?.terminaEn ? fechaCorta(objetivoAuditoria.terminaEn) : null;
    return (
      <div className={containerClass}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500">
          <span>○</span>
          <span>Aún no inicia</span>
        </span>
        {iniciaFmt && terminaFmt && (
          <p className="text-[11px] font-semibold text-slate-400">
            {iniciaFmt} – {terminaFmt}
          </p>
        )}
      </div>
    );
  }

  if (status === 'PENDIENTE') {
    const esUltimoDia = texto === 'ÚLTIMO DÍA PARA REALIZAR';
    return (
      <div className={containerClass}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
            esUltimoDia
              ? 'border-rose-200 bg-rose-50 text-rose-700 font-black'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          <span>{esUltimoDia ? '!' : '•'}</span>
          <span>{esUltimoDia ? 'Último día' : 'Pendiente'}</span>
        </span>
      </div>
    );
  }

  if (status === 'REABIERTA') {
    const esUltimoDia = texto === 'ÚLTIMO DÍA PARA REALIZAR';
    return (
      <div className={containerClass}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
          <span>↻</span>
          <span>{esUltimoDia ? 'Último día' : 'Reabierta · vencida'}</span>
        </span>
      </div>
    );
  }

  if (status === 'VENCIDA') {
    const esUltimoDia = texto === 'ÚLTIMO DÍA PARA REALIZAR';
    return (
      <div className={containerClass}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
          <span>!</span>
          <span>{esUltimoDia ? 'Último día' : 'Atrasada'}</span>
        </span>
      </div>
    );
  }

  if (status === 'CERRADA' || !infoPeriodo?.realizable) {
    return (
      <div className={containerClass}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/70 px-2.5 py-1 text-xs font-bold text-rose-700">
          <span>✕</span>
          <span>No realizada</span>
        </span>
        <p className="text-[11px] font-semibold text-slate-400">
          Periodo cerrado
        </p>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <span>•</span>
        <span>{texto}</span>
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HistorialAuditoriasPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const ahora = new Date();

  // Default to current month/year when no params provided
  const anioActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;

  const filtroAnio = parseInt(searchParams.get('anio') || String(anioActual), 10);
  const filtroMes = parseInt(searchParams.get('mes') || String(mesActual), 10);

  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ensure URL always has anio+mes so filters are always explicit
  useEffect(() => {
    const paramAnio = searchParams.get('anio');
    const paramMes = searchParams.get('mes');

    if (!paramAnio || !paramMes) {
      const params = new URLSearchParams(searchParams);
      if (!paramAnio) params.set('anio', String(anioActual));
      if (!paramMes) params.set('mes', String(mesActual));

      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all records for the selected month (no pagination)
  useEffect(() => {
    let active = true;

    async function fetchHistory() {
      setLoading(true);

      try {
        const queryParams = new URLSearchParams();
        queryParams.set('tipoBandeja', 'HISTORIAL');
        queryParams.set('anio', String(filtroAnio));
        queryParams.set('mes', String(filtroMes));

        const res = await apiClient.get(`/asignaciones?${queryParams.toString()}`);

        if (active) {
          const list = Array.isArray(res?.datos) ? res.datos : Array.isArray(res) ? res : [];
          setHistorial(list);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      active = false;
    };
  }, [filtroAnio, filtroMes]);

  // ─── Group by area, slot P1 and P2 ─────────────────────────────────────────

  const areaMap = useMemo(() => {
    const map = {};

    historial.forEach((item) => {
      const nombre =
        item.objetivoAuditoria?.area?.nombre ??
        item.objetivoAuditoria?.nombreAreaSnapshot ??
        'SIN ÁREA';

      const corte = item.objetivoAuditoria?.periodo ?? 1;

      if (!map[nombre]) {
        map[nombre] = {
          nombre,
          p1: null,
          p2: null,
        };
      }

      if (corte === 1) {
        map[nombre].p1 = item;
      } else if (corte === 2) {
        map[nombre].p2 = item;
      }
    });

    // Sort A→Z (es-MX)
    return Object.values(map).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es-MX', { sensitivity: 'base' }),
    );
  }, [historial]);

  // ─── Summary counts ─────────────────────────────────────────────────────────

  const totalAreas = areaMap.length;

  const realizadas = historial.filter(
    (a) => a.estado === 'COMPLETADA' || a.objetivoAuditoria?.envioResultado,
  ).length;

  const pendientes = historial.filter(
    (a) =>
      a.estado !== 'COMPLETADA' &&
      !a.objetivoAuditoria?.envioResultado &&
      (a.infoPeriodo?.status === 'PENDIENTE' || a.infoPeriodo?.status === 'AUN_NO_INICIA' || a.infoPeriodo?.realizable),
  ).length;

  const noRealizadas = historial.filter(
    (a) =>
      a.estado !== 'COMPLETADA' &&
      !a.objetivoAuditoria?.envioResultado &&
      (a.infoPeriodo?.status === 'CERRADA' || !a.infoPeriodo?.realizable),
  ).length;

  const periodoTituloLabel = `${MESES[filtroMes - 1].toUpperCase()} ${filtroAnio}`;
  const labelP1 = 'Primer periodo';
  const labelP2 = 'Segundo periodo';

  return (
    <section className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
          Auditorías
        </p>
        <h1 className="text-3xl font-black text-slate-950">
          Mis auditorías
        </h1>
      </div>

      {/* Tab navigation */}
      <SectionTabs
        tabs={[
          { label: 'Por realizar', to: '/mis-auditorias', end: true },
          { label: 'Historial', to: '/mis-auditorias/historial' },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 w-full">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Filtrar por periodo</p>
          <p className="text-xs sm:text-sm font-black text-slate-900">{periodoTituloLabel}</p>
        </div>

        <div className="w-full sm:w-auto sm:min-w-[260px]">
          <SelectorMesNavegacion
            anio={filtroAnio}
            mes={filtroMes}
            onChange={({ anio: newAnio, mes: newMes }) => {
              const params = new URLSearchParams(searchParams);
              params.set('anio', String(newAnio));
              params.set('mes', String(newMes));
              setSearchParams(params);
            }}
          />
        </div>
      </div>

      {/* Month header */}
      {!loading && historial.length > 0 && (
        <div className="space-y-0.5">
          <h2 className="text-xl font-black text-slate-900">{periodoTituloLabel}</h2>
          <p className="text-sm font-semibold text-slate-500">
            {totalAreas} {totalAreas === 1 ? 'área' : 'áreas'} · {realizadas} realizadas
            {pendientes > 0 && ` · ${pendientes} pendientes / en curso`}
            {noRealizadas > 0 && ` · ${noRealizadas} no realizadas`}
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : historial.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white/70">
          <CardBody className="py-14 text-center">
            <p className="font-semibold text-slate-500">
              Sin registros para {MESES[filtroMes - 1].toLowerCase()} {filtroAnio}
            </p>
          </CardBody>
        </Card>
      ) : (
        <Card className="overflow-hidden border-app-border bg-white shadow-sm">
          {/* DESKTOP HEADER */}
          <div className="hidden md:grid md:grid-cols-[40%_30%_30%] items-center border-b border-app-border bg-slate-50/70 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <div className="px-6">Área</div>
            <div className="px-5 text-center">{labelP1}</div>
            <div className="px-5 text-center">{labelP2}</div>
          </div>

          <div className="divide-y divide-app-border">
            {areaMap.map(({ nombre, p1, p2 }) => (
              <div key={nombre}>
                {/* DESKTOP ROW */}
                <div className="hidden md:grid md:grid-cols-[40%_30%_30%] items-center py-4 transition hover:bg-slate-50/70">
                  <div className="min-w-0 px-6">
                    <div className="text-sm font-black uppercase leading-5 text-slate-900">
                      {nombre}
                    </div>
                  </div>

                  <div className="flex min-w-0 justify-center px-5">
                    <EstadoAuditoriaHistorial asig={p1} />
                  </div>

                  <div className="flex min-w-0 justify-center px-5">
                    <EstadoAuditoriaHistorial asig={p2} />
                  </div>
                </div>

                {/* MOBILE CARD */}
                <div className="space-y-3 p-4 md:hidden border-b border-slate-100 last:border-0">
                  <h3 className="text-sm font-black uppercase text-slate-900">{nombre}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">1er Periodo</p>
                      <EstadoAuditoriaHistorial asig={p1} align="start" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">2do Periodo</p>
                      <EstadoAuditoriaHistorial asig={p2} align="start" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}