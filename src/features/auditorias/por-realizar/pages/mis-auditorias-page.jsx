import { useCallback, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';

import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { SectionTabs } from '@/components/ui/section-tabs';

import { AUDIT_EXECUTION_ROLES } from '@/config/navigation-config';
import { CompartirAuditoriaModal } from '@/features/auditorias/shared/components/compartir-auditoria-modal';
import { useAuth } from '@/features/auth/hooks/use-auth';
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

  const canExecuteAudit =
    AUDIT_EXECUTION_ROLES.includes(
      user?.rol,
    );

  const [
    executables,
    setExecutables,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    asignacionCompartir,
    setAsignacionCompartir,
  ] = useState(null);

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
        const res =
          await apiClient.get(
            '/asignaciones?tipoBandeja=EJECUTABLES&limite=100',
          );

        if (!active) {
          return;
        }

        const list =
          Array.isArray(res?.datos)
            ? res.datos
            : Array.isArray(res)
              ? res
              : [];

        setExecutables(list);
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
  }, []);

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
    return [...map.values()].sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      if (a.mes !== b.mes) return a.mes - b.mes;
      return a.periodo - b.periodo;
    });
  }, [executables]);

  const porRealizarTotal = useMemo(() => {
    return executables.filter((asig) => asig.estado !== 'COMPLETADA' && asig.infoPeriodo?.realizable);
  }, [executables]);

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
    <section className="space-y-6">
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
          {/* ==================================================
              PERIODO ACTUAL
          ================================================== */}

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

            const periodoInfo = {
              numeroCorte: grupo.periodo,
              mes: grupo.mes,
              anio: grupo.anio,
            };

            return (
              <div key={grupo.key} className="space-y-4">
                {/* TARJETA DE PERIODO */}
                <div className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
                        Periodo de auditoría
                      </p>
                      <h2 className="mt-0.5 text-xl font-black text-slate-950">
                        {getPeriodLabel(periodoInfo).toUpperCase()}
                      </h2>
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
                <div className="block space-y-3 md:hidden">
                  {pendientesGrupo.map((asig) => {
                    const areaNombre = asig.objetivoAuditoria?.area?.nombre ?? asig.objetivoAuditoria?.nombreAreaSnapshot ?? 'Área';
                    const ind = asig.infoPeriodo;
                    const borrador = leerBorrador(asig);
                    const enCurso = borrador !== null;

                    return (
                      <div
                        key={asig.id}
                        className={`overflow-hidden rounded-2xl border backdrop-blur-xl transition ${
                          enCurso
                            ? 'border-amber-200/80 bg-amber-50/25 shadow-[0_8px_24px_rgba(245,158,11,0.06)]'
                            : 'border-white/90 bg-white/75 shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-black uppercase text-slate-900">{areaNombre}</h3>
                              <p className="mt-0.5 text-xs font-semibold text-slate-500">Vence: {formatearFechaCorta(asig.venceEn)}</p>
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
                              asig.bloqueoPeriodoAnterior ? 'text-slate-500' : enCurso ? 'text-amber-600' : 'text-slate-500'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                asig.bloqueoPeriodoAnterior ? 'bg-slate-400' : enCurso ? 'bg-amber-500' : 'bg-slate-400'
                              }`} />
                              {asig.bloqueoPeriodoAnterior
                                ? 'Bloqueada por periodo anterior'
                                : enCurso
                                ? 'En curso'
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
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${
                                  ind.color === 'rojo'
                                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                                    : ind.color === 'ambar'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {ind.texto}
                              </span>
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

                {/* VISTA DESKTOP */}
                <div className="hidden overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-[0_8px_28px_rgba(15,23,42,0.06)] backdrop-blur-xl md:block">
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

                      return (
                        <div
                          key={asig.id}
                          className={`grid grid-cols-[minmax(260px,1.6fr)_minmax(220px,1fr)_150px_240px] items-center gap-5 px-6 py-4 transition-colors ${
                            asig.bloqueoPeriodoAnterior ? 'bg-slate-50/40' : enCurso ? 'bg-amber-50/10 hover:bg-amber-50/30' : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="min-w-0">
                            <h3 className="text-sm font-black uppercase leading-5 text-slate-900">{areaNombre}</h3>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                asig.bloqueoPeriodoAnterior ? 'text-slate-500' : enCurso ? 'text-amber-600' : 'text-slate-500'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  asig.bloqueoPeriodoAnterior ? 'bg-slate-400' : enCurso ? 'bg-amber-500' : 'bg-slate-400'
                                }`} />
                                {asig.bloqueoPeriodoAnterior
                                  ? 'Bloqueada por periodo anterior'
                                  : enCurso
                                  ? 'En curso'
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
                              <span
                                className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${
                                  ind.color === 'rojo'
                                    ? 'border-rose-200/80 bg-rose-50/80 text-rose-700'
                                    : ind.color === 'ambar'
                                      ? 'border-amber-200/80 bg-amber-50/80 text-amber-700'
                                      : 'border-emerald-200/80 bg-emerald-50/80 text-emerald-700'
                                }`}
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                                <span className="truncate">{ind.texto}</span>
                              </span>
                            )}
                          </div>

                          <div className="whitespace-nowrap text-sm font-semibold text-slate-500">
                            {formatearFecha(asig.venceEn)}
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
              </div>
            );
          })}
        </div>
      )}

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
