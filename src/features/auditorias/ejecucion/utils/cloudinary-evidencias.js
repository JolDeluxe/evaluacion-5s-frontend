import { auditoriasApi } from '@/features/auditorias/ejecucion/api/auditorias-api';
import { evidenciasOffline } from '@/features/auditorias/ejecucion/utils/evidencias-db';

/**
 * Espera `ms` milisegundos.
 */
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determina si un error es de red/transitorio (vale la pena reintentar).
 */
function esErrorReintenatable(err) {
  if (!navigator.onLine) return false; // sin conexión → no reintentar ahora
  if (err?.name === 'TypeError') return true; // failed to fetch
  const msg = (err?.message || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('timeout') ||
    msg.includes('rate limit') ||
    // Cloudinary 5xx
    (typeof err?.status === 'number' && err.status >= 500)
  );
}

/**
 * Sube un archivo a Cloudinary con reintentos automáticos y backoff exponencial.
 *
 * @param {File} file
 * @param {object} firma  – Firma generada por el backend
 * @param {object} [opciones]
 * @param {number} [opciones.maxIntentos=4]   Número máximo de intentos (incluye el primero)
 * @param {number} [opciones.baseDelayMs=800] Demora base entre reintentos (se duplica con cada fallo)
 * @param {AbortSignal} [opciones.signal]     Para cancelar externamente
 */
export async function subirACloudinary(file, firma, { maxIntentos = 4, baseDelayMs = 800, signal } = {}) {
  let ultimoError;

  for (let intento = 1; intento <= maxIntentos; intento++) {
    if (signal?.aborted) throw new DOMException('Subida cancelada', 'AbortError');

    // Si no hay red, fallar rápido sin quemar reintentos
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw Object.assign(new Error('Sin conexión a internet'), { esOffline: true });
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', firma.apiKey);
      formData.append('timestamp', firma.timestamp);
      formData.append('signature', firma.signature);
      formData.append('public_id', firma.publicId);
      formData.append('folder', firma.folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`,
        { method: 'POST', body: formData, signal }
      );

      const data = await response.json();
      if (!response.ok) {
        const err = new Error(data?.error?.message || 'No se pudo subir la evidencia.');
        err.status = response.status;
        throw err;
      }
      return data;
    } catch (err) {
      ultimoError = err;

      // No reintentar errores de cancelación o sin conexión
      if (err?.name === 'AbortError' || err?.esOffline) throw err;

      if (intento < maxIntentos && esErrorReintenatable(err)) {
        // Backoff exponencial con jitter: base * 2^(intento-1) ± 20 %
        const delay = baseDelayMs * Math.pow(2, intento - 1);
        const jitter = delay * (0.8 + Math.random() * 0.4); // ×0.8 a ×1.2
        await esperar(Math.min(jitter, 30_000)); // tope 30 s
        continue;
      }

      throw ultimoError;
    }
  }

  throw ultimoError;
}

/**
 * Mapea la respuesta de Cloudinary al esquema esperado por el backend.
 */
export function mapearEvidenciaCloudinary(data, file, identificadorCliente = null) {
  return {
    identificadorCliente: identificadorCliente || crypto.randomUUID(),
    publicIdCloudinary: data.public_id,
    assetIdCloudinary: data.asset_id ?? null,
    formato: data.format ?? null,
    tipoMime: file.type || data.resource_type || null,
    bytes: data.bytes ?? file.size ?? null,
    ancho: data.width ?? null,
    alto: data.height ?? null,
    capturadaEn: null,
    subidaEn: new Date().toISOString(),
    url: data.secure_url || data.url || '',
  };
}

/**
 * Sincroniza todas las evidencias guardadas localmente en Dexie (IndexedDB)
 * para una auditoría hacia Cloudinary, y las asocia a sus respectivos criterios.
 *
 * Usa reintentos automáticos por archivo. Si no hay red, devuelve pendientesRestantes > 0.
 *
 * @returns {Promise<{ exito: boolean, respuestas: object, pendientesRestantes: number }>}
 */
export async function sincronizarEvidenciasDexie(auditoriaId, modo, token, respuestas = {}) {
  const registros = await evidenciasOffline.obtenerPorAuditoria(auditoriaId);
  if (!registros || registros.length === 0) {
    return { exito: true, respuestas, pendientesRestantes: 0 };
  }

  // Si no hay red, no podemos sincronizar ahora
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { exito: false, respuestas, pendientesRestantes: registros.length };
  }

  const nuevasRespuestas = { ...respuestas };
  let pendientesRestantes = registros.length;

  for (const reg of registros) {
    // Verificar señal de red antes de cada archivo
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      break;
    }

    try {
      const file = new File(
        [reg.fileBlob],
        reg.fileName || 'evidencia.webp',
        { type: reg.fileType || 'image/webp' }
      );

      const firma = modo === 'invitado'
        ? await auditoriasApi.firmarEvidenciaInvitado(token, { carpeta: 'auditorias-5s' })
        : await auditoriasApi.firmarEvidencia({ carpeta: 'auditorias-5s' });

      // Reintentos automáticos incorporados en subirACloudinary
      const data = await subirACloudinary(file, firma, { maxIntentos: 3, baseDelayMs: 1000 });
      const evidenciaMapeada = mapearEvidenciaCloudinary(data, file, reg.identificadorCliente);

      // Eliminar de Dexie tras éxito
      await evidenciasOffline.eliminar(reg.identificadorCliente);
      pendientesRestantes--;

      // Asociar la evidencia al criterio en respuestas
      const criterioKey = reg.criterioId;
      const respActual = nuevasRespuestas[criterioKey] ?? {};
      const evidenciasActuales = Array.isArray(respActual.evidencias) ? respActual.evidencias : [];

      // Evitar duplicados por identificadorCliente
      const existe = evidenciasActuales.some(
        (e) => e.identificadorCliente === evidenciaMapeada.identificadorCliente || e.publicIdCloudinary === evidenciaMapeada.publicIdCloudinary
      );

      if (!existe) {
        nuevasRespuestas[criterioKey] = {
          ...respActual,
          evidencias: [...evidenciasActuales, evidenciaMapeada],
        };
      }
    } catch (err) {
      console.warn(`[OfflineSync] Falló subida a Cloudinary de evidencia ${reg.identificadorCliente}:`, err);
      // Detener si perdimos conexión en medio del proceso
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        break;
      }
      // Si es un error permanente (4xx no reintenatable) eliminamos de dexie para no bloquear
      // pero conservamos registros 5xx / red para reintento posterior
    }
  }

  return {
    exito: pendientesRestantes === 0,
    respuestas: nuevasRespuestas,
    pendientesRestantes,
  };
}
