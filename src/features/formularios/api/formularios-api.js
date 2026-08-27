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
  obtenerRevision: async (revisionId, options) => datos(await apiClient.get(`/formularios/versiones/${revisionId}`, options)),
  actualizar: async (id, body, options) => datos(await apiClient.patch(`/formularios/${id}`, body, options)),
  crear: async (body, options) => datos(await apiClient.post('/formularios', body, options)),
  guardarFormulario: async (id, body, options) => datos(await apiClient.put(`/formularios/${id}`, body, options)),
  guardarEstructura: async (formularioId, body, options) => datos(await apiClient.put(`/formularios/${formularioId}/estructura`, body, options)),
};
