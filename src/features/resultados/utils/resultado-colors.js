import {
  CALIFICACION_SEMAFORO,
  CALIFICACION_SEMAFORO_RULES,
  getCalificacionSemaforo,
  normalizarCalificacionRatio,
} from '@/utils/calificacion-semaforo';

export {
  CALIFICACION_SEMAFORO,
  CALIFICACION_SEMAFORO_RULES,
  getCalificacionSemaforo,
  normalizarCalificacionRatio,
};

export function getResultadoColor(value) {
  return getCalificacionSemaforo(value);
}

export function getResultadoHeatmapStyle(value) {
  const semaforo = getCalificacionSemaforo(value);
  if (!semaforo) return {};

  const [r, g, b] = semaforo.rgb;

  return {
    background: `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0.03) 0%, rgba(${r}, ${g}, ${b}, 0.10) 45%, rgba(${r}, ${g}, ${b}, 0.22) 100%)`,
    color: semaforo.textColor,
  };
}

export function getResultadoCenterGlowStyle(value) {
  const semaforo = getCalificacionSemaforo(value);
  if (!semaforo) return {};

  const [r, g, b] = semaforo.rgb;

  return {
    background: `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 0.06) 20%, rgba(${r}, ${g}, ${b}, 0.20) 50%, rgba(${r}, ${g}, ${b}, 0.06) 80%, rgba(${r}, ${g}, ${b}, 0) 100%)`,
    color: semaforo.textColor,
  };
}