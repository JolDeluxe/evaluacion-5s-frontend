import { apiClient } from '@/lib/api/api-client';

export const perfilApi = {
  actualizarPerfil: (data) => apiClient.patch('/auth/me', data),
  cambiarContrasena: (data) => apiClient.post('/auth/cambiar-contrasena', data),
  obtenerMiCredencial: () => apiClient.get('/auth/me/credencial'),
};
