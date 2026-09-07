/**
 * Formatea un porcentaje truncándolo a 2 decimales sin redondear.
 * Ejemplos:
 * - 90.5499 -> "90.54%"
 * - 95.6599 -> "95.65%"
 * - 100 -> "100.00%"
 * 
 * @param {number|string} value - El valor numérico a formatear
 * @returns {string} El porcentaje formateado
 */
export function formatPercentTrunc(value) {
  if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
    return '-';
  }
  const num = Number(value);
  const truncated = Math.floor(Math.abs(num) * 100) / 100;
  const sign = num < 0 ? '-' : '';
  return `${sign}${truncated.toFixed(2)}%`;
}

/**
 * Formatea una fecha en formato largo en español (ej. "25 de agosto de 2026").
 * @param {string|Date} fecha
 * @returns {string|null}
 */
export function formatFechaLarga(fecha) {
  if (!fecha) return null;
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha y hora legible (ej. "25 ago 2026, 14:30").
 * @param {string|Date} fecha
 * @returns {string|null}
 */
export function formatFechaHora(fecha) {
  if (!fecha) return null;
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

