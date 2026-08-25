import { apiClient } from '@/lib/api/api-client';

const datos = (response) => response?.datos ?? response;

export const formulariosApi = {
  listar: async (query = {}, options) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, value);
    });
    return apiClient.get(`/formularios${params.toString() ? `?${params}` : ''}`, options);
  },
  obtener: async (id, options) => datos(await apiClient.get(`/formularios/${id}`, options)),
  actualizar: async (id, body, options) => datos(await apiClient.patch(`/formularios/${id}`, body, options)),
  listarVersiones: async (id, options) => datos(await apiClient.get(`/formularios/${id}/versiones`, options)),
  obtenerVersion: async (versionId, options) => datos(await apiClient.get(`/formularios/versiones/${versionId}`, options)),
  crear: async (body, options) => datos(await apiClient.post('/formularios', body, options)),
  crearVersion: async (formularioId, body, options) => datos(await apiClient.post(`/formularios/${formularioId}/versiones`, body, options)),
  guardarEstructura: async (versionId, body, options) => datos(await apiClient.put(`/formularios/versiones/${versionId}/estructura`, body, options)),
  publicarVersion: async (versionId, options) => datos(await apiClient.post(`/formularios/versiones/${versionId}/publicar`, {}, options)),
  archivarVersion: async (versionId, options) => datos(await apiClient.post(`/formularios/versiones/${versionId}/archivar`, {}, options)),
  firmarImagen: async (versionId, body, options) => datos(await apiClient.post(`/formularios/versiones/${versionId}/imagenes/firmar`, body, options)),
};
