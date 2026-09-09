import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { entregasApi } from '../api/entregas-api';
import { notify } from '@/components/notification/adaptive-notify';

const LIMITE_POR_LOTE = 100;

export function useEntregas() {
  const [searchParams, setSearchParams] = useSearchParams();

  // La URL es la única fuente de verdad para los filtros
  const canal = searchParams.get('canal') || '';
  const estado = searchParams.get('estado') || '';
  const filtros = useMemo(() => ({ canal, estado }), [canal, estado]);

  const [resumen, setResumen] = useState(null);
  const [estadoSistema, setEstadoSistema] = useState(null);
  const [controlOperativo, setControlOperativo] = useState(null);

  // Estado de entregas acumuladas
  const [entregas, setEntregas] = useState([]);
  const [total, setTotal] = useState(0);
  const [siguienteCursor, setSiguienteCursor] = useState(null);
  const [hayMas, setHayMas] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [cargandoTabla, setCargandoTabla] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [accionEnProgreso, setAccionEnProgreso] = useState(null);

  // Selección múltiple (opera únicamente sobre registros actualmente cargados y visibles)
  const [seleccionados, setSeleccionados] = useState(new Set());

  // Control Operativo Modal
  const [modalControlOperativoAbierto, setModalControlOperativoAbierto] = useState(false);
  const [modoControlOperativo, setModoControlOperativo] = useState('pausar'); // 'pausar' | 'reanudar'
  const [guardandoControlOperativo, setGuardandoControlOperativo] = useState(false);

  // Modal Cancelar Individual
  const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false);
  const [entregaACancelar, setEntregaACancelar] = useState(null);
  const [cancelandoEntrega, setCancelandoEntrega] = useState(false);

  // Modal Cancelar Masivo
  const [modalCancelarMasivoAbierto, setModalCancelarMasivoAbierto] = useState(false);
  const [cancelandoMasivo, setCancelandoMasivo] = useState(false);

  // Modal Detalle
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [entregaDetalle, setEntregaDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Modal Reenviar
  const [modalReenviarAbierto, setModalReenviarAbierto] = useState(false);
  const [entregaAReenviar, setEntregaAReenviar] = useState(null);
  const [cargandoDetalleReenvio, setCargandoDetalleReenvio] = useState(false);
  const [reenviandoEntrega, setReenviandoEntrega] = useState(false);

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

  // Prueba Canario de Cola y Worker
  const [probandoCola, setProbandoCola] = useState(false);

  const cargarResumenYEstado = useCallback(async () => {
    try {
      const [resumenData, estadoData, controlData] = await Promise.all([
        entregasApi.getResumen(),
        entregasApi.getEstado(),
        entregasApi.getControlOperativo(),
      ]);
      setResumen(resumenData?.resumen ?? null);
      setEstadoSistema(estadoData?.estado ?? null);
      setControlOperativo(controlData?.controlOperativo ?? null);
    } catch (err) {
      notify.error(err?.message || 'Error al cargar estado del sistema');
    }
  }, []);

  const cargarPrimerLote = useCallback(async (canalFiltro, estadoFiltro) => {
    setCargandoTabla(true);
    setSeleccionados(new Set());
    try {
      const query = {
        limite: LIMITE_POR_LOTE,
        ...(canalFiltro ? { canal: canalFiltro } : {}),
        ...(estadoFiltro ? { estado: estadoFiltro } : {}),
      };

      const res = await entregasApi.listar(query);
      const items = res?.datos ?? [];
      const meta = res?.meta || res?.paginacion || {};
      const totalRegistros = typeof meta.total === 'number' ? meta.total : items.length;
      const sigCursor = meta.siguienteCursor ?? null;
      const mas = Boolean(meta.hayMas && sigCursor);

      setEntregas(items);
      setTotal(totalRegistros);
      setSiguienteCursor(sigCursor);
      setHayMas(mas);
    } catch (err) {
      notify.error(err?.message || 'Error al cargar entregas');
    } finally {
      setCargandoTabla(false);
    }
  }, []);

  const cargarMas = useCallback(async () => {
    if (!siguienteCursor || cargandoMas) return;
    setCargandoMas(true);
    try {
      const query = {
        limite: LIMITE_POR_LOTE,
        cursor: siguienteCursor,
        ...(canal ? { canal } : {}),
        ...(estado ? { estado } : {}),
      };

      const res = await entregasApi.listar(query);
      const nuevosItems = res?.datos ?? [];
      const meta = res?.meta || res?.paginacion || {};
      const sigCursor = meta.siguienteCursor ?? null;
      const mas = Boolean(meta.hayMas && sigCursor);

      setEntregas((prev) => {
        const idsExistentes = new Set(prev.map((e) => e.id));
        const filtrados = nuevosItems.filter((e) => !idsExistentes.has(e.id));
        return [...prev, ...filtrados];
      });

      if (typeof meta.total === 'number') {
        setTotal(meta.total);
      }
      setSiguienteCursor(sigCursor);
      setHayMas(mas);
    } catch (err) {
      notify.error(err?.message || 'Error al cargar más entregas');
    } finally {
      setCargandoMas(false);
    }
  }, [siguienteCursor, cargandoMas, canal, estado]);

  // Recarga completa conservando filtros
  const recargarTodo = useCallback(async () => {
    setCargando(true);
    await Promise.all([
      cargarResumenYEstado(),
      cargarPrimerLote(canal, estado),
    ]);
    setCargando(false);
  }, [cargarResumenYEstado, cargarPrimerLote, canal, estado]);

  // Carga inicial de resúmenes de KPIs globales
  useEffect(() => {
    const inicializar = async () => {
      setCargando(true);
      await cargarResumenYEstado();
      setCargando(false);
    };
    inicializar();
  }, [cargarResumenYEstado]);

  // Cuando cambian los filtros en la URL: limpiar acumulado y cargar primeros 100
  useEffect(() => {
    cargarPrimerLote(canal, estado);
  }, [canal, estado, cargarPrimerLote]);

  // Modificar filtros en la URL (elimina el query param si es vacío o TODOS)
  const cambiarFiltros = useCallback((nuevosFiltros) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [clave, valor] of Object.entries(nuevosFiltros)) {
      if (valor && valor !== 'TODOS') {
        nextParams.set(clave, valor);
      } else {
        nextParams.delete(clave);
      }
    }
    setSearchParams(nextParams);
  }, [searchParams, setSearchParams]);

  // Selección múltiple
  const toggleSeleccion = (id) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const seleccionarTodosVisibles = (ids) => {
    setSeleccionados((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...ids]);
    });
  };

  const limpiarSeleccion = () => setSeleccionados(new Set());

  // Control Operativo
  const abrirModalControlOperativo = (modo) => {
    setModoControlOperativo(modo);
    setModalControlOperativoAbierto(true);
  };

  const confirmarControlOperativo = async (motivo) => {
    setGuardandoControlOperativo(true);
    try {
      if (modoControlOperativo === 'pausar') {
        const res = await entregasApi.pausarControlOperativo({ motivo });
        notify.success(res?.mensaje || 'Envíos automáticos pausados');
      } else {
        const res = await entregasApi.reanudarControlOperativo({ motivo });
        notify.success(res?.mensaje || 'Envíos automáticos reanudados');
      }
      setModalControlOperativoAbierto(false);
      await recargarTodo();
    } catch (err) {
      notify.error(err?.message || 'Error al cambiar estado de envíos');
    } finally {
      setGuardandoControlOperativo(false);
    }
  };

  // Cancelar individual
  const abrirModalCancelar = (entrega) => {
    setEntregaACancelar(entrega);
    setModalCancelarAbierto(true);
  };

  const confirmarCancelarEntrega = async (motivo) => {
    if (!entregaACancelar) return;
    setCancelandoEntrega(true);
    try {
      await entregasApi.cancelarEntrega(entregaACancelar.id, { motivo });
      notify.success(`Entrega #${entregaACancelar.id} cancelada correctamente`);
      setModalCancelarAbierto(false);
      // Actualizar in-place en la lista acumulada para no perder la vista
      setEntregas((prev) =>
        prev.map((e) =>
          e.id === entregaACancelar.id
            ? { ...e, estado: 'CANCELADA', ultimoError: motivo || 'Cancelada manualmente por SUPER_ADMIN' }
            : e
        )
      );
      setEntregaACancelar(null);
      cargarResumenYEstado();
    } catch (err) {
      notify.error(err?.message || 'Error al cancelar la entrega');
    } finally {
      setCancelandoEntrega(false);
    }
  };

  // Cancelar masivo
  const abrirModalCancelarMasivo = () => {
    setModalCancelarMasivoAbierto(true);
  };

  const confirmarCancelarMasivo = async (motivo) => {
    const ids = Array.from(seleccionados);
    if (ids.length === 0) return;
    setCancelandoMasivo(true);
    try {
      const res = await entregasApi.cancelarEntregasMasivo({ ids, motivo });
      notify.success(res?.mensaje || `${res.canceladas} entregas canceladas`);
      setModalCancelarMasivoAbierto(false);
      const idsSet = new Set(ids);
      // Actualizar in-place en la lista acumulada
      setEntregas((prev) =>
        prev.map((e) =>
          idsSet.has(e.id)
            ? { ...e, estado: 'CANCELADA', ultimoError: motivo || 'Cancelada manualmente por SUPER_ADMIN' }
            : e
        )
      );
      limpiarSeleccion();
      cargarResumenYEstado();
    } catch (err) {
      notify.error(err?.message || 'Error al cancelar entregas en lote');
    } finally {
      setCancelandoMasivo(false);
    }
  };

  // Detalle de entrega
  const abrirDetalleEntrega = async (id) => {
    setModalDetalleAbierto(true);
    setCargandoDetalle(true);
    setEntregaDetalle(null);
    try {
      const res = await entregasApi.getDetalleEntrega(id);
      setEntregaDetalle(res?.entrega ?? null);
    } catch (err) {
      notify.error(err?.message || 'Error al obtener detalle de entrega');
      setModalDetalleAbierto(false);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const reintentar = async (id) => {
    setAccionEnProgreso(id);
    try {
      await entregasApi.reintentar(id);
      notify.success('Reintento de entrega programado con éxito');
      setEntregas((prev) =>
        prev.map((e) => (e.id === id ? { ...e, estado: 'PENDIENTE' } : e))
      );
      cargarResumenYEstado();
    } catch (err) {
      notify.error(err?.message || 'No se pudo programar el reintento');
    } finally {
      setAccionEnProgreso(null);
    }
  };

  const abrirModalReenviar = async (entregaOId) => {
    let entregaBase = null;
    if (typeof entregaOId === 'object' && entregaOId !== null) {
      entregaBase = entregaOId;
    } else {
      entregaBase = entregas.find((e) => e.id === entregaOId) || { id: entregaOId };
    }

    setEntregaAReenviar(entregaBase);
    setModalReenviarAbierto(true);
    setCargandoDetalleReenvio(true);

    try {
      const res = await entregasApi.getDetalleEntrega(entregaBase.id);
      if (res?.entrega) {
        setEntregaAReenviar(res.entrega);
      }
    } catch {
      // Si falla la consulta fresca, conservamos la entrega ya en memoria
    } finally {
      setCargandoDetalleReenvio(false);
    }
  };

  const confirmarReenviarEntrega = async () => {
    if (!entregaAReenviar) return;
    setReenviandoEntrega(true);
    try {
      const res = await entregasApi.reenviar(entregaAReenviar.id);
      notify.success(res?.mensaje || 'Reenvío manual de correo programado con éxito');
      setModalReenviarAbierto(false);
      setEntregaAReenviar(null);
      await Promise.all([cargarResumenYEstado(), cargarPrimerLote(canal, estado)]);
    } catch (err) {
      notify.error(err?.message || 'No se pudo programar el reenvío');
    } finally {
      setReenviandoEntrega(false);
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

  const ejecutarPruebaCola = async () => {
    setProbandoCola(true);
    try {
      const res = await entregasApi.probarCola();
      notify.success(res?.mensaje || 'Entrega canario creada en la cola con éxito');
      await Promise.all([
        cargarResumenYEstado(),
        cargarPrimerLote(canal, estado),
      ]);
    } catch (err) {
      notify.error(err?.message || 'Error al generar entrega de prueba en la cola');
    } finally {
      setProbandoCola(false);
    }
  };

  return {
    resumen,
    estadoSistema,
    controlOperativo,
    entregas,
    total,
    hayMas,
    cargandoMas,
    cargarMas,
    filtros,
    cargando,
    cargandoTabla,
    accionEnProgreso,
    // Selección múltiple
    seleccionados,
    toggleSeleccion,
    seleccionarTodosVisibles,
    limpiarSeleccion,
    // Control Operativo
    modalControlOperativoAbierto,
    modoControlOperativo,
    guardandoControlOperativo,
    abrirModalControlOperativo,
    confirmarControlOperativo,
    setModalControlOperativoAbierto,
    // Cancelación Individual
    modalCancelarAbierto,
    entregaACancelar,
    cancelandoEntrega,
    abrirModalCancelar,
    confirmarCancelarEntrega,
    setModalCancelarAbierto,
    // Cancelación Masiva
    modalCancelarMasivoAbierto,
    cancelandoMasivo,
    abrirModalCancelarMasivo,
    confirmarCancelarMasivo,
    setModalCancelarMasivoAbierto,
    // Detalle de Entrega
    modalDetalleAbierto,
    entregaDetalle,
    cargandoDetalle,
    abrirDetalleEntrega,
    setModalDetalleAbierto,
    // Reenvío de Entrega
    modalReenviarAbierto,
    entregaAReenviar,
    cargandoDetalleReenvio,
    reenviandoEntrega,
    abrirModalReenviar,
    confirmarReenviarEntrega,
    setModalReenviarAbierto,
    reenviar: abrirModalReenviar,
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
    // Prueba Canario de Cola
    probandoCola,
    probarCola: ejecutarPruebaCola,
    // Filtros y Recarga
    cambiarFiltros,
    recargarTodo,
  };
}