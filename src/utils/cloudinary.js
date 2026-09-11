/**
 * Inyecta parámetros de transformación a una URL de Cloudinary para optimizar
 * tamaño, formato y calidad de imagen.
 *
 * @param {string} url - URL original de la imagen
 * @param {string} [transformations='w_400,c_scale,q_auto,f_auto'] - Parámetros de transformación Cloudinary
 * @returns {string} URL transformada o la original si no es de Cloudinary
 */
export function optimizarCloudinaryUrl(url, transformations = 'w_400,c_scale,q_auto,f_auto') {
  if (!url || typeof url !== 'string') return url;

  // Verificar si es una URL de Cloudinary estándar
  const uploadMarker = '/image/upload/';
  const index = url.indexOf(uploadMarker);

  if (index === -1) {
    return url;
  }

  const prefix = url.slice(0, index + uploadMarker.length);
  const suffix = url.slice(index + uploadMarker.length);

  // Evitar duplicar transformaciones si ya están presentes
  if (suffix.startsWith(transformations + '/')) {
    return url;
  }

  return `${prefix}${transformations}/${suffix}`;
}
