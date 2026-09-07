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
    return 'Reabierta';
  }

  if (periodo.realizada) return 'Realizada';
  if (periodo.vencida || periodo.estadoAuditoria === 'NO_REALIZADA') return 'Vencida';
  if (periodo.estadoAuditoria === 'ATRASADA_EN_GRACIA') return 'Atrasada';
  if (periodo.estadoAsignacion === 'CANCELADA') return 'Cancelada';
  return periodo.auditorEfectivo?.nombre ? 'Pendiente' : (fallback ? 'Pendiente' : 'Sin auditor');
}

export function getPeriodoStatusConfig(periodo, auditorMensualNombre) {
  if (!periodo?.programada) {
    return {
      texto: 'No programada',
      icon: '—',
      badgeClass: 'border-slate-200 bg-slate-50 text-slate-400 font-medium',
    };
  }

  const ahora = new Date();
  const esReabiertaActiva = Boolean(periodo.reabiertaHasta && new Date(periodo.reabiertaHasta) > ahora);

  if (esReabiertaActiva) {
    return {
      texto: 'Reabierta',
      icon: '↻',
      badgeClass: 'border-rose-200 bg-rose-50 text-rose-700 font-extrabold',
    };
  }

  if (periodo.realizada || periodo.estadoAuditoria === 'COMPLETADA') {
    return {
      texto: 'Realizada',
      icon: '✓',
      badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 font-extrabold',
    };
  }

  if (periodo.vencida || periodo.estadoAuditoria === 'NO_REALIZADA') {
    return {
      texto: 'Vencida',
      icon: '!',
      badgeClass: 'border-rose-200 bg-rose-50 text-rose-700 font-extrabold',
    };
  }

  if (periodo.estadoAuditoria === 'ATRASADA_EN_GRACIA') {
    return {
      texto: 'Atrasada',
      icon: '!',
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 font-extrabold',
    };
  }

  if (periodo.estadoAsignacion === 'CANCELADA') {
    return {
      texto: 'Cancelada',
      icon: '×',
      badgeClass: 'border-slate-200 bg-slate-100 text-slate-500 font-bold',
    };
  }

  const tieneAuditor = Boolean(periodo.auditorEfectivo?.nombre || auditorMensualNombre);
  if (!tieneAuditor) {
    return {
      texto: 'Sin auditor',
      icon: '!',
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 font-extrabold',
    };
  }

  return {
    texto: 'Pendiente',
    icon: '•',
    badgeClass: 'border-sky-200 bg-sky-50 text-sky-700 font-extrabold',
  };
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

export function buildGuardarAsignacionMensualPayload({ anio, mes, form, expectedAuditorId }) {
  return {
    anio,
    mes,
    auditorMensualId: Number(form.auditorMensualId),
    expectedAuditorId: expectedAuditorId != null ? Number(expectedAuditorId) : null,
  };
}
