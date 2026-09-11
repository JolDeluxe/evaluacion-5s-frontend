
import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { SectionTabs } from '@/components/ui/section-tabs';
import { SelectorMesNavegacion } from '@/components/ui/selector-mes-navegacion';
import { apiClient } from '@/lib/api/api-client';
import { useIsDesktop } from '@/hooks/useMediaQuery';

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

const obtenerCierrePeriodo = (anio, mes, periodo) => {
  if (!anio || !mes || !periodo) return null;

  const ultimoDiaMes = new Date(anio, mes, 0).getDate();
  const diaCierre = periodo === 1 ? 15 : ultimoDiaMes;

  return new Date(anio, mes - 1, diaCierre, 23, 59, 59, 999);
};

// ─── Period Cell Component ────────────────────────────────────────────────────

// ─── Period Cell Component ────────────────────────────────────────────────────

import { obtenerEstadoVisualAuditoria } from '@/features/auditorias/shared/utils/estados-auditoria';

import { EstadoBadge } from '@/features/auditorias/shared/components/estado-badge';

function EstadoAuditoriaHistorial({
  asig,
  align = 'center',
  programado = false,
  periodo,
  anio,
  mes,
}) {
  const isStart = align === 'start';
  const containerClass = isStart ? 'flex flex-col items-start text-left gap-0.5' : 'flex flex-col items-center text-center gap-0.5';

  if (!asig) {
    if (programado) {
      const cierrePeriodo = obtenerCierrePeriodo(anio, mes, periodo);
      const estaCerrado = cierrePeriodo ? new Date() > cierrePeriodo : false;
      const label = estaCerrado ? 'No realizada' : 'Pendiente';
      const badgeClass = estaCerrado
        ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
        : 'bg-slate-50 border-slate-200 text-slate-600 font-bold';

      return (
        <div className={containerClass}>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] leading-none ${badgeClass}`}>
            {label}
          </span>
        </div>
      );
    }

    return <span className="text-xs font-bold text-slate-300">—</span>;
  }

  const { infoPeriodo, objetivoAuditoria } = asig;
  const envio = objetivoAuditoria?.envioResultado;
  const realizada = asig.realizada === true || Boolean(envio && !envio.invalidadoEn);
  const realizadaATiempo = Boolean(
    asig.realizadaATiempo ??
    (envio?.realizadaATiempo ?? (
      envio?.verificadoEn && objetivoAuditoria?.terminaEn
        ? new Date(envio.verificadoEn) <= new Date(objetivoAuditoria.terminaEn)
        : false
    )),
  );
  const porcentaje = asig.porcentaje ?? envio?.porcentaje;
  const pct = porcentaje != null && !Number.isNaN(Number(porcentaje))
    ? `${Number(porcentaje).toFixed(2)}%`
    : '0.00%';
  const ejecutadoPorApoyo = asig.ejecutadoPorApoyo === true;
  const esInvitado = asig.esInvitado === true || Boolean(envio?.enlaceInvitadoId);
  const nombreEjecutor = asig.nombreEjecutor || envio?.enviadoPorUsuario?.nombre || 'Sin nombre';

  if (realizada) {
    const fecha = fechaCorta(asig.completadoEn || envio?.verificadoEn);
    const label = `${realizadaATiempo ? 'Realizada' : 'Realizada Tarde'} · ${pct}`;
    const badgeClass = realizadaATiempo
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
      : 'bg-rose-50 border-rose-200 text-rose-700 font-bold';

    return (
      <div className={containerClass}>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] leading-none ${badgeClass}`}>
          {label}
        </span>
        {ejecutadoPorApoyo && (
          <p className="text-[11px] font-semibold text-slate-500">
            (Apoyo: {nombreEjecutor})
          </p>
        )}
        {esInvitado && (
          <p className="text-[11px] font-semibold text-slate-500">
            (Enlace invitado)
          </p>
        )}
        {!ejecutadoPorApoyo && !esInvitado && fecha && (
          <p className="text-[11px] font-semibold text-slate-400">{fecha}</p>
        )}
      </div>
    );
  }

  const estaCerrado = infoPeriodo?.status === 'CERRADA' || infoPeriodo?.status === 'NO_REALIZADA';
  const label = estaCerrado ? 'No realizada' : 'Pendiente';
  const badgeClass = estaCerrado
    ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
    : 'bg-slate-50 border-slate-200 text-slate-600 font-bold';

  return (
    <div className={containerClass}>
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] leading-none ${badgeClass}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HistorialAuditoriasPage() {
  const isDesktop = useIsDesktop();
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
    (a) => obtenerEstadoVisualAuditoria(a) === 'REALIZADA',
  ).length;

  const pendientes = historial.filter(
    (a) => {
      const est = obtenerEstadoVisualAuditoria(a);
      return est === 'PENDIENTE' || est === 'AUN_NO_INICIA' || est === 'REABIERTA' || est === 'ATRASADA';
    },
  ).length;

  const noRealizadas = historial.filter(
    (a) => obtenerEstadoVisualAuditoria(a) === 'NO_REALIZADA',
  ).length;

  const periodoTituloLabel = `${MESES[filtroMes - 1].toUpperCase()} ${filtroAnio}`;
  const labelP1 = 'Primer periodo';
  const labelP2 = 'Segundo periodo';

  return (
    <section className="space-y-6 pt-4 sm:pt-0">
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
          {isDesktop && (
          <div className="grid grid-cols-[40%_30%_30%] items-center border-b border-app-border bg-slate-50/70 py-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <div className="px-6">Área</div>
            <div className="px-5 text-center">{labelP1}</div>
            <div className="px-5 text-center">{labelP2}</div>
          </div>
          )}

          <div className="divide-y divide-app-border">
            {areaMap.map(({ nombre, p1, p2 }) => (
              <div key={nombre}>
                {/* DESKTOP ROW */}
                {isDesktop ? (
                <div className="grid grid-cols-[40%_30%_30%] items-center py-4 transition hover:bg-slate-50/70">
                  <div className="min-w-0 px-6">
                    <div className="text-sm font-black uppercase leading-5 text-slate-900">
                      {nombre}
                    </div>
                  </div>

                  <div className="flex min-w-0 justify-center px-5">
                    <EstadoAuditoriaHistorial
                      asig={p1}
                      programado={Boolean(p1 || p2)}
                      periodo={1}
                      anio={filtroAnio}
                      mes={filtroMes}
                    />
                  </div>

                  <div className="flex min-w-0 justify-center px-5">
                    <EstadoAuditoriaHistorial
                      asig={p2}
                      programado={Boolean(p1 || p2)}
                      periodo={2}
                      anio={filtroAnio}
                      mes={filtroMes}
                    />
                  </div>
                </div>
                ) : (
                /* MOBILE CARD */
                <div className="space-y-3 p-4 border-b border-slate-100 last:border-0">
                  <h3 className="text-sm font-black uppercase text-slate-900">{nombre}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">1er Periodo</p>
                      <EstadoAuditoriaHistorial
                        asig={p1}
                        align="start"
                        programado={Boolean(p1 || p2)}
                        periodo={1}
                        anio={filtroAnio}
                        mes={filtroMes}
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">2do Periodo</p>
                      <EstadoAuditoriaHistorial
                        asig={p2}
                        align="start"
                        programado={Boolean(p1 || p2)}
                        periodo={2}
                        anio={filtroAnio}
                        mes={filtroMes}
                      />
                    </div>
                  </div>
                </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
