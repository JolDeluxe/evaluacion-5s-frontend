import { apiClient } from '@/lib/api/api-client';

const datos = (response) => response?.datos ?? response;

const queryString = (query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const asignacionesApi = {
  mensual: async (query, options) => datos(await apiClient.get(`/asignaciones/mensual${queryString(query)}`, options)),
  carga: async (query, options) => datos(await apiClient.get(`/asignaciones/mensual/carga${queryString(query)}`, options)),
  guardarMensual: async (areaId, body, options) => datos(await apiClient.put(`/asignaciones/mensual/${areaId}`, body, options)),
  autoasignar: async (body, options) => datos(await apiClient.post('/asignaciones/mensual/autoasignar', body, options)),
  reabrir: async (id, body, options) => datos(await apiClient.post(`/asignaciones/${id}/reabrir`, body, options)),
};
