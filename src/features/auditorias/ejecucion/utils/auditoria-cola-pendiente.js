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
export function encolarAuditoriaPendiente({
  id,
  asignacionId,
  modo,
  token,
  versionFormularioId = null,
  payload,
}) {
  const cola = leerCola();
  // Evitar duplicados: si ya está en cola, actualizar payload.
  const existente = cola.findIndex((e) => e.id === id);
  const entrada = {
    id,
    asignacionId: asignacionId !== undefined && asignacionId !== null ? String(asignacionId) : null,
    modo: modo ?? 'autenticado',
    token: token ?? null,
    versionFormularioId: versionFormularioId ?? (existente >= 0 ? cola[existente].versionFormularioId ?? null : null),
    payload,
    intentos: existente >= 0 ? (cola[existente].intentos ?? 0) + 1 : 1,
    creadoEn: existente >= 0 ? cola[existente].creadoEn : new Date().toISOString(),
    ultimoIntentoEn: new Date().toISOString(),
    errorUltimo: null,
    conflictoFormulario: false,
    requiereRevision: false,
    detenerReintentoAutomatico: false,
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
  return leerCola().find((e) => String(e.asignacionId) === String(asignacionId)) ?? null;
}

/**
 * Determina si un error HTTP corresponde a incompatibilidad de versión de formulario (400/409).
 */
export function esErrorIncompatibilidadFormulario(err) {
  const status = Number(err?.status ?? err?.statusCode ?? 0);
  const msg = String(err?.message ?? '').toLowerCase();
  const detallesStr = Array.isArray(err?.detalles)
    ? err.detalles.map((d) => String(d?.message || d?.mensaje || '')).join(' ').toLowerCase()
    : '';
  const texto = `${msg} ${detallesStr}`;

  const coincideMensaje =
    texto.includes('no pertenece a la version del formulario')
    || texto.includes('no pertenece a la versión del formulario')
    || texto.includes('requiere exactamente')
    || texto.includes('faltan respuestas del formulario')
    || texto.includes('formulario asignado al area')
    || texto.includes('formulario asignado al área')
    || texto.includes('cambio de clasificacion')
    || texto.includes('cambio de clasificación')
    || texto.includes('reclasificacion')
    || texto.includes('reclasificación');

  if (coincideMensaje) return true;
  if ((status === 400 || status === 409) && texto.includes('formulario')) return true;
  return false;
}

/**
 * Marca una entrada de la cola con conflicto de formulario para detener reintentos automáticos
 * y preservar sus datos (QR, hallazgos y evidencias) para recuperación asistida.
 */
export function marcarConflictoFormularioEnCola(id, errorMsg, status = 409) {
  const cola = leerCola();
  const idx = cola.findIndex((e) => e.id === id);
  if (idx >= 0) {
    cola[idx] = {
      ...cola[idx],
      ultimoIntentoEn: new Date().toISOString(),
      errorUltimo:
        errorMsg
        || 'El formulario del área cambió por una actualización de clasificación. Revisa y completa el formulario vigente.',
      conflictoFormulario: true,
      requiereRevision: true,
      detenerReintentoAutomatico: true,
      codigoError: status,
    };
    guardarCola(cola);
    return cola[idx];
  }
  return null;
}

/**
 * Busca borradores previos de la misma auditoría guardados con otra versión de formulario,
 * sin eliminarlos ni traducir respuestas SI/NO automáticamente.
 */
export function buscarBorradoresVersionAnterior(modo, auditoriaId, versionFormularioActualId) {
  if (!auditoriaId) return [];
  const prefix = `encuestas-5s:auditoria-draft:${modo}:${auditoriaId}:`;
  const encontrados = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const versionGuardada = parsed?.versionFormularioId ?? key.slice(prefix.length);
      if (String(versionGuardada) === String(versionFormularioActualId)) continue;

      encontrados.push({
        key,
        versionFormularioId: versionGuardada,
        identificadorCliente: parsed?.identificadorCliente ?? null,
        verificacionArea: parsed?.verificacionArea ?? null,
        respuestas: parsed?.respuestas ?? {},
        updatedAt: parsed?.updatedAt ?? null,
      });
    }
  } catch {
    // noop
  }

  return encontrados.sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

/**
 * Extrae datos recuperables (QR, hallazgos escritos y evidencias locales/Cloudinary)
 * desde borradores de versiones anteriores, entradas en cola con conflicto y registros de IndexedDB.
 */
export function extraerDatosRecuperables({
  borradoresAnteriores = [],
  entradaColaConflicto = null,
  evidenciasDexie = [],
  codigoVerificacionEsperado = '',
}) {
  const normalizarCodigo = (c) => String(c ?? '').trim().toUpperCase().replace(/[\s-]/g, '');
  const esperadoNorm = normalizarCodigo(codigoVerificacionEsperado);

  let verificacionQrRecuperada = null;

  for (const draft of borradoresAnteriores) {
    const verif = draft?.verificacionArea;
    const codigo = verif?.codigoQr || verif?.codigoVerificacion || '';
    if (verif?.verificado && codigo && (!esperadoNorm || normalizarCodigo(codigo) === esperadoNorm)) {
      verificacionQrRecuperada = {
        codigoQr: codigo,
        codigoVerificacion: codigo,
        verificado: true,
        verificadoEn: verif.verificadoEn || draft.updatedAt || new Date().toISOString(),
        recuperadoDeCambioFormulario: true,
      };
      break;
    }
  }

  if (!verificacionQrRecuperada && entradaColaConflicto?.payload?.codigoVerificacion) {
    const codigoCola = entradaColaConflicto.payload.codigoVerificacion;
    if (!esperadoNorm || normalizarCodigo(codigoCola) === esperadoNorm) {
      verificacionQrRecuperada = {
        codigoQr: codigoCola,
        codigoVerificacion: codigoCola,
        verificado: true,
        verificadoEn: entradaColaConflicto.creadoEn || new Date().toISOString(),
        recuperadoDeCambioFormulario: true,
      };
    }
  }

  const hallazgosMap = new Map();
  const evidenciasMap = new Map();

  for (const draft of borradoresAnteriores) {
    const respuestas = draft?.respuestas ?? {};
    for (const [criterioId, r] of Object.entries(respuestas)) {
      const textoHallazgo = r?.hallazgo?.trim();
      if (textoHallazgo && !hallazgosMap.has(`${criterioId}:${textoHallazgo}`)) {
        hallazgosMap.set(`${criterioId}:${textoHallazgo}`, {
          id: `${criterioId}:${textoHallazgo}`,
          criterioOrigenId: String(criterioId),
          hallazgo: textoHallazgo,
          origen: 'borrador_anterior',
        });
      }

      const evs = Array.isArray(r?.evidencias) ? r.evidencias : [];
      for (const ev of evs) {
        const idCliente = ev?.identificadorCliente;
        if (idCliente && !evidenciasMap.has(idCliente)) {
          evidenciasMap.set(idCliente, {
            ...ev,
            criterioOrigenId: String(criterioId),
            origen: ev.publicIdCloudinary ? 'cloudinary' : 'borrador_anterior',
          });
        }
      }
    }
  }

  if (Array.isArray(entradaColaConflicto?.payload?.respuestas)) {
    for (const r of entradaColaConflicto.payload.respuestas) {
      const criterioId = r?.preguntaFormularioId ?? 'pregunta';
      const textoHallazgo = r?.hallazgo?.trim();
      if (textoHallazgo && !hallazgosMap.has(`${criterioId}:${textoHallazgo}`)) {
        hallazgosMap.set(`${criterioId}:${textoHallazgo}`, {
          id: `${criterioId}:${textoHallazgo}`,
          criterioOrigenId: String(criterioId),
          hallazgo: textoHallazgo,
          origen: 'cola_offline',
        });
      }

      const fotos = Array.isArray(r?.fotos) ? r.fotos : [];
      for (const foto of fotos) {
        const idCliente = foto?.identificadorCliente;
        if (idCliente && !evidenciasMap.has(idCliente)) {
          evidenciasMap.set(idCliente, {
            ...foto,
            criterioOrigenId: String(criterioId),
            origen: 'cola_offline',
          });
        }
      }
    }
  }

  for (const reg of evidenciasDexie) {
    const idCliente = reg?.identificadorCliente;
    if (!idCliente) continue;
    const existente = evidenciasMap.get(idCliente);
    evidenciasMap.set(idCliente, {
      ...(existente ?? {}),
      identificadorCliente: idCliente,
      criterioOrigenId: String(reg.criterioId ?? existente?.criterioOrigenId ?? ''),
      nombreArchivo: reg.fileName ?? existente?.nombreArchivo ?? 'Evidencia local',
      tipoMime: reg.fileType ?? existente?.tipoMime ?? 'image/jpeg',
      pendienteSubida: !existente?.publicIdCloudinary,
      tieneBlobLocal: Boolean(reg.fileBlob),
      origen: existente?.publicIdCloudinary ? 'cloudinary_y_dexie' : 'dexie',
    });
  }

  return {
    tieneDatosRecuperables:
      Boolean(verificacionQrRecuperada)
      || hallazgosMap.size > 0
      || evidenciasMap.size > 0
      || Boolean(entradaColaConflicto),
    verificacionQrRecuperada,
    hallazgosRecuperados: [...hallazgosMap.values()],
    evidenciasRecuperadas: [...evidenciasMap.values()],
    teniaBorradorAnterior: borradoresAnteriores.length > 0,
    teniaColaConflicto: Boolean(entradaColaConflicto),
  };
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
export function marcarColaFallida(id, errorMsg, opciones = {}) {
  const cola = leerCola();
  const idx = cola.findIndex((e) => e.id === id);
  if (idx >= 0) {
    const conflicto = Boolean(opciones.conflictoFormulario);
    cola[idx] = {
      ...cola[idx],
      intentos: (cola[idx].intentos ?? 0) + 1,
      ultimoIntentoEn: new Date().toISOString(),
      errorUltimo: errorMsg ?? 'Error de red',
      ...(conflicto
        ? {
            conflictoFormulario: true,
            requiereRevision: true,
            detenerReintentoAutomatico: true,
          }
        : {}),
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
