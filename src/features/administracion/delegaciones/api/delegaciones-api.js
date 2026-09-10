import { apiClient } from '@/lib/api/api-client';

const datos = (response) => response?.datos ?? response;

export const delegacionesApi = {
  listar: async (filtros = {}, options) => {
    const params = new URLSearchParams();
    if (filtros.ejecutorId) params.set('ejecutorId', String(filtros.ejecutorId));
    if (filtros.responsableId) params.set('responsableId', String(filtros.responsableId));
    if (filtros.activa !== undefined) params.set('activa', String(filtros.activa));
    const qs = params.toString();
    return datos(await apiClient.get('/delegaciones' + (qs ? '?' + qs : ''), options));
  },

  crear: async (payload, options) => {
    return datos(await apiClient.post('/delegaciones', payload, options));
  },

  actualizar: async (id, payload, options) => {
    return datos(await apiClient.put('/delegaciones/' + id, payload, options));
  },

  eliminar: async (id, options) => {
    return datos(await apiClient.delete('/delegaciones/' + id, options));
  },
};
