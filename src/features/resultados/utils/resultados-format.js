const MESES = [
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

export function getCurrentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isValidMonthKey(value) {
  if (!/^\d{4}-\d{2}$/.test(value || '')) return false;
  const [, month] = value.split('-').map(Number);
  return month >= 1 && month <= 12;
}

export function normalizeMonthKey(value, fallback = getCurrentMonthKey()) {
  return isValidMonthKey(value) ? value : fallback;
}

export function formatMonthLabel(value) {
  const monthKey = normalizeMonthKey(value);
  const [year, month] = monthKey.split('-').map(Number);
  return `${MESES[month - 1]} ${year}`;
}

export function formatPeriodLabel(periodo) {
  return `Periodo ${periodo}`;
}

export function formatShortDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getEstadoMesVisual(estado) {
  const map = {
    EN_CURSO: {
      label: 'En curso',
      className: 'border-blue-200 bg-blue-50 text-blue-700',
      dotClassName: 'bg-blue-500',
    },
    CERRADO: {
      label: 'Cerrado',
      className: 'border-slate-200 bg-slate-50 text-slate-700',
      dotClassName: 'bg-slate-500',
    },
    EN_GRACIA: {
      label: 'En periodo de gracia',
      className: 'border-amber-200 bg-amber-50 text-amber-700',
      dotClassName: 'bg-amber-500',
    },
    CONSOLIDADO: {
      label: 'Consolidado',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dotClassName: 'bg-emerald-500',
    },
    SIN_PROGRAMACION: {
      label: 'Sin programación',
      className: 'border-slate-200 bg-slate-50 text-slate-500',
      dotClassName: 'bg-slate-400',
    },
  };

  return map[estado] ?? map.SIN_PROGRAMACION;
}

export function getEstadoAreaLabel(estado) {
  if (estado === 'COMPLETA') return 'Realizada';
  if (estado === 'PARCIAL') return 'Pendiente';
  return 'No realizada';
}
