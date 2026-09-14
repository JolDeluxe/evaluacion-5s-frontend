import { auditoriasApi } from '@/features/auditorias/ejecucion/api/auditorias-api';
import { evidenciasOffline } from '@/features/auditorias/ejecucion/utils/evidencias-db';

/**
 * Realiza la subida de un archivo directo a Cloudinary usando una firma segura.
 */
export async function subirACloudinary(file, firma) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', firma.apiKey);
  formData.append('timestamp', firma.timestamp);
  formData.append('signature', firma.signature);
  formData.append('public_id', firma.publicId);
  formData.append('folder', firma.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'No se pudo subir la evidencia.');
  }
  return data;
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
    try {
      const file = new File(
        [reg.fileBlob],
        reg.fileName || 'evidencia.webp',
        { type: reg.fileType || 'image/webp' }
      );

      const firma = modo === 'invitado'
        ? await auditoriasApi.firmarEvidenciaInvitado(token, { carpeta: 'auditorias-5s' })
        : await auditoriasApi.firmarEvidencia({ carpeta: 'auditorias-5s' });

      const data = await subirACloudinary(file, firma);
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
    }
  }

  return {
    exito: pendientesRestantes === 0,
    respuestas: nuevasRespuestas,
    pendientesRestantes,
  };
}
