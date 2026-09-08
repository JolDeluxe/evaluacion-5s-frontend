import { useEntregas } from '../hooks/use-entregas';
import { EntregasEstadoBanner } from '../components/entregas-estado-banner';
import { EntregasResumenCards } from '../components/entregas-resumen-cards';
import { EntregasFiltros } from '../components/entregas-filtros';
import { EntregasTabla } from '../components/entregas-tabla';
import { SimulacionModal } from '../components/simulacion-modal';
import { CorreoPreviewModal } from '../components/correo-preview-modal';
import { MicrosoftConexionModal } from '../components/microsoft-conexion-modal';

export function EntregasPage() {
  const {
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
  } = useEntregas();

  return (
    <section className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
          Sistema · Operación Técnica
        </p>
        <h1 className="text-3xl font-black text-slate-950">Entregas de Notificaciones</h1>
        <p className="mt-1 text-sm text-slate-600">
          Monitoreo técnico de envíos de correo, estado del worker, simulación de destinatarios y reintentos manuales.
        </p>
      </div>

      {/* Banner de Estado Técnico del Sistema */}
      <EntregasEstadoBanner
        estado={estadoSistema}
        onAbrirSimulacion={() => setModalSimulacionAbierto(true)}
        onAbrirConexionMicrosoft={() => setModalMicrosoftAbierto(true)}
        onRecargar={recargarTodo}
        cargando={cargando}
      />

      {/* Tarjetas KPI de Resumen */}
      <EntregasResumenCards resumen={resumen} />

      {/* Barra de Filtros */}
      <EntregasFiltros
        filtros={filtros}
        onCambiarFiltros={cambiarFiltros}
        cargando={cargandoTabla}
      />

      {/* Tabla de Entregas */}
      <EntregasTabla
        entregas={entregas}
        paginacion={paginacion}
        onCambiarPagina={cambiarPagina}
        onReintentar={reintentar}
        onReenviar={reenviar}
        onVerPreview={abrirPreviewEntrega}
        accionEnProgreso={accionEnProgreso}
        cargando={cargandoTabla && entregas.length === 0}
      />

      {/* Modal de Simulación Dry-Run */}
      <SimulacionModal
        isOpen={modalSimulacionAbierto}
        onClose={() => setModalSimulacionAbierto(false)}
        onEjecutarSimulacion={ejecutarSimulacion}
        onVerPreview={abrirPreviewSimulacion}
        resultado={resultadoSimulacion}
        cargando={cargandoSimulacion}
      />

      {/* Modal de Vista Previa de Correo y Envío de Prueba */}
      <CorreoPreviewModal
        isOpen={modalPreviewAbierto}
        onClose={() => setModalPreviewAbierto(false)}
        preview={previewData}
        cargando={cargandoPreview}
        onEnviarPrueba={previewParams ? enviarPrueba : undefined}
        enviandoPrueba={enviandoPrueba}
        emailTestEnabled={Boolean(estadoSistema?.emailTestEnabled)}
      />

      {/* Modal de Conexión Microsoft Graph (Outlook.com) */}
      <MicrosoftConexionModal
        isOpen={modalMicrosoftAbierto}
        onClose={() => setModalMicrosoftAbierto(false)}
        estadoMicrosoft={estadoSistema?.microsoft}
        onIniciarConexion={iniciarConexionMicrosoft}
        onDesconectar={desconectarMicrosoft}
        onRecargar={recargarTodo}
      />
    </section>
  );
}