import { useEntregas } from '../hooks/use-entregas';
import { EntregasEstadoBanner } from '../components/entregas-estado-banner';
import { EntregasResumenCards } from '../components/entregas-resumen-cards';
import { EntregasFiltros } from '../components/entregas-filtros';
import { EntregasTabla } from '../components/entregas-tabla';
import { SimulacionModal } from '../components/simulacion-modal';
import { CorreoPreviewModal } from '../components/correo-preview-modal';
import { MicrosoftConexionModal } from '../components/microsoft-conexion-modal';
import { ControlOperativoModal } from '../components/control-operativo-modal';
import { CancelarEntregaModal } from '../components/cancelar-entrega-modal';
import { EntregaDetalleModal } from '../components/entrega-detalle-modal';
import { ReenviarEntregaModal } from '../components/reenviar-entrega-modal';

export function EntregasPage() {
  const {
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
    // Prueba Canario de Cola
    probandoCola,
    probarCola,
    // Reenvío de Entrega
    modalReenviarAbierto,
    entregaAReenviar,
    cargandoDetalleReenvio,
    reenviandoEntrega,
    confirmarReenviarEntrega,
    setModalReenviarAbierto,
    // Filtros y Acciones
    cambiarFiltros,
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
          Monitoreo técnico de envíos de correo, control operativo seguro, cola de entregas y trazabilidad.
        </p>
      </div>

      {/* Banner de Estado Técnico y Control Operativo */}
      <EntregasEstadoBanner
        estado={estadoSistema}
        controlOperativo={controlOperativo}
        onAbrirControlOperativo={abrirModalControlOperativo}
        onAbrirSimulacion={() => setModalSimulacionAbierto(true)}
        onAbrirConexionMicrosoft={() => setModalMicrosoftAbierto(true)}
        onProbarCola={probarCola}
        probandoCola={probandoCola}
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

      {/* Tabla de Entregas con Selección Múltiple y Acciones */}
      <EntregasTabla
        entregas={entregas}
        total={total}
        hayMas={hayMas}
        cargandoMas={cargandoMas}
        onCargarMas={cargarMas}
        onReintentar={reintentar}
        onReenviar={reenviar}
        onVerPreview={abrirPreviewEntrega}
        onVerDetalle={abrirDetalleEntrega}
        onCancelar={abrirModalCancelar}
        onAbrirCancelarMasivo={abrirModalCancelarMasivo}
        seleccionados={seleccionados}
        onToggleSeleccion={toggleSeleccion}
        onSeleccionarTodos={seleccionarTodosVisibles}
        onLimpiarSeleccion={limpiarSeleccion}
        accionEnProgreso={accionEnProgreso}
        cargando={cargandoTabla && entregas.length === 0}
      />

      {/* Modal de Pausa y Reanudación Operativa (Fail-Safe) */}
      <ControlOperativoModal
        isOpen={modalControlOperativoAbierto}
        onClose={() => setModalControlOperativoAbierto(false)}
        modo={modoControlOperativo}
        controlOperativo={controlOperativo}
        onConfirmar={confirmarControlOperativo}
        cargando={guardandoControlOperativo}
      />

      {/* Modal de Cancelación Individual */}
      <CancelarEntregaModal
        isOpen={modalCancelarAbierto}
        onClose={() => {
          setModalCancelarAbierto(false);
          setEntregaACancelar(null);
        }}
        entrega={entregaACancelar}
        onConfirmar={confirmarCancelarEntrega}
        cargando={cancelandoEntrega}
      />

      {/* Modal de Cancelación Masiva */}
      <CancelarEntregaModal
        isOpen={modalCancelarMasivoAbierto}
        onClose={() => setModalCancelarMasivoAbierto(false)}
        ids={Array.from(seleccionados)}
        onConfirmar={confirmarCancelarMasivo}
        cargando={cancelandoMasivo}
      />

      {/* Modal de Detalle Técnico de Entrega */}
      <EntregaDetalleModal
        isOpen={modalDetalleAbierto}
        onClose={() => {
          setModalDetalleAbierto(false);
          setEntregaDetalle(null);
        }}
        entrega={entregaDetalle}
        cargando={cargandoDetalle}
        onCancelar={(e) => abrirModalCancelar(e)}
        onReintentar={(id) => reintentar(id)}
        onReenviar={(e) => reenviar(e)}
        onVerCorreo={(id) => abrirPreviewEntrega(id)}
      />

      {/* Modal de Reenvío de Correo (Usa destinatario actual del usuario) */}
      <ReenviarEntregaModal
        isOpen={modalReenviarAbierto}
        onClose={() => setModalReenviarAbierto(false)}
        entrega={entregaAReenviar}
        onConfirmar={confirmarReenviarEntrega}
        cargando={reenviandoEntrega}
        cargandoDetalle={cargandoDetalleReenvio}
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