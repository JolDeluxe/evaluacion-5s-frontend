import { apiClient } from '@/lib/api/api-client';

const datos = (response) => response?.datos ?? response;

export const entregasApi = {
  getResumen: async (options) =>
    datos(await apiClient.get('/sistema/correos/resumen', options)),

  getEstado: async (options) =>
    datos(await apiClient.get('/sistema/correos/estado', options)),

  listar: async (query = {}, options) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return apiClient.get(`/sistema/entregas-notificacion${qs ? `?${qs}` : ''}`, options);
  },

  reintentar: async (id, options) =>
    datos(await apiClient.post(`/sistema/entregas-notificacion/${id}/reintentar`, {}, options)),

  reenviar: async (id, options) =>
    datos(await apiClient.post(`/sistema/correos/reenviar/${id}`, {}, options)),

  simular: async (query = {}, options) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return datos(await apiClient.get(`/sistema/correos/simular${qs ? `?${qs}` : ''}`, options));
  },

  getPreview: async (query = {}, options) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return datos(await apiClient.get(`/sistema/correos/preview${qs ? `?${qs}` : ''}`, options));
  },

  enviarPrueba: async (body = {}, options) =>
    datos(await apiClient.post('/sistema/correos/enviar-prueba', body, options)),

  getMicrosoftEstado: async (options) =>
    datos(await apiClient.get('/sistema/correos/microsoft/estado', options)),

  iniciarMicrosoftConexion: async (options) =>
    datos(await apiClient.post('/sistema/correos/microsoft/iniciar', {}, options)),

  desconectarMicrosoft: async (options) =>
    datos(await apiClient.post('/sistema/correos/microsoft/desconectar', {}, options)),
};