/**
 * Helper centralizado para determinar el estado visual y semántico de una auditoría o periodo.
 * 
 * Jerarquía de resolución:
 * 1. REALIZADA / REALIZADA_TARDE:
 *    - Si fue completada dentro de plazo ordinario -> 'REALIZADA'
 *    - Si fue completada en periodo de gracia o fuera de tiempo -> 'REALIZADA_TARDE'
 * 2. REABIERTA: Si cuenta con una fecha de reapertura activa mayor a la fecha/hora actual.
 * 3. SIN_AUDITOR: Si requiere explícitamente asignación de auditor.
 * 4. AUN_NO_INICIA: Si el periodo aún no ha iniciado (según infoPeriodo o fechas).
 * 5. NO_REALIZADA: Si el periodo concluyó sin realizarse (marcado como NO_REALIZADA, CERRADA o ya no es realizable sin reapertura).
 * 6. ATRASADA: Si el periodo está en gracia, marcado como vencido o retrasado.
 * 7. PENDIENTE: Estado base/disponible por defecto.
 */

export function esReabiertaActiva(item, ahora = new Date()) {
  if (!item) return false;
  const reabiertaHasta = item.reabiertaHasta || item.infoPeriodo?.reabiertaHasta;
  if (!reabiertaHasta) return false;
  return new Date(reabiertaHasta) > ahora;
}

export function obtenerEstadoVisualAuditoria(item, ahora = new Date()) {
  if (!item) return 'PENDIENTE';

  // a) Completada / Realizada (detectando a tiempo vs tarde)
  const tienePorcentaje = item.porcentaje !== null && item.porcentaje !== undefined && item.porcentaje !== '';
  const envio = item.objetivoAuditoria?.envioResultado || (item.enviosAuditoria && item.enviosAuditoria[0]) || item.envioResultado;
  const tieneEnvio = Boolean(envio || item.envioResultadoId);

  const situacion = item.situacion || item.situacionPeriodo || item.infoPeriodo?.situacion || item.infoPeriodo?.status;
  const chip = item.chip || item.estadoChip || item.cumplimiento || item.estadoCumplimiento;

  const esCompletada = (
    item.completado === true ||
    item.realizada === true ||
    item.estado === 'COMPLETADA' ||
    item.estado === 'REALIZADA' ||
    item.estadoAuditoria === 'REALIZADA' ||
    item.estadoAuditoria === 'COMPLETADA' ||
    item.estadoAuditoria === 'REALIZADA_A_TIEMPO' ||
    item.estadoAuditoria === 'REALIZADA_CON_ATRASO' ||
    situacion === 'REALIZADA_A_TIEMPO' ||
    situacion === 'REALIZADA_CON_ATRASO' ||
    chip === 'A_TIEMPO' ||
    chip === 'TARDE' ||
    tienePorcentaje ||
    tieneEnvio
  );

  if (esCompletada) {
    // Detección de realización fuera de tiempo / tarde
    const esTardeExplicito = (
      chip === 'TARDE' ||
      item.realizadaConAtraso === true ||
      item.realizadaATiempo === false ||
      item.aDestiempo === true ||
      item.fueraDeTiempo === true ||
      item.esTarde === true ||
      item.completadaEnGracia === true ||
      item.estadoAuditoria === 'REALIZADA_CON_ATRASO' ||
      situacion === 'REALIZADA_CON_ATRASO'
    );

    if (esTardeExplicito) {
      return 'REALIZADA_TARDE';
    }

    // Detección por comparación de fechas si están disponibles (fallback universal)
    const fechaFinOrdinaria = item.objetivoAuditoria?.terminaEn || item.terminaEn || item.venceEn;
    const fechaCompletado = item.completadoEn || envio?.verificadoEn || envio?.finalizadoEn || item.finalizadoEn || item.verificadoEn || item.fechaRealizacion;

    if (fechaFinOrdinaria && fechaCompletado) {
      const fin = new Date(fechaFinOrdinaria);
      const completado = new Date(fechaCompletado);
      if (completado > fin) {
        return 'REALIZADA_TARDE';
      }
    }

    return 'REALIZADA';
  }

  // b) No programada
  if (item.programada === false) {
    return 'NO_PROGRAMADA';
  }

  // c) Reapertura activa
  if (esReabiertaActiva(item, ahora)) {
    return 'REABIERTA';
  }

  // d) Cancelada
  if (item.estadoAsignacion === 'CANCELADA' || item.estado === 'CANCELADA') {
    return 'CANCELADA';
  }

  // e) Sin auditor (caso relevante en control administrativo)
  const tieneAuditor = Boolean(item.auditorEfectivo?.nombre || item.auditor?.nombre || item.auditorMensual?.nombre || item.auditorNombre);
  if (item.requiereAuditor || item.estado === 'SIN_AUDITOR' || item.estadoAuditoria === 'SIN_AUDITOR' || (item.programada && !tieneAuditor && item.auditorEfectivo !== undefined)) {
    return 'SIN_AUDITOR';
  }

  // f) Aún no inicia
  if (item.infoPeriodo?.status === 'AUN_NO_INICIA' || item.estado === 'AUN_NO_INICIA') {
    return 'AUN_NO_INICIA';
  }

  const estadoBase = item.estado || item.estadoAuditoria;
  const infoStatus = item.infoPeriodo?.status;

  // g) No realizada (vencida sin realizar, periodo cerrado, o no realizable)
  const esNoRealizada = (
    estadoBase === 'NO_REALIZADA' ||
    infoStatus === 'CERRADA' ||
    item.chip === 'NO_REALIZADA' ||
    item.estadoChip === 'NO_REALIZADA' ||
    item.infoPeriodo?.realizable === false ||
    (item.vencida === true && !esReabiertaActiva(item, ahora))
  );

  if (esNoRealizada) {
    return 'NO_REALIZADA';
  }

  // h) Atrasada
  const esAtrasada = (
    estadoBase === 'ATRASADA' ||
    estadoBase === 'ATRASADA_EN_GRACIA' ||
    infoStatus === 'ATRASADA' ||
    infoStatus === 'VENCIDA' ||
    item.vencida === true
  );

  if (esAtrasada) {
    return 'ATRASADA';
  }

  // i) Disponible (periodo activo por realizar)
  const esDisponible = (
    estadoBase === 'DISPONIBLE' ||
    infoStatus === 'DISPONIBLE' ||
    item.infoPeriodo?.texto === 'Disponible' ||
    item.infoPeriodo?.badgeTexto === 'Disponible' ||
    item.infoPeriodo?.color === 'verde'
  );

  if (esDisponible) {
    return 'DISPONIBLE';
  }

  // j) Fallback
  return estadoBase || 'PENDIENTE';
}
