import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useUrlState, parseMonthParam, parseYearParam } from '@/hooks/use-url-state';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { ImageViewer } from '@/components/ui/image-viewer';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiClient } from '@/lib/api/api-client';
import { formatPercentTrunc } from '@/utils/format';

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

// Colorimetry Helper based on Rating Score (with contrast adjustments for text)
function getColorForRating(value, isText = false) {
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
    return null;
  }
  const val = Number(value);
  if (val >= 90.0) return '#21D329'; // Green (90% to 100%)
  if (val >= 70.0) return isText ? '#bca50b' : '#F0E80F'; // Yellow (darker for text readability)
  if (val >= 50.0) return '#EE9714'; // Orange (50% to 69.9%)
  return '#F01113'; // Red (Less than 50%)
}

// Render formatted score as a colored semaphoric badge pill
function RenderScoreWithDot({ value, className = '' }) {
  const textColor = getColorForRating(value, true);
  const bgColor = getColorForRating(value, false);

  if (!textColor || !bgColor) {
    return <span className={`text-slate-400 font-bold ${className}`}>-</span>;
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded font-black text-sm shrink-0 border transition-all ${className}`}
      style={{
        backgroundColor: `${bgColor}18`, // subtle transparent background
        color: textColor, // matching solid text color
        borderColor: `${bgColor}40`, // matching border
      }}
    >
      {formatPercentTrunc(value)}
    </span>
  );
}

const URL_DEFAULTS_RESULTADOS = {
  tipo: 'TODAS', // TODAS, ADMINISTRATIVA, OPERATIVA
};

export function ResultadosPage() {
  const { user } = useAuth();
  const esAdminOrSuper = user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPER_ADMIN';

  const { anio: anioParam, mes: mesParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ahora = useMemo(() => new Date(), []);
  const anio = parseYearParam(anioParam, ahora.getFullYear());
  const mes = parseMonthParam(mesParam, ahora.getMonth() + 1);

  const { params, setParam } = useUrlState(URL_DEFAULTS_RESULTADOS);
  const tipoArea = params.tipo;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States to keep both lists to extract winners for both categories simultaneously
  const [adminData, setAdminData] = useState(null);
  const [operData, setOperData] = useState(null);

  // Detail Modal State
  const [detalleId, setDetalleId] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleData, setDetalleData] = useState(null);
  const [detalleError, setDetalleError] = useState(null);

  // Lightbox Image Zoom State
  const [zoomImagenUrl, setZoomImagenUrl] = useState(null);

  // Fetch Results for both types in parallel
  const cargarResultados = useCallback(async (currentAnio, currentMes) => {
    setLoading(true);
    setError(null);
    try {
      const [adminRes, operRes] = await Promise.all([
        apiClient.get(`/resultados/areas?anio=${currentAnio}&mes=${currentMes}&tipoArea=ADMINISTRATIVA`),
        apiClient.get(`/resultados/areas?anio=${currentAnio}&mes=${currentMes}&tipoArea=OPERATIVA`),
      ]);
      setAdminData(adminRes.datos || adminRes);
      setOperData(operRes.datos || operRes);
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error al cargar los resultados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarResultados(anio, mes);
  }, [anio, mes, cargarResultados]);

  // Fetch Detailed Audit Envio
  const cargarDetail = async (id) => {
    setDetalleId(id);
    setDetalleLoading(true);
    setDetalleError(null);
    setDetalleData(null);
    try {
      const response = await apiClient.get(`/resultados/envios/${id}`);
      setDetalleData(response.datos || response);
    } catch (err) {
      console.error(err);
      setDetalleError(err?.message || 'Error al cargar el detalle de la auditoría.');
    } finally {
      setDetalleLoading(false);
    }
  };

  // Group Responses by Section
  const agruparPorSeccion = (respuestas) => {
    if (!respuestas) return {};
    const grupos = {};
    respuestas.forEach((resp) => {
      const seccionNombre = resp.seccion?.nombre || 'General';
      if (!grupos[seccionNombre]) {
        grupos[seccionNombre] = [];
      }
      grupos[seccionNombre].push(resp);
    });
    return grupos;
  };

  // Build combined data dynamically
  const combinedAreas = [
    ...(adminData?.areas || []),
    ...(operData?.areas || []),
  ].sort((a, b) => (b.resultado5SMensual ?? -1) - (a.resultado5SMensual ?? -1));

  const scores = combinedAreas
    .filter((a) => a.resultado5SMensual !== null)
    .map((a) => a.resultado5SMensual);

  const combinedAvg = scores.length
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : null;

  const combinedData = {
    areas: combinedAreas,
    resultado5SMensual: combinedAvg,
    periodosProgramados: (adminData?.periodosProgramados || 0) + (operData?.periodosProgramados || 0),
    periodosRealizados: (adminData?.periodosRealizados || 0) + (operData?.periodosRealizados || 0),
  };

  // Select active view data based on filter
  const currentData = tipoArea === 'TODAS'
    ? combinedData
    : (tipoArea === 'ADMINISTRATIVA' ? adminData : operData);

  // Determine Winners
  const obtenerGanador = (dataset) => {
    if (!dataset || !dataset.areas || dataset.areas.length === 0) return null;
    const topArea = dataset.areas[0];
    if (topArea && topArea.resultado5SMensual !== null) {
      return topArea;
    }
    return null;
  };

  const ganadorAdmin = obtenerGanador(adminData);
  const ganadorOper = obtenerGanador(operData);

  // SVG Gauge Calculations
  const radius = 50;
  const circumference = Math.PI * radius;
  const scorePercent = currentData?.resultado5SMensual ?? 0;
  const strokeDashoffset = circumference - (Math.min(scorePercent, 100) / 100) * circumference;
  const gaugeColor = getColorForRating(scorePercent) || '#38bdf8';

  // Render Period cell helper
  const renderPeriodoDetalle = (area, numPeriodo) => {
    const detPeriodos = area.detallePeriodos || area.periodos || [];
    const periodo = detPeriodos.find((p) => p.numeroCorte === numPeriodo);

    if (!periodo) {
      return <span className="text-slate-400 italic text-xs">No prog.</span>;
    }

    const { realizada, fechaRealizacion, porcentaje, situacion, envios = [], envioResultadoId } = periodo;

    let statusLabel = 'Pendiente';
    let badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';

    if (envios.length === 0) {
      // Programmed but has no submissions
      if (situacion === 'ATRASADA_EN_GRACIA') {
        statusLabel = 'En gracia';
        badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';
      } else if (situacion === 'NO_REALIZADA') {
        statusLabel = 'No realizada';
        badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
      } else {
        statusLabel = 'Pendiente';
        badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
      }
    } else {
      // Has submissions
      if (realizada) {
        if (situacion === 'REALIZADA_A_TIEMPO' || !situacion) {
          statusLabel = 'A tiempo';
          badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        } else if (situacion === 'REALIZADA_CON_ATRASO') {
          statusLabel = 'Con atraso';
          badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200 border-dashed';
        }
      } else {
        // Has submissions but none selected as official yet
        statusLabel = 'Pendiente';
        badgeClass = 'bg-slate-100 text-slate-600 border border-slate-200';
      }
    }

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black text-slate-500">P{numPeriodo}</span>
          {esAdminOrSuper && (
            <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded scale-90 origin-left ${badgeClass}`}>
              {statusLabel}
            </span>
          )}
        </div>

        {envios.length > 0 ? (
          <div className="space-y-1">
            {realizada && porcentaje !== null ? (
              <div className="text-sm font-black text-slate-800">
                {formatPercentTrunc(porcentaje)}
              </div>
            ) : (
              <div className="text-xs font-bold text-rose-600 italic">
                Pendiente Oficial
              </div>
            )}
            {fechaRealizacion && (
              <div className="text-[10px] text-slate-500">
                {new Date(fechaRealizacion).toLocaleDateString()}
              </div>
            )}

            {/* List all submissions */}
            {esAdminOrSuper && (
              <div className="space-y-1 pt-1 border-t border-slate-100 mt-1">
                <div className="flex flex-col gap-0.5">
                  {envios.map((env) => {
                    const esOficial = env.id === envioResultadoId;
                    return (
                      <div key={env.id} className="flex flex-col gap-0.5">
                        <Button
                          variant={esOficial ? 'primary' : 'outline'}
                          size="xs"
                          onClick={() => cargarDetail(env.id)}
                          className="w-full text-[10px] py-0.5 px-1.5 font-normal flex justify-between items-center"
                        >
                          <span className="truncate max-w-[80px]">
                            #{env.id} {env.nombreAuditorSnapshot}
                          </span>
                          <span className="font-bold shrink-0 ml-1">
                            {formatPercentTrunc(env.porcentaje)}
                          </span>
                        </Button>
                        {esOficial && (
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5 self-start">
                            <Icon name="check_circle" size="10px" fill className="shrink-0" />
                            Oficial
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {!envioResultadoId && (
                    <span className="text-[9px] text-rose-600 font-bold block mt-0.5">
                      Oficial pendiente
                    </span>
                  )}
                </div>
              </div>
            )}

            {!esAdminOrSuper && (
              <span className="text-[10px] text-slate-500 italic block">Guardado</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Sin auditoría</span>
        )}
      </div>
    );
  };

  return (
    <section className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Monitoreo</p>
          <h1 className="text-3xl font-black text-slate-950">Resultados 5S</h1>
        </div>
      </div>

      {/* Filters Form */}
      <Card className="bg-white/80 backdrop-blur-md shadow-xs border border-slate-200">
        <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tipo de Área */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              Tipo de Área
            </label>
            <select
              value={tipoArea}
              onChange={(e) => setParam('tipo', e.target.value, { resetPage: false })}
              className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-marca-primario/25 transition-all"
            >
              <option value="TODAS">Todas</option>
              <option value="ADMINISTRATIVA">Administrativa</option>
              <option value="OPERATIVA">Operativa</option>
            </select>
          </div>

          {/* Año */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Año</label>
            <select
              value={String(anio)}
              onChange={(e) => navigate(`/resultados/${e.target.value}/${mes}${location.search}`)}
              className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-marca-primario/25 transition-all"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          {/* Mes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">Mes</label>
            <select
              value={String(mes)}
              onChange={(e) => navigate(`/resultados/${anio}/${e.target.value}${location.search}`)}
              className="bg-slate-50 border border-slate-200 rounded-md p-2.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-marca-primario/25 transition-all"
            >
              {MESES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Main KPI Spotlight & Gauge Banner */}
      {currentData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Global Result Card with Gauge */}
          <Card className="lg:col-span-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white border-0 shadow-lg relative overflow-hidden">
            <CardBody className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {`Resultado ${MESES.find((m) => m.value === mes)?.label} ${anio}`}
                </span>
                <h3 className="text-xs font-black text-marca-acento uppercase tracking-widest">
                  {tipoArea}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span
                    className="w-4.5 h-4.5 rounded-full inline-block shrink-0 shadow"
                    style={{ backgroundColor: getColorForRating(currentData.resultado5SMensual) || '#38bdf8' }}
                  />
                  <div className="text-5xl font-black tracking-tight text-white">
                    {formatPercentTrunc(currentData.resultado5SMensual)}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm pt-2">
                  Porcentaje promedio global calculado para todas las áreas activas registradas en esta categoría.
                </p>
              </div>

              {/* Semicircular Gauge with powerbi color */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-32 h-20 flex justify-center items-end">
                  <svg className="w-32 h-20" viewBox="0 0 120 70">
                    <path
                      d="M 10 60 A 50 50 0 0 1 110 60"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 10 60 A 50 50 0 0 1 110 60"
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute bottom-0 text-center">
                    <span className="text-xs font-black text-slate-300">Meta 5S</span>
                  </div>
                </div>
                <div className="mt-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  Cumplimiento global
                </div>
              </div>
            </CardBody>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />
          </Card>

          {/* Monthly Winners spotlight */}
          <Card className="bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <CardHeader className="bg-slate-50 border-b border-slate-100 py-3">
              <CardTitle className="text-xs font-black text-slate-500 flex items-center gap-1.5">
                <Icon name="emoji_events" className="text-amber-500" size="18px" fill />
                Ganadores del Mes
              </CardTitle>
            </CardHeader>
            <CardBody className="p-4 space-y-4 grow flex flex-col justify-center">
              {/* Administrative Winner */}
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Administrativo
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate leading-snug">
                    {ganadorAdmin ? ganadorAdmin.nombre : 'Sin registro'}
                  </p>
                </div>
                {ganadorAdmin ? (
                  <RenderScoreWithDot value={ganadorAdmin.resultado5SMensual} className="text-sm shrink-0" />
                ) : (
                  <span className="text-sm font-black text-slate-400">-</span>
                )}
              </div>

              {/* Operative Winner */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Operativo
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate leading-snug">
                    {ganadorOper ? ganadorOper.nombre : 'Sin registro'}
                  </p>
                </div>
                {ganadorOper ? (
                  <RenderScoreWithDot value={ganadorOper.resultado5SMensual} className="text-sm shrink-0" />
                ) : (
                  <span className="text-sm font-black text-slate-400">-</span>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* KPI Cards & Compact Ranking */}
      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <Card className="bg-white/80">
              <CardBody className="p-4 text-center space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Programados
                </span>
                <span className="text-2xl font-black text-slate-800 block">
                  {currentData.periodosProgramados}
                </span>
              </CardBody>
            </Card>

            <Card className="bg-white/80">
              <CardBody className="p-4 text-center space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Realizados
                </span>
                <span className="text-2xl font-black text-slate-800 block">
                  {currentData.periodosRealizados}
                </span>
              </CardBody>
            </Card>
          </div>

          {/* Compact Ranking */}
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="py-2.5 px-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <CardTitle className="text-xs font-black text-slate-500 flex items-center gap-1">
                <Icon name="list_alt" size="16px" />
                Ranking de Calificaciones
              </CardTitle>
            </CardHeader>
            <CardBody className="p-3 max-h-36 overflow-y-auto space-y-2">
              {currentData.areas?.slice(0, 5).map((area, index) => (
                <div key={area.areaId} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center shrink-0 text-[10px]">
                      {index + 1}
                    </span>
                    <span className="font-bold text-slate-700 truncate leading-none">
                      {area.nombre}
                    </span>
                  </div>
                  <RenderScoreWithDot value={area.resultado5SMensual} className="text-xs shrink-0" />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Main Results Listing */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="48px" />
        </div>
      ) : error ? (
        <Card className="border-rose-200 bg-rose-50/50">
          <CardBody className="text-sm font-semibold text-rose-700">{error}</CardBody>
        </Card>
      ) : currentData?.areas?.length === 0 ? (
        <Card className="bg-slate-50/50">
          <CardBody className="text-sm text-slate-500 italic text-center py-8">
            No se encontraron objetivos de auditoría para los filtros seleccionados.
          </CardBody>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card className="bg-white shadow-xs border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[800px] border-collapse text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-black border-b border-slate-200 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 pl-6">Área</th>
                      <th className="p-4 w-52">Periodo 1</th>
                      <th className="p-4 w-52">Periodo 2</th>
                      <th className="p-4 text-center w-40">Resultado Mensual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentData?.areas?.map((area) => (
                      <tr key={area.areaId} className="hover:bg-slate-50/30 transition-colors">
                        {/* Area details with hierarchy */}
                        <td className="p-4 pl-6">
                          <div className="space-y-1">
                            <h4 className="text-base font-black text-slate-800 leading-tight">
                              {area.nombre}
                            </h4>
                            <div className="text-[10px] font-bold tracking-wider text-slate-400">
                              {area.tipoArea}
                            </div>
                          </div>
                        </td>

                        {/* Period 1 */}
                        <td className="p-4 align-top">
                          {renderPeriodoDetalle(area, 1)}
                        </td>

                        {/* Period 2 */}
                        <td className="p-4 align-top">
                          {renderPeriodoDetalle(area, 2)}
                        </td>

                        {/* Monthly Score - AT THE END */}
                        <td className="p-4 text-center align-middle">
                          <RenderScoreWithDot value={area.resultado5SMensual} className="text-base animate-in fade-in" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-4">
            {currentData?.areas?.map((area) => (
              <Card key={area.areaId} className="bg-white border border-slate-200 shadow-xs">
                <CardHeader className="bg-slate-50/50 py-3 px-4 border-b border-slate-100 flex flex-row justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-800 truncate leading-snug">
                      {area.nombre}
                    </h3>
                    <div className="mt-0.5 text-[9px] font-bold uppercase text-slate-400">
                      {area.tipoArea}
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Periodo 1 details block */}
                    <div className="p-2.5 bg-slate-50/50 rounded border border-slate-100">
                      {renderPeriodoDetalle(area, 1)}
                    </div>
                    {/* Periodo 2 details block */}
                    <div className="p-2.5 bg-slate-50/50 rounded border border-slate-100">
                      {renderPeriodoDetalle(area, 2)}
                    </div>
                  </div>

                  {/* Monthly Score - AT THE END */}
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      Resultado Mensual:
                    </span>
                    <RenderScoreWithDot value={area.resultado5SMensual} className="text-sm" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Audit Detail Modal */}
      <Modal isOpen={detalleId !== null} onClose={() => setDetalleId(null)} className="max-w-4xl">
        <ModalHeader onClose={() => setDetalleId(null)}>
          {detalleData ? (
            <div className="pr-8">
              <h2 className="text-xl font-black text-slate-950 leading-tight">
                {detalleData.area?.nombre || 'Detalle de Auditoría'}
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {MESES.find((m) => m.value === detalleData.ciclo?.mes)?.label} {detalleData.ciclo?.anio} · Periodo {detalleData.ciclo?.numeroCorte}
              </p>
            </div>
          ) : (
            <h2>Cargando Detalle...</h2>
          )}
        </ModalHeader>

        <ModalBody className="max-h-[75vh]">
          {detalleLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="40px" />
            </div>
          ) : detalleError ? (
            <div className="text-sm font-semibold text-rose-600 bg-rose-50 p-4 rounded-md">
              {detalleError}
            </div>
          ) : detalleData ? (
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Auditor
                  </span>
                  <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                    {detalleData.envio?.nombreAuditorSnapshot}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Fecha Real
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {detalleData.envio?.finalizadoEn
                      ? new Date(detalleData.envio.finalizadoEn).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Puntaje
                  </span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {detalleData.envio?.puntajeObtenido} / {detalleData.envio?.puntajePosible}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Cumplimiento
                  </span>
                  <p className="text-sm font-black text-marca-primario mt-0.5">
                    {formatPercentTrunc(detalleData.envio?.porcentaje)}
                  </p>
                </div>
              </div>

              {/* Consistency Validation Warning */}
              {(() => {
                const siCount = detalleData.respuestas?.filter((r) => r.cumple === true).length;
                const matches = siCount === Number(detalleData.envio?.puntajeObtenido);
                if (detalleData.respuestas?.length > 0 && !matches) {
                  return (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-bold">
                      <Icon name="warning" size="18px" fill className="shrink-0" />
                      <span>Inconsistencia histórica detectada</span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Responses List */}
              {detalleData.respuestas?.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-md">
                  <Icon name="info" className="text-slate-400 mb-2" size="32px" />
                  <p className="text-sm text-slate-600 font-semibold">
                    Detalle de respuestas no disponible en el registro histórico.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(agruparPorSeccion(detalleData.respuestas)).map(
                    ([seccionNombre, respuestas]) => (
                      <div key={seccionNombre} className="space-y-3">
                        {/* Section Header */}
                        <h4 className="text-sm font-black uppercase text-slate-900 border-b border-slate-200 pb-1.5 tracking-wider">
                          {seccionNombre}
                        </h4>

                        <div className="space-y-4">
                          {respuestas.map((resp, i) => (
                            <div
                              key={resp.id}
                              className="p-3 bg-white border border-slate-100 rounded-md shadow-2xs flex flex-col md:flex-row justify-between gap-4"
                            >
                              <div className="space-y-1.5 grow">
                                <div className="flex items-start gap-2">
                                  <span className="text-xs font-black text-slate-400 mt-0.5">
                                    {resp.pregunta?.orden}.
                                  </span>
                                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                                    {resp.pregunta?.texto}
                                  </p>
                                </div>

                                {/* Hallazgo */}
                                {!resp.cumple && (
                                  <div className="ml-5 p-2 bg-rose-50 border-l-2 border-rose-400 rounded-r text-xs text-rose-800 font-medium">
                                    <span className="font-bold block uppercase tracking-wider text-[9px] mb-0.5">
                                      Hallazgo
                                    </span>
                                    {resp.hallazgo || 'Hallazgo no registrado en el sistema anterior'}
                                  </div>
                                )}

                                {/* Photographs */}
                                {resp.fotos?.length > 0 && (
                                  <div className="ml-5 flex flex-wrap gap-2 pt-2">
                                    {resp.fotos.map((foto) => (
                                      <div
                                        key={foto.id}
                                        onClick={() => setZoomImagenUrl(foto.url)}
                                        className="relative w-16 h-16 md:w-20 md:h-20 rounded border border-slate-200 overflow-hidden cursor-zoom-in hover:opacity-90 transition-all shrink-0 bg-slate-100"
                                      >
                                        <img
                                          src={foto.url}
                                          alt="Evidencia"
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="shrink-0 flex items-center md:self-start">
                                {resp.cumple ? (
                                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1 uppercase">
                                    <Icon name="check_circle" size="16px" fill className="shrink-0" />
                                    SÍ
                                  </span>
                                ) : (
                                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 flex items-center gap-1 uppercase">
                                    <Icon name="cancel" size="16px" fill className="shrink-0" />
                                    NO
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ) : null}
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={() => setDetalleId(null)}>
            Cerrar
          </Button>
        </ModalFooter>
      </Modal>

      <ImageViewer
        open={Boolean(zoomImagenUrl)}
        src={zoomImagenUrl}
        alt="Evidencia ampliada"
        title="Evidencia"
        onClose={() => setZoomImagenUrl(null)}
      />
    </section>
  );
}
