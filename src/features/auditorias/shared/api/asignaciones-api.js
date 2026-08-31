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
  listar: async (query, options) => datos(await apiClient.get(`/asignaciones${queryString(query)}`, options)),
  obtenerInvitacionActiva: async (id, options) =>
    datos(await apiClient.get(`/asignaciones/${id}/enlaces-invitado/activo`, options)),
  crearInvitacion: async (id, body = {}, options) =>
    datos(await apiClient.post(`/asignaciones/${id}/enlaces-invitado`, body, options)),
  revocarInvitacionActiva: async (id, options) =>
    datos(await apiClient.delete(`/asignaciones/${id}/enlaces-invitado/activo`, options)),
};
