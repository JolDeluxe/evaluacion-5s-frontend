/**
 * Carga la totalidad de un catálogo desde un endpoint paginado.
 * Si el `total` reportado en `meta` supera el tamaño devuelto en la primera página,
 * dispara peticiones concurrentes (Promise.all) para las páginas restantes y deduplica por `id`.
 *
 * @param {Function} fetcherFn - Función que realiza la llamada API aceptando `(query, options)`.
 * @param {Object} query - Filtros y parámetros de búsqueda.
 * @param {number} limitePagina - Tamaño de página por lote (default: 100).
 * @param {Object} options - Opciones adicionales de petición.
 * @returns {Promise<{ datos: Array, total: number, meta: Object }>}
 */
export async function obtenerCatalogoCompleto(fetcherFn, query = {}, limitePagina = 100, options = {}) {
  const paramsIniciales = { ...query, pagina: 1, limite: limitePagina };
  const respuestaInicial = await fetcherFn(paramsIniciales, options);

  let datos = respuestaInicial?.datos ?? [];
  const meta = respuestaInicial?.meta ?? {};
  const total = meta.total ?? datos.length;

  if (total > datos.length && meta.pagina && meta.limite) {
    const totalPaginas = Math.ceil(total / meta.limite);
    const paginasPromesas = [];

    for (let p = 2; p <= totalPaginas; p++) {
      paginasPromesas.push(fetcherFn({ ...query, pagina: p, limite: limitePagina }, options));
    }

    const respuestasRestantes = await Promise.all(paginasPromesas);

    for (const res of respuestasRestantes) {
      if (res?.datos?.length) {
        datos = datos.concat(res.datos);
      }
    }

    // Deduplicación por `id` conservando la primera aparición
    const idsVistos = new Set();
    datos = datos.filter((item) => {
      if (!item || item.id === undefined || item.id === null) return true;
      if (idsVistos.has(item.id)) return false;
      idsVistos.add(item.id);
      return true;
    });
  }

  return {
    datos,
    total: datos.length,
    meta,
  };
}
