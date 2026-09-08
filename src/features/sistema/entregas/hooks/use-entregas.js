import { useCallback, useEffect, useState } from 'react';
import { entregasApi } from '../api/entregas-api';
import { notify } from '@/components/notification/adaptive-notify';

export function useEntregas() {
  const [resumen, setResumen] = useState(null);
  const [estadoSistema, setEstadoSistema] = useState(null);
  const [entregas, setEntregas] = useState([]);
  const [paginacion, setPaginacion] = useState({ pagina: 1, limite: 15, total: 0 });
  const [filtros, setFiltros] = useState({ canal: 'CORREO', estado: '', pagina: 1, limite: 15 });

  const [cargando, setCargando] = useState(true);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [accionEnProgreso, setAccionEnProgreso] = useState(null);

  // Simulación
  const [modalSimulacionAbierto, setModalSimulacionAbierto] = useState(false);
  const [cargandoSimulacion, setCargandoSimulacion] = useState(false);
  const [resultadoSimulacion, setResultadoSimulacion] = useState(null);

  // Vista Previa y Envío de Prueba
  const [modalPreviewAbierto, setModalPreviewAbierto] = useState(false);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewParams, setPreviewParams] = useState(null);
  const [enviandoPrueba, setEnviandoPrueba] = useState(false);

  // Conexión Microsoft Outlook
  const [modalMicrosoftAbierto, setModalMicrosoftAbierto] = useState(false);

  const cargarResumenYEstado = useCallback(async () => {
    try {
      const [resumenData, estadoData] = await Promise.all([
        entregasApi.getResumen(),
        entregasApi.getEstado(),
      ]);
      setResumen(resumenData?.resumen ?? null);
      setEstadoSistema(estadoData?.estado ?? null);
    } catch (err) {
      notify.error(err?.message || 'Error al cargar resumen del sistema');
    }
  }, []);

  const cargarEntregas = useCallback(async (filtrosActuales) => {
    setCargandoTabla(true);
    try {
      const query = {
        pagina: filtrosActuales.pagina,
        limite: filtrosActuales.limite,
        ...(filtrosActuales.canal ? { canal: filtrosActuales.canal } : {}),
        ...(filtrosActuales.estado ? { estado: filtrosActuales.estado } : {}),
      };

      const res = await entregasApi.listar(query);
      setEntregas(res?.datos ?? []);
      if (res?.paginacion) {
        setPaginacion(res.paginacion);
      }
    } catch (err) {
      notify.error(err?.message || 'Error al cargar entregas');
    } finally {
      setCargandoTabla(false);
    }
  }, []);

  const recargarTodo = useCallback(async () => {
    setCargando(true);
    await Promise.all([
      cargarResumenYEstado(),
      cargarEntregas(filtros),
    ]);
    setCargando(false);
  }, [cargarResumenYEstado, cargarEntregas, filtros]);

  useEffect(() => {
    recargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarFiltros = (nuevosFiltros) => {
    const combinados = { ...filtros, ...nuevosFiltros, pagina: 1 };
    setFiltros(combinados);
    cargarEntregas(combinados);
  };

  const cambiarPagina = (nuevaPagina) => {
    const combinados = { ...filtros, pagina: nuevaPagina };
    setFiltros(combinados);
    cargarEntregas(combinados);
  };

  const reintentar = async (id) => {
    setAccionEnProgreso(id);
    try {
      await entregasApi.reintentar(id);
      notify.success('Reintento de entrega programado con éxito');
      await Promise.all([cargarResumenYEstado(), cargarEntregas(filtros)]);
    } catch (err) {
      notify.error(err?.message || 'No se pudo programar el reintento');
    } finally {
      setAccionEnProgreso(null);
    }
  };

  const reenviar = async (id) => {
    setAccionEnProgreso(id);
    try {
      await entregasApi.reenviar(id);
      notify.success('Reenvío manual de correo programado con éxito');
      await Promise.all([cargarResumenYEstado(), cargarEntregas(filtros)]);
    } catch (err) {
      notify.error(err?.message || 'No se pudo programar el reenvío');
    } finally {
      setAccionEnProgreso(null);
    }
  };

  const ejecutarSimulacion = async ({ tipo, anio, mes }) => {
    setCargandoSimulacion(true);
    try {
      const res = await entregasApi.simular({ tipo, anio, mes });
      setResultadoSimulacion(res?.simulacion ?? null);
    } catch (err) {
      notify.error(err?.message || 'Error al ejecutar simulación');
    } finally {
      setCargandoSimulacion(false);
    }
  };

  const abrirPreviewEntrega = async (entregaId) => {
    setCargandoPreview(true);
    setPreviewData(null);
    setPreviewParams(null);
    setModalPreviewAbierto(true);
    try {
      const res = await entregasApi.getPreview({ entregaId });
      setPreviewData(res?.preview ?? null);
    } catch (err) {
      notify.error(err?.message || 'Error al obtener vista previa');
    } finally {
      setCargandoPreview(false);
    }
  };

  const abrirPreviewSimulacion = async ({ tipo, anio, mes, usuarioId }) => {
    setCargandoPreview(true);
    setPreviewData(null);
    setPreviewParams({ tipo, anio, mes, usuarioId });
    setModalPreviewAbierto(true);
    try {
      const res = await entregasApi.getPreview({ tipo, anio, mes, usuarioId });
      setPreviewData(res?.preview ?? null);
    } catch (err) {
      notify.error(err?.message || 'Error al obtener vista previa');
    } finally {
      setCargandoPreview(false);
    }
  };

  const enviarPrueba = async () => {
    if (!previewParams) {
      notify.warning('Solo se pueden enviar pruebas desde la vista previa de una simulación.');
      return;
    }
    setEnviandoPrueba(true);
    try {
      const res = await entregasApi.enviarPrueba(previewParams);
      notify.success(res?.mensaje || 'Correo de prueba enviado con éxito');
    } catch (err) {
      notify.error(err?.message || 'Error al enviar correo de prueba');
    } finally {
      setEnviandoPrueba(false);
    }
  };

  const iniciarConexionMicrosoft = async () => {
    return entregasApi.iniciarMicrosoftConexion();
  };

  const desconectarMicrosoft = async () => {
    return entregasApi.desconectarMicrosoft();
  };

  return {
    resumen,
    estadoSistema,
    entregas,
    paginacion,
    filtros,
    cargando,
    cargandoTabla,
    accionEnProgreso,
    // Simulación
    modalSimulacionAbierto,
    cargandoSimulacion,
    resultadoSimulacion,
    setModalSimulacionAbierto,
    setResultadoSimulacion,
    ejecutarSimulacion,
    // Preview y Envío de Prueba
    modalPreviewAbierto,
    cargandoPreview,
    previewData,
    previewParams,
    enviandoPrueba,
    setModalPreviewAbierto,
    abrirPreviewEntrega,
    abrirPreviewSimulacion,
    enviarPrueba,
    // Conexión Microsoft
    modalMicrosoftAbierto,
    setModalMicrosoftAbierto,
    iniciarConexionMicrosoft,
    desconectarMicrosoft,
    // Tabla y Filtros
    cambiarFiltros,
    cambiarPagina,
    reintentar,
    reenviar,
    recargarTodo,
  };
}