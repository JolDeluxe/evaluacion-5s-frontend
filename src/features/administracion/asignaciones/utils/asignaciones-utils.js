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
  return periodo.auditorEfectivo?.nombre ?? fallback ?? 'Sin auditor';
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
    periodos: {
      p1: {
        usaAuditorMensual: form.p1UsaMensual,
        auditorId: form.p1UsaMensual ? null : Number(form.p1AuditorId),
        motivo: form.p1Motivo || null,
      },
      p2: {
        usaAuditorMensual: form.p2UsaMensual,
        auditorId: form.p2UsaMensual ? null : Number(form.p2AuditorId),
        motivo: form.p2Motivo || null,
      },
    },
  };
}

export function getAutoasignacionMensaje(result) {
  return `${result.autoasignacion.asignadas} áreas asignadas. ${result.autoasignacion.sinCandidato} sin candidato.`;
}
