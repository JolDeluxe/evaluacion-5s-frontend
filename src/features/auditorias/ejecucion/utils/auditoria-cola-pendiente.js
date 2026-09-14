/**
 * Cola de auditorías pendientes de envío por falta de conectividad.
 *
 * Cuando el envío falla por error de red (isNetworkError / sin internet),
 * el payload completo se persiste aquí en localStorage para ser reenviado
 * automáticamente cuando se recupere la conexión.
 *
 * Estructura de cada entrada:
 * {
 *   id: string,                  // identificadorCliente de la auditoría
 *   asignacionId: string | null, // para identificarla en la lista de auditorías
 *   modo: 'autenticado' | 'invitado',
 *   token: string | null,
 *   payload: object,             // body completo para POST /auditorias
 *   intentos: number,
 *   creadoEn: string,            // ISO
 *   ultimoIntentoEn: string | null,
 *   errorUltimo: string | null,
 * }
 */

const STORAGE_KEY = 'encuestas-5s:cola-pendiente-envio';

function leerCola() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function guardarCola(cola) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cola));
  } catch {
    // Si localStorage falla (cuota llena, etc.) no rompemos la app.
  }
}

// ─── API pública ────────────────────────────────────────────────────────────

/**
 * Encola una auditoría que no pudo enviarse por error de red.
 */
export function encolarAuditoriaPendiente({ id, asignacionId, modo, token, payload }) {
  const cola = leerCola();
  // Evitar duplicados: si ya está en cola, actualizar payload.
  const existente = cola.findIndex((e) => e.id === id);
  const entrada = {
    id,
    asignacionId: asignacionId ?? null,
    modo: modo ?? 'autenticado',
    token: token ?? null,
    payload,
    intentos: existente >= 0 ? (cola[existente].intentos ?? 0) + 1 : 1,
    creadoEn: existente >= 0 ? cola[existente].creadoEn : new Date().toISOString(),
    ultimoIntentoEn: new Date().toISOString(),
    errorUltimo: null,
  };

  if (existente >= 0) {
    cola[existente] = entrada;
  } else {
    cola.push(entrada);
  }

  guardarCola(cola);
  return entrada;
}

/**
 * Devuelve todas las entradas pendientes.
 */
export function obtenerColaPendiente() {
  return leerCola();
}

/**
 * Devuelve la entrada pendiente para una asignación específica, si existe.
 */
export function obtenerPendienteDeAsignacion(asignacionId) {
  if (!asignacionId) return null;
  return leerCola().find((e) => e.asignacionId === String(asignacionId)) ?? null;
}

/**
 * Elimina una entrada de la cola (por identificadorCliente).
 */
export function eliminarDeCola(id) {
  const cola = leerCola().filter((e) => e.id !== id);
  guardarCola(cola);
}

/**
 * Marca una entrada como fallida (para mostrar error en la UI).
 */
export function marcarColaFallida(id, errorMsg) {
  const cola = leerCola();
  const idx = cola.findIndex((e) => e.id === id);
  if (idx >= 0) {
    cola[idx] = {
      ...cola[idx],
      intentos: (cola[idx].intentos ?? 0) + 1,
      ultimoIntentoEn: new Date().toISOString(),
      errorUltimo: errorMsg ?? 'Error de red',
    };
    guardarCola(cola);
  }
}

/**
 * Limpia toda la cola (por ejemplo, al cerrar sesión).
 */
export function limpiarColaPendiente() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
