import { apiClient } from '@/lib/api/api-client';

export const invitadosApi = {
  areasPublicas: (options) => apiClient.get('/invitados/areas-publicas', options),
  crearAccesoPublico: (body, options) => apiClient.post('/invitados/acceso-publico', body, options),
  iniciarPublico: (body, options) => apiClient.post('/invitados/iniciar', body, options),
  obtenerInvitacion: (token, options) => apiClient.get(`/invitados/${token}`, options),
  enviarAuditoriaPublico: (body, options) => apiClient.post('/invitados/publico/auditorias', body, options),
};
