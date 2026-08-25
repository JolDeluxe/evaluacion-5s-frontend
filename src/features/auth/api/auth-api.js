import { apiClient } from '@/lib/api/api-client';

export const authApi = {
  me: (options) => apiClient.get('/auth/me', options),
  login: (credentials, options) => apiClient.post('/auth/iniciar-sesion', credentials, options),
  logout: (options) => apiClient.post('/auth/cerrar-sesion', {}, options),
};
