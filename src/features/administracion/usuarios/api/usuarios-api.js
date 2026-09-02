import { apiClient } from '@/lib/api/api-client';

const datos = (response) => response?.datos ?? response;

export const usuariosApi = {
  /**
   * Listar usuarios con paginacion y filtros.
   * query: { busqueda, rol, activo, pagina, limite }
   * La respuesta incluye areasUsuario con { area: { id, codigo, nombre, tipo } }.
   * El codigo es interno; la UI debe renderizar nombre.
   */
  listar: async (query = {}, options) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return apiClient.get(`/usuarios${qs ? `?${qs}` : ''}`, options);
  },

  obtener: async (id, options) => datos(await apiClient.get(`/usuarios/${id}`, options)),

  crear: async (body, options) => datos(await apiClient.post('/usuarios', body, options)),

  actualizar: async (id, body, options) =>
    datos(await apiClient.patch(`/usuarios/${id}`, body, options)),

  impactoAuditoria: async (id, options) =>
    datos(await apiClient.get(`/usuarios/${id}/impacto-auditoria`, options)),

  desactivar: async (id, options) =>
    datos(await apiClient.post(`/usuarios/${id}/desactivar`, {}, options)),

  reactivar: async (id, options) =>
    datos(await apiClient.post(`/usuarios/${id}/reactivar`, {}, options)),

  establecerContrasenaTemporal: async (id, body, options) =>
    datos(await apiClient.post(`/usuarios/${id}/contrasena-temporal`, body, options)),
};
