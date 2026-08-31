import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { parseMonthParam, parseYearParam, useUrlState } from '@/hooks/use-url-state';
import { asignacionesApi } from '@/features/administracion/asignaciones/api/asignaciones-api';
import {
  buildAsignacionesMensualQuery,
  getAutoasignacionMensaje,
  URL_DEFAULTS_ASIGNACIONES,
} from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function useAsignaciones() {
  const { anio: anioParam, mes: mesParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ahora = useMemo(() => new Date(), []);
  const anio = parseYearParam(anioParam, ahora.getFullYear());
  const mes = parseMonthParam(mesParam, ahora.getMonth() + 1);

  const { params, setParam, setSearch } = useUrlState(URL_DEFAULTS_ASIGNACIONES);
  const currentParams = useMemo(() => ({
    q: params.q,
    estado: params.estado,
    auditor: params.auditor,
  }), [params.auditor, params.estado, params.q]);

  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [editing, setEditing] = useState(null);
  const [autoLoading, setAutoLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const debounceRef = useRef(null);

  const cargar = useCallback(async (currentAnio, currentMes, currentParams) => {
    setState((actual) => ({ ...actual, status: 'loading', error: null }));

    try {
      const queryParams = buildAsignacionesMensualQuery(currentAnio, currentMes, currentParams);
      const data = await asignacionesApi.mensual(queryParams);
      setState({ status: 'ready', data, error: null });
    } catch (error) {
      setState({
        status: 'error',
        data: null,
        error: error?.message || 'No se pudieron cargar las asignaciones.',
      });
    }
  }, []);

  const refrescar = useCallback(() => {
    return cargar(anio, mes, currentParams);
  }, [anio, cargar, currentParams, mes]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      cargar(anio, mes, currentParams);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [anio, cargar, currentParams, mes]);

  const handlePeriodo = useCallback(({ anio: nuevoAnio, mes: nuevoMes }) => {
    navigate(`/admin/asignaciones/${nuevoAnio}/${nuevoMes}${location.search}`);
  }, [location.search, navigate]);

  const autoasignar = useCallback(async () => {
    setAutoLoading(true);
    setMensaje('');

    try {
      const result = await asignacionesApi.autoasignar({ anio, mes });
      setMensaje(getAutoasignacionMensaje(result));
      setState({ status: 'ready', data: result.vista, error: null });
    } catch (error) {
      setMensaje(error?.message || 'No se pudo autoasignar.');
    } finally {
      setAutoLoading(false);
    }
  }, [anio, mes]);

  const guardarAsignacionMensual = useCallback((areaId, payload) => {
    return asignacionesApi.guardarMensual(areaId, payload);
  }, []);

  const reabrirAsignacion = useCallback((asignacionId, payload) => {
    return asignacionesApi.reabrir(asignacionId, payload);
  }, []);

  const cerrarEdicion = useCallback(() => {
    setEditing(null);
  }, []);

  const handleSaved = useCallback(() => {
    setEditing(null);
    refrescar();
  }, [refrescar]);

  return {
    anio,
    mes,
    params: currentParams,
    setParam,
    setSearch,
    state,
    data: state.data,
    editing,
    setEditing,
    autoLoading,
    mensaje,
    handlePeriodo,
    autoasignar,
    guardarAsignacionMensual,
    reabrirAsignacion,
    cerrarEdicion,
    handleSaved,
  };
}
