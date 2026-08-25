import { apiClient } from '@/lib/api/api-client';

export const invitadosApi = {
  areasPublicas: (options) => apiClient.get('/invitados/areas-publicas', options),
  crearAccesoPublico: (body, options) => apiClient.post('/invitados/acceso-publico', body, options),
};
