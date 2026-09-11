import { useCallback, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';

import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { SectionTabs } from '@/components/ui/section-tabs';

import { AUDIT_EXECUTION_ROLES } from '@/config/navigation-config';
import { CompartirAuditoriaModal } from '@/features/auditorias/shared/components/compartir-auditoria-modal';
import { EstadoBadge } from '@/features/auditorias/shared/components/estado-badge';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { apiClient } from '@/lib/api/api-client';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const formatRange = (iniciaStr, terminaStr) => {
  if (!iniciaStr || !terminaStr) return '';

  const inicia = new Date(iniciaStr);
  const termina = new Date(terminaStr);
  const nombreMes = MESES[termina.getMonth()].toLowerCase();

  return `${inicia.getDate()} – ${termina.getDate()} ${nombreMes}`;
};

const getPeriodLabel = (c) => {
  if (!c) return '';

  const label =
    c.numeroCorte === 1
      ? 'Primer periodo'
      : c.numeroCorte === 2
        ? 'Segundo periodo'
        : `Periodo ${c.numeroCorte}`;

  const mesName = MESES[c.mes - 1];

  return `${label} · ${mesName} ${c.anio}`;
};

const formatearFechaCorta = (fechaStr) => {
  if (!fechaStr) return '';

  const date = new Date(fechaStr);
  const dia = date.getDate();
  const mes = MESES_CORTOS[date.getMonth()].toLowerCase();

  return `${dia} ${mes}`;
};

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '';

  const date = new Date(fechaStr);
  const dia = date.getDate();
  const mesName = MESES[date.getMonth()];
  const anio = date.getFullYear();

  return `${dia} ${mesName} ${anio}`;
};

const leerBorrador = (asignacion) => {
  const prefix = `encuestas-5s:auditoria-draft:autenticado:${asignacion.id}:`;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(prefix)) {
        const item = localStorage.getItem(key);

        if (item) {
          const parsed = JSON.parse(item);
          const respuestas = parsed?.respuestas ?? {};

          const respondidas = Object.values(respuestas).filter(
            (r) =>
              r.opcionFormularioIds?.length > 0 ||
              r.hallazgo?.trim(),
          ).length;

          const total = Object.keys(respuestas).length;

          if (respondidas > 0) {
            return {
              respondidas,
              total,
            };
          }
        }
      }
    }
  } catch {
    // noop
  }

  return null;
};

export function MisAuditoriasPage() {
  const { user } = useAuth();
  const isDesktop = useIsDesktop();

  const canExecuteAudit =
    AUDIT_EXECUTION_ROLES.includes(
      user?.rol,
    );

  const esComodin = Boolean(user?.rol === 'ADMINISTRADOR' && user?.esComodin);

  const [
    executables,
    setExecutables,
  ] = useState([]);

  const [
    comodinAudits,
    setComodinAudits,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const navigate = useNavigate();

  const [
    asignacionCompartir,
    setAsignacionCompartir,
  ] = useState(null);

  const [
    comodinModal,
    setComodinModal,
  ] = useState(null); // null o asignacion seleccionada para intervenir

  /*
   * ============================================================
   * CARGA DE AUDITORÍAS DEL PERIODO ACTUAL
   * ============================================================
   */

  useEffect(() => {
    let active = true;

    async function fetchExecutables() {
      setLoading(true);

      try {
        const requests = [
          apiClient.get('/asignaciones?tipoBandeja=EJECUTABLES&limite=100'),
        ];
        if (esComodin) {
          requests.push(apiClient.get('/asignaciones?tipoBandeja=COMODIN&limite=100'));
        }

        const [res, resComodin] = await Promise.all(requests);

        if (!active) {
          return;
        }

        const list =
          Array.isArray(res?.datos)
            ? res.datos
            : Array.isArray(res)
              ? res
              : [];

        if (resComodin) {
          const rawComodin =
            Array.isArray(resComodin?.datos)
              ? resComodin.datos
              : Array.isArray(resComodin)
                ? resComodin
                : [];
          // Asegurar segmentación estricta
          setExecutables(list.filter((asig) => !user?.id || asig.auditorId === user.id || asig.auditor?.id === user.id));
          setComodinAudits(rawComodin.filter((asig) => !user?.id || (asig.auditorId !== user.id && asig.auditor?.id !== user.id)));
        } else {
          setExecutables(list);
          setComodinAudits([]);
        }
      } catch (err) {
        console.error(
          'Error fetching executables:',
          err,
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchExecutables();

    return () => {
      active = false;
    };
  }, [esComodin, user?.id]);

  /*
   * ============================================================
   * AGRUPACIÓN POR PERIODO (AÑO, MES, CORTE)
   * ============================================================
   */

  const gruposPorPeriodo = useMemo(() => {
    const map = new Map();

    for (const asig of executables) {
      const obj = asig.objetivoAuditoria;
      if (!obj) continue;

      const key = `${obj.anio}-${String(obj.mes).padStart(2, '0')}-P${obj.periodo}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          anio: obj.anio,
          mes: obj.mes,
          periodo: obj.periodo,
          iniciaEn: obj.iniciaEn,
          terminaEn: obj.terminaEn,
          asignaciones: [],
        });
      }

      map.get(key).asignaciones.push(asig);
    }

    // Sort period groups chronologically: older first, then current
    return [...map.values()]
      .sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        if (a.mes !== b.mes) return a.mes - b.mes;
        return a.periodo - b.periodo;
      })
      .map((grupo) => {
        // Ordenar asignaciones: en curso (con borrador) primero, luego las demás
        const asignacionesOrdenadas = [...grupo.asignaciones].sort((a, b) => {
          const aEnCurso = leerBorrador(a) !== null ? 1 : 0;
          const bEnCurso = leerBorrador(b) !== null ? 1 : 0;
          return bEnCurso - aEnCurso;
        });

        return {
          ...grupo,
          asignaciones: asignacionesOrdenadas,
        };
      });
  }, [executables]);

  const porRealizarTotal = useMemo(() => {
    return executables.filter((asig) => asig.estado !== 'COMPLETADA' && asig.infoPeriodo?.realizable);
  }, [executables]);

  const comodinAuditsOrdenadas = useMemo(() => {
    return [...comodinAudits].sort((a, b) => {
      const aEnCurso = leerBorrador(a) !== null ? 1 : 0;
      const bEnCurso = leerBorrador(b) !== null ? 1 : 0;
      return bEnCurso - aEnCurso;
    });
  }, [comodinAudits]);

  /*
   * ============================================================
   * ACTUALIZAR INVITACIÓN SIN RECARGAR
   * ============================================================
   */

  const actualizarInvitacionLocal =
    useCallback(
      (
        asignacionId,
        invitacionActiva,
      ) => {
        setExecutables(
          (actuales) =>
            actuales.map(
              (asig) =>
                asig.id ===
                asignacionId
                  ? {
                      ...asig,
                      invitacionActiva,
                    }
                  : asig,
            ),
        );
      },
      [],
    );

  return (
    <section className="space-y-6 pt-4 sm:pt-0">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
          Auditorías
        </p>

        <h1 className="text-3xl font-black text-slate-950">
          Mis auditorías
        </h1>
      </div>

      {/* ======================================================
          NAVEGACIÓN
      ====================================================== */}

      <SectionTabs
        tabs={[
          { label: 'Por realizar', to: '/mis-auditorias', end: true },
          { label: 'Historial', to: '/mis-auditorias/historial' },
        ]}
      />

      {/* ======================================================
          CONTENIDO
      ====================================================== */}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {esComodin && comodinAudits.length > 0 && (
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Mis auditorías asignadas
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Auditorías bajo tu responsabilidad en el periodo actual.
                </p>
              </div>
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {executables.length} asignadas
              </span>
            </div>
          )}

          {/* ==================================================
              PERIODO COMPLETADO (SIN PENDIENTES)
          ================================================== */}

          {porRealizarTotal.length === 0 && (
            <Card className="border-dashed border-emerald-300 bg-emerald-50/20 backdrop-blur-xl">
              <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
                  <Icon name="check_circle" size="lg" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">✓ Sin auditorías pendientes</h2>
                  <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-600">
                    Has completado todas tus auditorías asignadas o no tienes periodos abiertos por realizar.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* ==================================================
              GRUPOS DE PERIODOS (AÑO, MES, CORTE)
          ================================================== */}

          {gruposPorPeriodo.map((grupo) => {
            const pendientesGrupo = grupo.asignaciones.filter((a) => a.estado !== 'COMPLETADA' && a.infoPeriodo?.realizable);
            const completadasGrupo = grupo.asignaciones.filter((a) => a.estado === 'COMPLETADA');
            const totalGrupo = grupo.asignaciones.length;

            if (pendientesGrupo.length === 0 && completadasGrupo.length === 0) return null;

            const esPeriodoAtrasado = grupo.asignaciones.some(
              (a) => a.infoPeriodo?.status === 'VENCIDA' || a.infoPeriodo?.texto === 'ATRASADA' || a.estado === 'ATRASADA'
            );

            const periodoInfo = {
              numeroCorte: grupo.periodo,
              mes: grupo.mes,
              anio: grupo.anio,
            };

            return (
              <div key={grupo.key} className="space-y-4">
                {/* TARJETA DE PERIODO */}
                <div
                  className={`rounded-2xl border p-5 backdrop-blur-xl transition md:p-6 ${
                    esPeriodoAtrasado
                      ? 'border-rose-200/90 bg-rose-50/60 shadow-[0_8px_28px_rgba(225,29,72,0.05)]'
                      : 'border-white/80 bg-white/75 shadow-[0_8px_28px_rgba(15,23,42,0.06)]'
                  }`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
                        Periodo de auditoría
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black text-slate-950">
                          {getPeriodLabel(periodoInfo).toUpperCase()}
                        </h2>
                        {esPeriodoAtrasado && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-100/90 px-2.5 py-0.5 text-xs font-black text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                            Periodo atrasado
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {formatRange(grupo.iniciaEn, grupo.terminaEn)}
                      </p>
                    </div>

                    <div className="flex min-w-[200px] flex-col items-start gap-1 md:items-end">
                      <span className="text-sm font-bold text-slate-700">
                        {completadasGrupo.length} realizadas · {pendientesGrupo.length} pendientes
                      </span>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300"
                          style={{
                            width: `${totalGrupo > 0 ? (completadasGrupo.length / totalGrupo) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISTA MOBILE */}
                {!isDesktop && (
                <div className="space-y-3">
                  {pendientesGrupo.map((asig) => {
                    const areaNombre = asig.objetivoAuditoria?.area?.nombre ?? asig.objetivoAuditoria?.nombreAreaSnapshot ?? 'Área';
                    const ind = asig.infoPeriodo;
                    const borrador = leerBorrador(asig);
                    const enCurso = borrador !== null;
                    const esAtrasada = ind?.status === 'VENCIDA' || ind?.texto === 'ATRASADA' || asig.estado === 'ATRASADA';

                    return (
                      <div
                        key={asig.id}
                        className={`overflow-hidden rounded-2xl border backdrop-blur-xl transition ${
                          enCurso
                            ? 'border-amber-200/80 bg-amber-50/25 shadow-[0_8px_24px_rgba(245,158,11,0.06)]'
                            : esAtrasada
                            ? 'border-rose-300/90 bg-rose-50/35 shadow-[0_8px_24px_rgba(225,29,72,0.06)]'
                            : 'border-white/90 bg-white/75 shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-black uppercase text-slate-900">{areaNombre}</h3>
                              <p className={`mt-0.5 text-xs font-semibold ${asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() || esAtrasada ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                Vence: {asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() ? 'Hoy 23:59' : formatearFechaCorta(asig.venceEn)}
                              </p>
                            </div>

                            {borrador && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-black text-amber-800">
                                <Icon name="edit_note" size="12px" />
                                {borrador.respondidas} de {borrador.total}
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                              asig.bloqueoPeriodoAnterior ? 'text-slate-500' : enCurso ? 'text-amber-600' : esAtrasada ? 'text-rose-700' : 'text-slate-500'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                asig.bloqueoPeriodoAnterior ? 'bg-slate-400' : enCurso ? 'bg-amber-500' : esAtrasada ? 'bg-rose-600' : 'bg-slate-400'
                              }`} />
                              {asig.bloqueoPeriodoAnterior
                                ? 'Bloqueada por periodo anterior'
                                : enCurso
                                ? 'En curso'
                                : esAtrasada
                                ? 'Atrasada'
                                : 'Pendiente'}
                            </span>
                          </div>

                          {asig.bloqueoPeriodoAnterior ? (
                            <div className="mt-2.5 rounded-xl border border-amber-200/70 bg-amber-50/60 p-2.5 text-xs text-amber-900 font-semibold flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1.5">
                                <Icon name="lock" size="14px" className="text-amber-600 shrink-0" />
                                <span>Primero termina {asig.bloqueoPeriodoAnterior.periodo === 1 ? 'P1' : 'P2'} de {asig.bloqueoPeriodoAnterior.mesEtiqueta}</span>
                              </span>
                              {asig.bloqueoPeriodoAnterior.asignacionId && (
                                <Link
                                  to={`/auditorias/${asig.bloqueoPeriodoAnterior.asignacionId}/realizar`}
                                  className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 underline hover:text-amber-950 shrink-0"
                                >
                                  Ir a P{asig.bloqueoPeriodoAnterior.periodo}
                                </Link>
                              )}
                            </div>
                          ) : ind && (
                            <div className="mt-3">
                              <EstadoBadge estado={asig} label={ind.texto} />
                            </div>
                          )}
                        </div>

                        {canExecuteAudit && (
                          <div className="flex items-center justify-between gap-3 border-t border-white/70 bg-white/35 px-4 py-2.5 backdrop-blur-md">
                            <button
                              type="button"
                              onClick={() => setAsignacionCompartir(asig)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-1.5 text-[11px] font-bold text-slate-400 hover:bg-white/60 hover:text-slate-600"
                            >
                              <Icon name="share" size="13px" />
                              Compartir
                            </button>

                            {asig.bloqueoPeriodoAnterior ? (
                              asig.bloqueoPeriodoAnterior.asignacionId ? (
                                <Link
                                  to={`/auditorias/${asig.bloqueoPeriodoAnterior.asignacionId}/realizar`}
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 text-xs font-black text-amber-800 backdrop-blur-md transition hover:bg-amber-100/80"
                                >
                                  Primero termina P{asig.bloqueoPeriodoAnterior.periodo} de {asig.bloqueoPeriodoAnterior.mesEtiqueta}
                                  <Icon name="arrow_forward" size="14px" />
                                </Link>
                              ) : (
                                <Link
                                  to={`/auditorias/${asig.id}/realizar`}
                                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-xs font-black text-slate-600 backdrop-blur-md"
                                >
                                  Pendiente anterior
                                  <Icon name="lock" size="14px" />
                                </Link>
                              )
                            ) : (
                              <Link
                                to={`/auditorias/${asig.id}/realizar`}
                                className={`inline-flex h-9 min-w-[102px] items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-black backdrop-blur-md transition ${
                                  enCurso
                                    ? 'border-amber-200/80 bg-amber-50/70 text-amber-700'
                                    : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700'
                                }`}
                              >
                                {enCurso ? 'Continuar' : 'Iniciar'}
                                <Icon name="arrow_forward" size="14px" />
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )}

                {/* VISTA DESKTOP */}
                {isDesktop && (
                <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                  <div className="grid grid-cols-[minmax(260px,1.6fr)_minmax(220px,1fr)_150px_240px] items-center gap-5 border-b border-slate-100/90 bg-white/45 px-6 py-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Área</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Disponibilidad</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Vence</span>
                    <span className="text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Acciones</span>
                  </div>

                  <div className="divide-y divide-slate-100/80">
                    {pendientesGrupo.map((asig) => {
                      const areaNombre = asig.objetivoAuditoria?.area?.nombre ?? asig.objetivoAuditoria?.nombreAreaSnapshot ?? 'Área';
                      const ind = asig.infoPeriodo;
                      const borrador = leerBorrador(asig);
                      const enCurso = borrador !== null;
                      const esAtrasada = ind?.status === 'VENCIDA' || ind?.texto === 'ATRASADA' || asig.estado === 'ATRASADA';

                      return (
                        <div
                          key={asig.id}
                          className={`grid grid-cols-[minmax(260px,1.6fr)_minmax(220px,1fr)_150px_240px] items-center gap-5 px-6 py-4 transition-colors ${
                            asig.bloqueoPeriodoAnterior
                              ? 'bg-slate-50/40'
                              : enCurso
                              ? 'bg-amber-50/10 hover:bg-amber-50/30'
                              : esAtrasada
                              ? 'bg-rose-50/30 hover:bg-rose-50/50'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="min-w-0">
                            <h3 className="text-sm font-black uppercase leading-5 text-slate-900">{areaNombre}</h3>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                asig.bloqueoPeriodoAnterior ? 'text-slate-500' : enCurso ? 'text-amber-600' : esAtrasada ? 'text-rose-700' : 'text-slate-500'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  asig.bloqueoPeriodoAnterior ? 'bg-slate-400' : enCurso ? 'bg-amber-500' : esAtrasada ? 'bg-rose-600' : 'bg-slate-400'
                                }`} />
                                {asig.bloqueoPeriodoAnterior
                                  ? 'Bloqueada por periodo anterior'
                                  : enCurso
                                  ? 'En curso'
                                  : esAtrasada
                                  ? 'Atrasada'
                                  : 'Pendiente'}
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0">
                            {asig.bloqueoPeriodoAnterior ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1 text-xs font-black uppercase text-amber-800 tracking-wide">
                                <Icon name="lock" size="13px" className="shrink-0 text-amber-600" />
                                <span className="truncate">Primero termina P{asig.bloqueoPeriodoAnterior.periodo} de {asig.bloqueoPeriodoAnterior.mesEtiqueta}</span>
                              </span>
                            ) : ind && (
                              <EstadoBadge estado={asig} label={ind.texto} />
                            )}
                          </div>

                          <div className={`whitespace-nowrap text-sm font-semibold ${asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() || esAtrasada ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                            {asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() ? 'Hoy 23:59' : formatearFecha(asig.venceEn)}
                          </div>

                          {canExecuteAudit ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setAsignacionCompartir(asig)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/60 hover:text-slate-600"
                                title="Compartir"
                              >
                                <Icon name="share" size="15px" />
                              </button>

                              {asig.bloqueoPeriodoAnterior ? (
                                asig.bloqueoPeriodoAnterior.asignacionId ? (
                                  <Link
                                    to={`/auditorias/${asig.bloqueoPeriodoAnterior.asignacionId}/realizar`}
                                    className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 text-xs font-black text-amber-800 backdrop-blur-md transition hover:bg-amber-100/80"
                                    title={`Primero termina P${asig.bloqueoPeriodoAnterior.periodo} de ${asig.bloqueoPeriodoAnterior.mesEtiqueta}`}
                                  >
                                    Primero termina P{asig.bloqueoPeriodoAnterior.periodo}
                                    <Icon name="arrow_forward" size="14px" />
                                  </Link>
                                ) : (
                                  <Link
                                    to={`/auditorias/${asig.id}/realizar`}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 text-xs font-black text-slate-600 backdrop-blur-md"
                                  >
                                    Bloqueada
                                    <Icon name="lock" size="14px" />
                                  </Link>
                                )
                              ) : (
                                <Link
                                  to={`/auditorias/${asig.id}/realizar`}
                                  className={`inline-flex h-9 w-[112px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-black backdrop-blur-md transition ${
                                    enCurso
                                      ? 'border-amber-200/80 bg-amber-50/70 text-amber-700'
                                      : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700'
                                  }`}
                                >
                                  {enCurso ? 'Continuar' : 'Iniciar'}
                                  <Icon name="arrow_forward" size="14px" />
                                </Link>
                              )}
                            </div>
                          ) : (
                            <div />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}
              </div>
            );
          })}

          {/* ==================================================
              AUDITORÍAS PENDIENTES DE OTROS USUARIOS
          ================================================== */}
          {esComodin && comodinAudits.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Otras auditorías pendientes
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Auditorías asignadas a otros usuarios en el periodo actual que puedes apoyar a realizar.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                  {comodinAudits.length} pendientes
                </span>
              </div>

              {/* VISTA MOBILE */}
              {!isDesktop && (
              <div className="space-y-3">
                {comodinAuditsOrdenadas.map((asig) => {
                  const areaNombre = asig.objetivoAuditoria?.area?.nombre ?? asig.objetivoAuditoria?.nombreAreaSnapshot ?? 'Área';
                  const auditorTitular = asig.auditor?.nombre || 'Sin asignar';
                  const responsableKpi = asig.responsableCumplimiento?.nombre;
                  const ind = asig.infoPeriodo;
                  const borrador = leerBorrador(asig);
                  const enCurso = borrador !== null;
                  const esAtrasada = ind?.status === 'VENCIDA' || ind?.texto === 'ATRASADA' || asig.estado === 'ATRASADA';

                  return (
                    <div
                      key={asig.id}
                      className={`overflow-hidden rounded-2xl border backdrop-blur-xl transition ${
                        enCurso
                          ? 'border-amber-300/90 bg-amber-50/40 shadow-[0_8px_24px_rgba(245,158,11,0.08)]'
                          : esAtrasada
                          ? 'border-rose-300/90 bg-rose-50/35 shadow-[0_8px_24px_rgba(225,29,72,0.06)]'
                          : 'border-slate-200/90 bg-slate-100/80 shadow-[0_8px_24px_rgba(15,23,42,0.04)]'
                      }`}
                    >
                      <div className="p-4">
                        {/* Banner titular */}
                        <div className={`mb-2.5 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                          enCurso
                            ? 'border-amber-200/70 bg-amber-100/60 text-amber-900'
                            : esAtrasada
                            ? 'border-rose-200 bg-rose-100/60 text-rose-900'
                            : 'border-slate-200 bg-slate-200/60 text-slate-700'
                        }`}>
                          <Icon name="person" size="13px" className={`shrink-0 ${enCurso ? 'text-amber-700' : esAtrasada ? 'text-rose-600' : 'text-slate-500'}`} />
                          <span className="truncate">
                            Asignada a: <strong className={`font-black ${enCurso ? 'text-amber-950' : esAtrasada ? 'text-rose-950' : 'text-slate-900'}`}>{auditorTitular}</strong>
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-black uppercase text-slate-900">{areaNombre}</h3>
                            <p className={`mt-0.5 text-xs font-semibold ${asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() || esAtrasada ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                              Vence: {asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() ? 'Hoy 23:59' : formatearFechaCorta(asig.venceEn)}
                            </p>
                          </div>

                          {borrador && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-[10px] font-black text-amber-800">
                              <Icon name="edit_note" size="12px" />
                              {borrador.respondidas} de {borrador.total}
                            </span>
                          )}
                        </div>

                        {responsableKpi && responsableKpi !== auditorTitular && (
                          <div className="mt-2 rounded-xl bg-slate-200/50 p-2 text-xs text-slate-600 flex items-center justify-between">
                            <span className="font-semibold text-slate-500">Resp. KPI:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[180px]">{responsableKpi}</span>
                          </div>
                        )}

                        {ind && (
                          <div className="mt-3">
                            <EstadoBadge
                              estado={asig}
                              label={ind.texto}
                            />
                          </div>
                        )}
                      </div>

                      {canExecuteAudit && (
                        <div className={`flex items-center justify-end gap-3 border-t px-4 py-2.5 backdrop-blur-md ${
                          enCurso
                            ? 'border-amber-100/70 bg-amber-50/40'
                            : esAtrasada
                            ? 'border-rose-100/70 bg-rose-50/30'
                            : 'border-slate-200/70 bg-slate-100/60'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setComodinModal(asig)}
                            className={`inline-flex h-9 min-w-[102px] items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-black backdrop-blur-md transition ${
                              enCurso
                                ? 'border-amber-200/80 bg-amber-50/70 text-amber-700'
                                : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700'
                            }`}
                          >
                            {enCurso ? 'Continuar' : 'Iniciar'}
                            <Icon name="arrow_forward" size="14px" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}

              {/* VISTA DESKTOP */}
              {isDesktop && (
              <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/70 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="grid grid-cols-[minmax(260px,1.6fr)_minmax(220px,1fr)_150px_240px] items-center gap-5 border-b border-slate-200/80 bg-slate-100/80 px-6 py-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Área</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Disponibilidad</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Vence</span>
                  <span className="text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Acciones</span>
                </div>

                <div className="divide-y divide-slate-200/70">
                  {comodinAuditsOrdenadas.map((asig) => {
                    const areaNombre = asig.objetivoAuditoria?.area?.nombre ?? asig.objetivoAuditoria?.nombreAreaSnapshot ?? 'Área';
                    const auditorTitular = asig.auditor?.nombre || 'Sin asignar';
                    const responsableKpi = asig.responsableCumplimiento?.nombre;
                    const ind = asig.infoPeriodo;
                    const borrador = leerBorrador(asig);
                    const enCurso = borrador !== null;
                    const esAtrasada = ind?.status === 'VENCIDA' || ind?.texto === 'ATRASADA' || asig.estado === 'ATRASADA';

                    return (
                      <div
                        key={asig.id}
                        className={`grid grid-cols-[minmax(260px,1.6fr)_minmax(220px,1fr)_150px_240px] items-center gap-5 px-6 py-4 transition-colors ${
                          enCurso
                            ? 'bg-amber-50/25 hover:bg-amber-50/45'
                            : esAtrasada
                            ? 'bg-rose-50/30 hover:bg-rose-50/50'
                            : 'bg-slate-100/50 hover:bg-slate-100/90'
                        }`}
                      >
                        <div className="min-w-0">
                          <h3 className="text-sm font-black uppercase leading-5 text-slate-900">{areaNombre}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold border ${
                              enCurso
                                ? 'bg-amber-50/90 text-amber-900 border-amber-200/70'
                                : esAtrasada
                                ? 'bg-rose-50 text-rose-900 border-rose-200/80'
                                : 'bg-slate-200/70 text-slate-700 border-slate-300/80'
                            }`}>
                              <Icon name="person" size="12px" className={enCurso ? 'text-amber-700' : esAtrasada ? 'text-rose-600' : 'text-slate-500'} />
                              Asignada a: <strong className={`font-bold ${enCurso ? 'text-amber-950' : esAtrasada ? 'text-rose-950' : 'text-slate-900'}`}>{auditorTitular}</strong>
                              {responsableKpi && responsableKpi !== auditorTitular && (
                                <span className={enCurso ? 'text-amber-600/80 font-normal' : esAtrasada ? 'text-rose-600/80 font-normal' : 'text-slate-500 font-normal'}> (KPI: {responsableKpi})</span>
                              )}
                            </span>
                            {enCurso && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2 py-0.5 text-[10px] font-black text-amber-800">
                                <Icon name="edit_note" size="12px" />
                                {borrador.respondidas}/{borrador.total}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          {ind && (
                            <EstadoBadge
                              estado={asig}
                              label={ind.texto}
                            />
                          )}
                        </div>

                        <div className={`whitespace-nowrap text-sm font-semibold ${asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() || esAtrasada ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          {asig.reabiertaHasta && new Date(asig.reabiertaHasta) > new Date() ? 'Hoy 23:59' : formatearFecha(asig.venceEn)}
                        </div>

                        {canExecuteAudit ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setComodinModal(asig)}
                              className={`inline-flex h-9 w-[112px] items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-black backdrop-blur-md transition ${
                                enCurso
                                  ? 'border-amber-200/80 bg-amber-50/70 text-amber-700'
                                  : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-700'
                              }`}
                            >
                              {enCurso ? 'Continuar' : 'Iniciar'}
                              <Icon name="arrow_forward" size="14px" />
                            </button>
                          </div>
                        ) : (
                          <div />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación para iniciar auditoría de otro usuario */}
      <Modal
        isOpen={Boolean(comodinModal)}
        onClose={() => setComodinModal(null)}
        className="max-w-md"
      >
        <ModalHeader onClose={() => setComodinModal(null)}>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Icon name="assignment" size="sm" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Auditoría asignada a otro usuario
              </p>
              <h2 className="text-base font-black text-slate-900">
                Confirmar realización
              </h2>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-3.5 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Área a evaluar:</span>
              <span className="font-black text-slate-900 uppercase">
                {comodinModal?.objetivoAuditoria?.area?.nombre ?? comodinModal?.objetivoAuditoria?.nombreAreaSnapshot}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Auditor titular asignado:</span>
              <span className="font-black text-slate-800">
                {comodinModal?.auditor?.nombre || 'Sin auditor'}
              </span>
            </div>
            {comodinModal?.responsableCumplimiento?.nombre && (
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Responsable del KPI:</span>
                <span className="font-bold text-slate-700">
                  {comodinModal.responsableCumplimiento.nombre}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500">Periodo:</span>
              <span className="font-bold text-slate-700">
                Periodo {comodinModal?.objetivoAuditoria?.periodo} ({MESES[(comodinModal?.objetivoAuditoria?.mes ?? 1) - 1]} {comodinModal?.objetivoAuditoria?.anio})
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold leading-relaxed text-slate-600">
            Esta auditoría está asignada a <strong className="text-slate-900">{comodinModal?.auditor?.nombre || 'otro usuario'}</strong>. Al continuar, podrás responder y completar la evaluación correspondiente.
          </p>

          <p className="text-[11px] font-bold text-slate-500">
            ¿Deseas continuar y realizar esta auditoría?
          </p>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setComodinModal(null)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            icon="arrow_forward"
            onClick={() => {
              const id = comodinModal?.id;
              setComodinModal(null);
              navigate(`/auditorias/${id}/realizar`);
            }}
          >
            Sí, continuar
          </Button>
        </ModalFooter>
      </Modal>

      {asignacionCompartir && (
        <CompartirAuditoriaModal
          asignacion={asignacionCompartir}
          isOpen={Boolean(asignacionCompartir)}
          invitacionInicial={asignacionCompartir.invitacionActiva}
          onClose={() => setAsignacionCompartir(null)}
          onInvitacionChange={actualizarInvitacionLocal}
        />
      )}
    </section>
  );
}
