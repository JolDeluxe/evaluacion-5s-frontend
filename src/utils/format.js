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
