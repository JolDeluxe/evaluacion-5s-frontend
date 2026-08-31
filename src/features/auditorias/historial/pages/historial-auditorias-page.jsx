
import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { SectionTabs } from '@/components/ui/section-tabs';
import { apiClient } from '@/lib/api/api-client';

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

function PeriodCell({ asig }) {
  if (!asig) {
    return (
      <span className="text-sm font-bold text-slate-300">
        —
      </span>
    );
  }

  if (asig.estado === 'COMPLETADA') {
    const envio =
      asig.objetivoAuditoria?.envioResultado;

    const pct =
      asig.objetivoAuditoria?.envioResultado?.porcentaje
        ? `${Number(
            asig.objetivoAuditoria.envioResultado.porcentaje,
          ).toFixed(1)}%`
        : '100%';

    const fecha = fechaCorta(
      asig.completadoEn,
    );

    const realizadoPor =
      envio?.enlaceInvitadoId
        ? `${envio.nombreAuditorSnapshot} · ${
            envio.enviadoPorUsuarioId
              ? 'Usuario invitado'
              : 'Invitada'
          }`
        : 'Realizada por ti';

    return (
      <div>
        <p className="text-sm font-black text-emerald-700">
          ✓ {pct}
        </p>

        <p className="mt-0.5 text-xs font-semibold text-slate-500">
          {realizadoPor}
          {fecha ? ` · ${fecha}` : ''}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-bold text-slate-500">
        🔒 No realizada
      </p>

      <p className="mt-0.5 text-xs font-semibold text-slate-400">
        Periodo cerrado
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function HistorialAuditoriasPage() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const ahora = new Date();

  // Default to current month/year when no params provided
  const anioActual =
    ahora.getFullYear();

  const mesActual =
    ahora.getMonth() + 1;

  const filtroAnio = parseInt(
    searchParams.get('anio') ||
      String(anioActual),
    10,
  );

  const filtroMes = parseInt(
    searchParams.get('mes') ||
      String(mesActual),
    10,
  );

  const [historial, setHistorial] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // Ensure URL always has anio+mes so filters are always explicit
  useEffect(() => {
    const paramAnio =
      searchParams.get('anio');

    const paramMes =
      searchParams.get('mes');

    if (!paramAnio || !paramMes) {
      const params =
        new URLSearchParams(
          searchParams,
        );

      if (!paramAnio) {
        params.set(
          'anio',
          String(anioActual),
        );
      }

      if (!paramMes) {
        params.set(
          'mes',
          String(mesActual),
        );
      }

      setSearchParams(params, {
        replace: true,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all records for the selected month (no pagination)
  useEffect(() => {
    let active = true;

    async function fetchHistory() {
      setLoading(true);

      try {
        const queryParams =
          new URLSearchParams();

        queryParams.set(
          'tipoBandeja',
          'HISTORIAL',
        );

        queryParams.set(
          'anio',
          String(filtroAnio),
        );

        queryParams.set(
          'mes',
          String(filtroMes),
        );

        const res =
          await apiClient.get(
            `/asignaciones?${queryParams.toString()}`,
          );

        if (active) {
          const list =
            Array.isArray(res?.datos)
              ? res.datos
              : Array.isArray(res)
                ? res
                : [];

          setHistorial(list);
        }
      } catch (err) {
        console.error(
          'Error fetching history:',
          err,
        );
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
  }, [
    filtroAnio,
    filtroMes,
  ]);

  // ─── Group by area, slot P1 and P2 ─────────────────────────────────────────

  const areaMap = useMemo(() => {
    const map = {};

    historial.forEach((item) => {
      const nombre =
        item.objetivoAuditoria?.area
          ?.nombre ??
        item.objetivoAuditoria
          ?.nombreAreaSnapshot ??
        'SIN ÁREA';

      const corte =
        item.objetivoAuditoria
          ?.periodo ?? 1;

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
    return Object.values(
      map,
    ).sort((a, b) =>
      a.nombre.localeCompare(
        b.nombre,
        'es-MX',
        {
          sensitivity: 'base',
        },
      ),
    );
  }, [historial]);

  // ─── Summary counts ─────────────────────────────────────────────────────────

  const totalAreas =
    areaMap.length;

  const realizadas =
    historial.filter(
      (a) =>
        a.estado ===
        'COMPLETADA',
    ).length;

  const noRealizadas =
    historial.filter(
      (a) =>
        a.estado !==
        'COMPLETADA',
    ).length;

  // ─── Filter helpers ─────────────────────────────────────────────────────────

  const handleAnio = (
    value,
  ) => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    params.set(
      'anio',
      String(value),
    );

    setSearchParams(params);
  };

  const handleMes = (
    value,
  ) => {
    const params =
      new URLSearchParams(
        searchParams,
      );

    params.set(
      'mes',
      String(value),
    );

    setSearchParams(params);
  };

  const currentYear =
    ahora.getFullYear();

  const years = Array.from(
    {
      length:
        currentYear -
        2024 +
        1,
    },
    (_, i) => 2024 + i,
  ).reverse();

  const periodoTituloLabel =
    `${MESES[filtroMes - 1].toUpperCase()} ${filtroAnio}`;

  const labelP1 =
    'Primer periodo';

  const labelP2 =
    'Segundo periodo';

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

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase text-slate-500">
            Año
          </label>

          <select
            value={filtroAnio}
            onChange={(e) =>
              handleAnio(
                e.target.value,
              )
            }
            className="h-9 min-w-[90px] rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-bold text-slate-700 outline-none"
          >
            {years.map(
              (y) => (
                <option
                  key={y}
                  value={y}
                >
                  {y}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-black uppercase text-slate-500">
            Mes
          </label>

          <select
            value={filtroMes}
            onChange={(e) =>
              handleMes(
                e.target.value,
              )
            }
            className="h-9 min-w-[130px] rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-bold text-slate-700 outline-none"
          >
            {MESES.map(
              (
                m,
                idx,
              ) => (
                <option
                  key={
                    idx + 1
                  }
                  value={
                    idx + 1
                  }
                >
                  {m}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      {/* Month header */}

      {!loading &&
        historial.length >
          0 && (
          <div className="space-y-0.5">
            <h2 className="text-xl font-black text-slate-900">
              {
                periodoTituloLabel
              }
            </h2>

            <p className="text-sm font-semibold text-slate-500">
              {totalAreas}{' '}
              {totalAreas ===
              1
                ? 'área'
                : 'áreas'}{' '}
              ·{' '}
              {realizadas}{' '}
              realizadas ·{' '}
              {
                noRealizadas
              }{' '}
              no realizadas
            </p>
          </div>
        )}

      {/* Content */}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : historial.length ===
        0 ? (
        <Card className="border-dashed border-slate-300 bg-white/70">
          <CardBody className="py-14 text-center">
            <p className="font-semibold text-slate-500">
              Sin registros
              para{' '}
              {MESES[
                filtroMes - 1
              ].toLowerCase()}{' '}
              {filtroAnio}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* ==================================================
              DESKTOP HEADER
          ================================================== */}

          <div
            className="
              hidden
              md:grid
              md:grid-cols-[48%_26%_26%]
              items-center
              border-b
              border-slate-200
              bg-slate-50
              py-3
              text-xs
              font-black
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            <div className="px-6 text-center">
              Área
            </div>

            <div className="px-5 text-center">
              {labelP1}
            </div>

            <div className="px-5 text-center">
              {labelP2}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {areaMap.map(
              ({
                nombre,
                p1,
                p2,
              }) => (
                <div
                  key={
                    nombre
                  }
                >
                  {/* ==================================================
                      DESKTOP ROW
                  ================================================== */}

                  <div
                    className="
                      hidden
                      md:grid
                      md:grid-cols-[48%_26%_26%]
                      items-start
                      py-4
                      transition
                      hover:bg-slate-50/60
                    "
                  >
                    {/* ÁREA */}

                    <div className="min-w-0 px-6">
                      <div className="text-sm font-bold uppercase leading-5 text-slate-900">
                        {nombre}
                      </div>
                    </div>

                    {/* PRIMER PERIODO */}

                    <div className="flex min-w-0 justify-center px-5">
                      <div className="w-full max-w-[220px]">
                        <PeriodCell
                          asig={
                            p1
                          }
                        />
                      </div>
                    </div>

                    {/* SEGUNDO PERIODO */}

                    <div className="flex min-w-0 justify-center px-5">
                      <div className="w-full max-w-[220px]">
                        <PeriodCell
                          asig={
                            p2
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      MOBILE
                  ================================================== */}

                  <div className="space-y-3 px-4 py-4 md:hidden">
                    <h3 className="text-base font-bold uppercase text-slate-900">
                      {nombre}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          1er Periodo
                        </p>

                        <PeriodCell
                          asig={
                            p1
                          }
                        />
                      </div>

                      <div className="space-y-0.5">
                        <p className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          2do Periodo
                        </p>

                        <PeriodCell
                          asig={
                            p2
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}