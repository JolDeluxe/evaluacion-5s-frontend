import { apiClient } from '@/lib/api/api-client';

const datos = (response) => response?.datos ?? response;

export const cumplimientosApi = {
  mensual: async ({ anio, mes } = {}, options) => {
    const params = new URLSearchParams();
    if (anio) params.set('anio', String(anio));
    if (mes) params.set('mes', String(mes));
    const qs = params.toString();
    return datos(await apiClient.get(`/cumplimientos/mensual${qs ? `?${qs}` : ''}`, options));
  },

  usuario: async (usuarioId, { anio, mes } = {}, options) => {
    const params = new URLSearchParams();
    if (anio) params.set('anio', String(anio));
    if (mes) params.set('mes', String(mes));
    const qs = params.toString();
    return datos(await apiClient.get(`/cumplimientos/usuario/${usuarioId}${qs ? `?${qs}` : ''}`, options));
  },

  recalcular: async ({ anio, mes }, options) => {
    return datos(await apiClient.post('/cumplimientos/recalcular', { anio, mes }, options));
  },
};
