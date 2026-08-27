import { apiClient } from '@/lib/api/api-client';

const datos = (response) => response?.datos ?? response;

export const areasApi = {
  /**
   * Listar areas con paginacion y filtros.
   * query: { busqueda, tipo, activo, sinResponsable, pagina, limite }
   */
  listar: async (query = {}, options) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return apiClient.get(`/areas${qs ? `?${qs}` : ''}`, options);
  },

  /**
   * Obtener un area por id (con usuariosArea incluidos).
   */
  obtener: async (id, options) => datos(await apiClient.get(`/areas/${id}`, options)),

  /**
   * Guardar la relacion usuario-area (upsert).
   * body: { usuarioId: number, esResponsable: boolean }
   */
  guardarUsuarioArea: async (areaId, body, options) =>
    datos(await apiClient.put(`/areas/${areaId}/usuarios`, body, options)),

  /**
   * Crear nueva area.
   */
  crear: async (body, options) => datos(await apiClient.post('/areas', body, options)),

  /**
   * Actualizar datos basicos de un area.
   */
  actualizar: async (id, body, options) =>
    datos(await apiClient.patch(`/areas/${id}`, body, options)),

  /**
   * Desactivar un area.
   */
  desactivar: async (id, options) =>
    datos(await apiClient.post(`/areas/${id}/desactivar`, {}, options)),

  /**
   * Eliminar la relacion usuario-area.
   */
  eliminarUsuarioArea: async (areaId, usuarioId, options) =>
    datos(await apiClient.delete(`/areas/${areaId}/usuarios?usuarioId=${usuarioId}`, options)),

  /**
   * Reactivar un area.
   */
  reactivar: async (id, body = {}, options) =>
    datos(await apiClient.post(`/areas/${id}/reactivar`, body, options)),
};
