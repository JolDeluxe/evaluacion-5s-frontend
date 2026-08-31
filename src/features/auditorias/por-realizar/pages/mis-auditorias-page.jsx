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
   * INFORMACIÓN DEL PERIODO
   * ============================================================
   */

  const activePeriodo =
    useMemo(() => {
      const obj = executables[0]?.objetivoAuditoria;
      if (!obj) return null;
      return {
        id: obj.id,
        anio: obj.anio,
        mes: obj.mes,
        numeroCorte: obj.periodo,
        iniciaEn: obj.iniciaEn,
        terminaEn: obj.terminaEn,
      };
    }, [executables]);

  const totalPeriodo =
    executables.length;

  const completadasPeriodo =
    useMemo(() => {
      return executables.filter(
        (asig) =>
          asig.estado ===
          'COMPLETADA',
      ).length;
    }, [executables]);

  const pendientesPeriodo =
    totalPeriodo -
    completadasPeriodo;

  const activePeriodUrgency =
    useMemo(() => {
      return (
        executables.find(
          (asig) =>
            asig.estado !==
            'COMPLETADA',
        )?.infoPeriodo ??
        null
      );
    }, [executables]);

  /*
   * ============================================================
   * AUDITORÍAS PENDIENTES / EJECUTABLES
   * ============================================================
   */

  const porRealizarList =
    useMemo(() => {
      return executables.filter(
        (asig) =>
          asig.estado !==
            'COMPLETADA' &&
          asig.infoPeriodo
            ?.realizable,
      );
    }, [executables]);

  /*
   * ============================================================
   * COMPLETADAS DEL PERIODO
   * ============================================================
   */

  const realizadasPeriodoLst =
    useMemo(() => {
      return executables.filter(
        (asig) =>
          asig.estado ===
          'COMPLETADA',
      );
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

          {activePeriodo && (
            <div
              className="
                rounded-2xl
                border border-white/80
                bg-white/75
                p-5
                shadow-[0_8px_28px_rgba(15,23,42,0.06)]
                backdrop-blur-xl
                md:p-6
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
                    Periodo actual
                  </p>

                  <h2 className="mt-0.5 text-xl font-black text-slate-950">
                    {getPeriodLabel(
                      activePeriodo,
                    ).toUpperCase()}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {formatRange(
                      activePeriodo.iniciaEn,
                      activePeriodo.terminaEn,
                    )}
                  </p>
                </div>

                <div
                  className="
                    flex
                    min-w-[200px]
                    flex-col
                    items-start
                    gap-1
                    md:items-end
                  "
                >
                  <span className="text-sm font-bold text-slate-700">
                    {completadasPeriodo}{' '}
                    realizadas ·{' '}
                    {pendientesPeriodo}{' '}
                    pendientes
                  </span>

                  <div
                    className="
                      mt-1
                      h-2
                      w-full
                      overflow-hidden
                      rounded-full
                      bg-slate-100
                    "
                  >
                    <div
                      className="
                        h-full
                        bg-emerald-600
                        transition-all
                        duration-300
                      "
                      style={{
                        width: `${
                          totalPeriodo >
                          0
                            ? (completadasPeriodo /
                                totalPeriodo) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  {activePeriodUrgency && (
                    <span
                      className={`mt-1 text-xs font-black ${
                        activePeriodUrgency.color ===
                        'rojo'
                          ? 'text-red-600'
                          : activePeriodUrgency.color ===
                              'ambar'
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                      }`}
                    >
                      {
                        activePeriodUrgency.texto
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              PERIODO COMPLETADO
          ================================================== */}

          {porRealizarList.length ===
            0 && (
            <Card className="border-dashed border-emerald-300 bg-emerald-50/20 backdrop-blur-xl">
              <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-3xl
                    bg-emerald-100
                    text-emerald-700
                  "
                >
                  <Icon
                    name="check_circle"
                    size="lg"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    ✓ Periodo completado
                  </h2>

                  <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-600">
                    Terminaste todas tus
                    auditorías del{' '}
                    {activeCiclo
                      ? getPeriodLabel(
                          activeCiclo,
                        )
                      : 'periodo actual'}
                    .
                  </p>

                  <p className="mt-1 text-sm font-black text-emerald-800">
                    {
                      completadasPeriodo
                    }{' '}
                    de {totalPeriodo}{' '}
                    realizadas
                  </p>
                </div>
              </CardBody>
            </Card>
          )}

          {(porRealizarList.length >
            0 ||
            realizadasPeriodoLst.length >
              0) && (
            <>
              {/* ==================================================
                  MOBILE
              ================================================== */}

              <div className="block space-y-3 md:hidden">
                {/* PENDIENTES */}

                {porRealizarList.map(
                  (asig) => {
                    const areaNombre =
                      asig
                        .objetivoAuditoria
                        ?.area?.nombre ??
                      asig
                        .objetivoAuditoria
                        ?.nombreAreaSnapshot ??
                      'Área';

                    const ind =
                      asig.infoPeriodo;

                    const borrador =
                      leerBorrador(
                        asig,
                      );

                    const enCurso =
                      borrador !== null;

                    const progresoLabel =
                      enCurso
                        ? borrador.total >
                          0
                          ? `${borrador.respondidas} de ${borrador.total} respondidas`
                          : 'Progreso guardado'
                        : null;

                    return (
                      <div
                        key={
                          asig.id
                        }
                        className={`
                          overflow-hidden
                          rounded-2xl
                          border
                          backdrop-blur-xl
                          transition
                          ${
                            enCurso
                                ? `
                                  border-amber-200/80
                                  bg-amber-50/25
                                  shadow-[0_8px_24px_rgba(245,158,11,0.06)]
                                `
                                : `
                                  border-white/90
                                  bg-white/75
                                  shadow-[0_8px_24px_rgba(15,23,42,0.06)]
                                `
                          }
                        `}
                      >
                        {/* INFORMACIÓN */}

                        <div className="p-4">
                          <h3
                            className="
                              text-base
                              font-black
                              uppercase
                              leading-5
                              text-slate-900
                            "
                          >
                            {
                              areaNombre
                            }
                          </h3>

                          <div
                            className="
                              mt-1.5
                              flex
                              flex-wrap
                              items-center
                              gap-x-2
                              gap-y-1
                            "
                          >
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                enCurso
                                    ? 'text-amber-600'
                                    : 'text-slate-500'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  enCurso
                                      ? 'bg-amber-500'
                                      : 'bg-slate-400'
                                }`}
                              />

                              {enCurso
                                  ? 'En curso'
                                  : 'Pendiente'}
                            </span>

                            {/* {progresoLabel && (
                              <span className="text-xs font-semibold text-amber-700/75">
                                ·{' '}
                                {
                                  progresoLabel
                                }
                              </span>
                            )} */}
                          </div>

                          {/* DISPONIBILIDAD MOBILE */}

                          {ind && (
                            <div className="mt-3">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                                  ind.color ===
                                  'rojo'
                                    ? `
                                      border-rose-200/80
                                      bg-rose-50/70
                                      text-rose-700
                                    `
                                    : ind.color ===
                                        'ambar'
                                      ? `
                                        border-amber-200/80
                                        bg-amber-50/70
                                        text-amber-700
                                      `
                                      : `
                                        border-emerald-200/80
                                        bg-emerald-50/70
                                        text-emerald-700
                                      `
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                {
                                  ind.texto
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        {/* ACCIONES MOBILE */}

                        {canExecuteAudit && (
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-3
                              border-t
                              border-white/70
                              bg-white/35
                              px-4
                              py-2.5
                              backdrop-blur-md
                            "
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setAsignacionCompartir(
                                  asig,
                                )
                              }
                              className={`
                                inline-flex
                                h-8
                                items-center
                                gap-1.5
                                rounded-lg
                                px-1.5
                                text-[11px]
                                font-bold
                                transition
                                active:scale-[0.97]
                                text-slate-400
                                hover:bg-white/60
                                hover:text-slate-600
                              `}
                            >
                              <Icon
                                name="share"
                                size="13px"
                              />

                              Compartir
                            </button>

                            <Link
                              to={`/auditorias/${asig.id}/realizar`}
                              className={`inline-flex h-9 min-w-[102px] items-center justify-center gap-1.5 rounded-xl border px-3.5 text-xs font-black backdrop-blur-md transition active:scale-[0.98] ${
                                enCurso
                                  ? `
                                    border-amber-200/80
                                    bg-amber-50/70
                                    text-amber-700
                                    shadow-[0_4px_12px_rgba(245,158,11,0.07)]
                                  `
                                  : `
                                    border-emerald-200/80
                                    bg-emerald-50/70
                                    text-emerald-700
                                    shadow-[0_4px_12px_rgba(16,185,129,0.07)]
                                  `
                              }`}
                            >
                              {enCurso
                                  ? 'Continuar'
                                  : 'Iniciar'}

                              <Icon
                                name="arrow_forward"
                                size="14px"
                              />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}

                {porRealizarList.length >
                  0 &&
                  realizadasPeriodoLst.length >
                    0 && (
                    <div className="border-t border-slate-100 pb-1 pt-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Completadas
                      </h4>
                    </div>
                  )}

                {realizadasPeriodoLst.map(
                  (asig) => {
                    const areaNombre =
                      asig
                        .objetivoAuditoria
                        ?.area?.nombre ??
                      asig
                        .objetivoAuditoria
                        ?.nombreAreaSnapshot ??
                      'Área';

                    const pct =
                      asig
                        .objetivoAuditoria
                        ?.envioResultado
                        ?.porcentaje
                        ? `${Number(
                            asig
                              .objetivoAuditoria
                              .envioResultado
                              .porcentaje,
                          ).toFixed(1)}%`
                        : '100%';

                    const fechaStr =
                      formatearFechaCorta(
                        asig.completadoEn,
                      );

                    return (
                      <div
                        key={
                          asig.id
                        }
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          rounded-2xl
                          border
                          border-emerald-100
                          bg-emerald-50/10
                          p-4
                          opacity-75
                        "
                      >
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold uppercase leading-5 text-slate-800">
                            {
                              areaNombre
                            }
                          </h3>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="inline-flex items-center text-xs font-black text-emerald-700">
                              <span className="mr-1 text-sm">
                                ✓
                              </span>

                              Realizada{' '}
                              {pct}
                            </span>

                            {fechaStr && (
                              <>
                                <span className="text-xs text-slate-200">
                                  |
                                </span>

                                <span className="text-xs font-bold text-slate-500">
                                  {
                                    fechaStr
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* ==================================================
                  DESKTOP
              ================================================== */}

              <div
                className="
                  hidden
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/80
                  bg-white/75
                  shadow-[0_8px_28px_rgba(15,23,42,0.06)]
                  backdrop-blur-xl
                  md:block
                "
              >
                <div
                  className="
                    grid
                    grid-cols-[minmax(260px,1.6fr)_minmax(190px,1fr)_170px_212px]
                    items-center
                    gap-5
                    border-b
                    border-slate-100/90
                    bg-white/45
                    px-6
                    py-3
                  "
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Área
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Disponibilidad
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Vence
                  </span>

                  <span className="text-right text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Acciones
                  </span>
                </div>

                <div className="divide-y divide-slate-100/80">
                  {porRealizarList.map(
                    (asig) => {
                      const areaNombre =
                        asig
                          .objetivoAuditoria
                          ?.area?.nombre ??
                        asig
                          .objetivoAuditoria
                          ?.nombreAreaSnapshot ??
                        'Área';

                      const ind =
                        asig.infoPeriodo;

                      const borrador =
                        leerBorrador(
                          asig,
                        );

                      const enCurso =
                        borrador !==
                        null;

                      const progresoLabel =
                        enCurso
                          ? borrador.total >
                            0
                            ? `${borrador.respondidas} de ${borrador.total} respondidas`
                            : 'Progreso guardado'
                          : null;

                      return (
                        <div
                          key={
                            asig.id
                          }
                          className={`
                            grid
                            grid-cols-[minmax(260px,1.6fr)_minmax(190px,1fr)_170px_212px]
                            items-center
                            gap-5
                            px-6
                            py-4
                            transition-colors
                            ${
                              enCurso
                                  ? 'bg-amber-50/10 hover:bg-amber-50/30'
                                  : 'hover:bg-slate-50/70'
                            }
                          `}
                        >
                          <div className="min-w-0">
                            <h3 className="text-sm font-black uppercase leading-5 text-slate-900">
                              {
                                areaNombre
                              }
                            </h3>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                  enCurso
                                      ? 'text-amber-600'
                                      : 'text-slate-500'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    enCurso
                                        ? 'bg-amber-500'
                                        : 'bg-slate-400'
                                  }`}
                                />

                                {enCurso
                                    ? 'En curso'
                                    : 'Pendiente'}
                              </span>

                              {/* {progresoLabel && (
                                <span className="text-xs font-semibold text-amber-700/65">
                                  ·{' '}
                                  {
                                    progresoLabel
                                  }
                                </span>
                              )} */}

                            </div>
                          </div>

                          <div className="min-w-0">
                            {ind && (
                              <span
                                className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                                  ind.color ===
                                  'verde'
                                    ? `
                                      border-emerald-200/80
                                      bg-emerald-50/70
                                      text-emerald-700
                                    `
                                    : ind.color ===
                                        'ambar'
                                      ? `
                                        border-amber-200/80
                                        bg-amber-50/70
                                        text-amber-700
                                      `
                                      : ind.color ===
                                          'rojo'
                                        ? `
                                          border-rose-200/80
                                          bg-rose-50/70
                                          text-rose-700
                                        `
                                        : `
                                          border-slate-200
                                          bg-slate-50
                                          text-slate-500
                                        `
                                }`}
                              >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

                                <span className="truncate">
                                  {
                                    ind.texto
                                  }
                                </span>
                              </span>
                            )}
                          </div>

                          <div className="whitespace-nowrap text-sm font-semibold text-slate-500">
                            {formatearFecha(
                              asig.venceEn,
                            )}
                          </div>

                          {canExecuteAudit ? (
                            <div
                              className="
                                grid
                                grid-cols-[88px_112px]
                                items-center
                                justify-end
                                gap-2
                              "
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setAsignacionCompartir(
                                    asig,
                                  )
                                }
                                className={`
                                  inline-flex
                                  h-8
                                  w-[88px]
                                  items-center
                                  justify-center
                                  gap-1.5
                                  rounded-lg
                                  px-1.5
                                  text-[11px]
                                  font-bold
                                  transition
                                  active:scale-[0.97]
                                  text-slate-400
                                  hover:bg-white/70
                                  hover:text-slate-600
                                `}
                              >
                                <Icon
                                  name="share"
                                  size="13px"
                                />

                                Compartir
                              </button>

                              <Link
                                to={`/auditorias/${asig.id}/realizar`}
                                className={`inline-flex h-9 w-[112px] items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-black backdrop-blur-md transition active:scale-[0.98] ${
                                  enCurso
                                    ? `
                                      border-amber-200/80
                                      bg-amber-50/70
                                      text-amber-700
                                      shadow-[0_4px_12px_rgba(245,158,11,0.07)]
                                    `
                                    : `
                                      border-emerald-200/80
                                      bg-emerald-50/70
                                      text-emerald-700
                                      shadow-[0_4px_12px_rgba(16,185,129,0.07)]
                                    `
                                }`}
                              >
                                {enCurso
                                    ? 'Continuar'
                                    : 'Iniciar'}

                                <Icon
                                  name="arrow_forward"
                                  size="15px"
                                />
                              </Link>
                            </div>
                          ) : (
                            <div />
                          )}
                        </div>
                      );
                    },
                  )}

                  {realizadasPeriodoLst.map(
                    (asig) => {
                      const areaNombre =
                        asig
                          .objetivoAuditoria
                          ?.area?.nombre ??
                        asig
                          .objetivoAuditoria
                          ?.nombreAreaSnapshot ??
                        'Área';

                      const pct =
                        asig
                          .objetivoAuditoria
                          ?.envioResultado
                          ?.porcentaje
                          ? `${Number(
                              asig
                                .objetivoAuditoria
                                .envioResultado
                                .porcentaje,
                            ).toFixed(1)}%`
                          : '100%';

                      const fechaStr =
                        formatearFechaCorta(
                          asig.completadoEn,
                        );

                      return (
                        <div
                          key={
                            asig.id
                          }
                          className="
                            grid
                            grid-cols-[minmax(260px,1.6fr)_minmax(190px,1fr)_170px_212px]
                            items-center
                            gap-5
                            bg-emerald-50/5
                            px-6
                            py-4
                            opacity-75
                          "
                        >
                          <div className="min-w-0">
                            <h3 className="text-sm font-black uppercase leading-5 text-slate-700">
                              {
                                areaNombre
                              }
                            </h3>

                            <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700">
                              <span>
                                ✓
                              </span>

                              Realizada
                            </span>
                          </div>

                          <div>
                            <span
                              className="
                                inline-flex
                                rounded-full
                                border
                                border-emerald-200
                                bg-emerald-50/70
                                px-3
                                py-1
                                text-xs
                                font-bold
                                text-emerald-700
                              "
                            >
                              {pct}
                            </span>
                          </div>

                          <div className="whitespace-nowrap text-sm font-semibold text-slate-500">
                            {fechaStr ||
                              '—'}
                          </div>

                          <div className="text-right text-sm font-bold text-slate-400">
                            Completada
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <CompartirAuditoriaModal
        asignacion={
          asignacionCompartir
        }
        isOpen={Boolean(
          asignacionCompartir,
        )}
        onClose={() =>
          setAsignacionCompartir(
            null,
          )
        }
        onInvitacionChange={
          actualizarInvitacionLocal
        }
      />
    </section>
  );
}
