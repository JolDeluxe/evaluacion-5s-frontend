export const MESES = [
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

export const ESTADOS_ASIGNACION = [
  { value: '', label: 'Todos los estados' },
  { value: 'ASIGNADO', label: 'Asignados' },
  { value: 'SIN_AUDITOR', label: 'Sin auditor' },
];

export const URL_DEFAULTS_ASIGNACIONES = {
  q: '',
  estado: '',
  auditor: '',
};

export function periodoTexto(periodo, fallback) {
  if (!periodo?.programada) return 'No programada';

  const ahora = new Date();
  if (periodo.reabiertaHasta && new Date(periodo.reabiertaHasta) > ahora) {
    const fecha = new Date(periodo.reabiertaHasta).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
    return `Reabierta (${fecha})`;
  }

  if (periodo.realizada) return 'Realizada';
  if (periodo.vencida || periodo.estadoAuditoria === 'NO_REALIZADA') return 'Vencida';
  if (periodo.estadoAuditoria === 'ATRASADA_EN_GRACIA') return 'Atrasada';
  if (periodo.estadoAsignacion === 'CANCELADA') return 'Cancelada';
  return periodo.auditorEfectivo?.nombre ? 'Pendiente' : (fallback ? 'Pendiente' : 'Sin auditor');
}

export function periodoDetalleTexto(periodo, auditorMensual) {
  if (!periodo?.programada || !periodo.auditorEfectivo) return '';
  if (!auditorMensual) return `Auditor: ${periodo.auditorEfectivo.nombre}`;
  if (periodo.auditorEfectivo.id === auditorMensual.id) return '';
  return `Auditor anterior: ${periodo.auditorEfectivo.nombre}`;
}

export function getPeriodoAnterior(anio, mes) {
  return mes === 1 ? { anio: anio - 1, mes: 12 } : { anio, mes: mes - 1 };
}

export function getPeriodoSiguiente(anio, mes) {
  return mes === 12 ? { anio: anio + 1, mes: 1 } : { anio, mes: mes + 1 };
}

export function buildAsignacionesMensualQuery(anio, mes, params) {
  return {
    anio,
    mes,
    busqueda: params.q,
    estado: params.estado,
    auditorId: params.auditor,
  };
}

export function buildGuardarAsignacionMensualPayload({ anio, mes, form }) {
  return {
    anio,
    mes,
    auditorMensualId: Number(form.auditorMensualId),
  };
}
