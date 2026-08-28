export const CALIFICACION_SEMAFORO = {
  VERDE: '#22C55E',
  AMARILLO: '#EAB308',
  NARANJA: '#F97316',
  ROJO: '#EF4444',
  FALLBACK: '#CBD5E1',
};

export const CALIFICACION_SEMAFORO_RULES = [
  {
    key: 'verde',
    label: 'Excelente',
    minRatio: 0.90,
    color: CALIFICACION_SEMAFORO.VERDE,
    textColor: '#15803d', // green-700
    rgb: [34, 197, 94],
  },
  {
    key: 'amarillo',
    label: 'Satisfactorio',
    minRatio: 0.70,
    color: CALIFICACION_SEMAFORO.AMARILLO,
    textColor: '#a16207', // yellow-700
    rgb: [234, 179, 8],
  },
  {
    key: 'naranja',
    label: 'Requiere atención',
    minRatio: 0.50,
    color: CALIFICACION_SEMAFORO.NARANJA,
    textColor: '#c2410c', // orange-700
    rgb: [249, 115, 22],
  },
  {
    key: 'rojo',
    label: 'Crítico',
    minRatio: 0,
    color: CALIFICACION_SEMAFORO.ROJO,
    textColor: '#b91c1c', // red-700
    rgb: [239, 68, 68],
  },
];

/**
 * Normalizes input value (0..1 or 0..100) into a 0..1 ratio.
 * Returns null if input is not a valid score (null, undefined, NaN, empty string).
 */
export function normalizarCalificacionRatio(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;

  // If score > 1.0, assume 0..100 percentage format (e.g. 95.5 -> 0.955)
  // Exception: 0 stays 0. 1.0 stays 1.0 (100%).
  if (num > 1) {
    return num / 100;
  }

  return num;
}

/**
 * Main global helper for rating semáforo.
 * Input can be ratio (0..1) or percentage (0..100).
 * Returns object with key, color, textColor, ratio, percentage or null.
 */
export function getCalificacionSemaforo(calificacion) {
  const ratio = normalizarCalificacionRatio(calificacion);
  if (ratio === null) return null;

  // Clamp ratio between 0 and 1
  const clampedRatio = Math.max(0, ratio);

  // Epsilon tolerance for floating-point boundaries (e.g. 0.899999999)
  const EPSILON = 1e-9;

  let matchedRule = CALIFICACION_SEMAFORO_RULES.find(
    (rule) => clampedRatio + EPSILON >= rule.minRatio,
  );

  if (!matchedRule) {
    matchedRule = CALIFICACION_SEMAFORO_RULES.at(-1);
  }

  return {
    key: matchedRule.key,
    label: matchedRule.label,
    color: matchedRule.color,
    textColor: matchedRule.textColor,
    rgb: matchedRule.rgb,
    ratio: clampedRatio,
    percentage: clampedRatio * 100,
  };
}

/**
 * Returns a soft visual style object (light background, soft border, dark text)
 * based on the global semáforo rule.
 */
export function getCalificacionSemaforoSoftStyle(calificacion) {
  const semaforo = getCalificacionSemaforo(calificacion);
  if (!semaforo) return {};

  const [r, g, b] = semaforo.rgb;

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.08)`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.30)`,
    color: semaforo.textColor,
  };
}
