import { apiClient } from '@/lib/api/api-client';

const unwrap = (res) => res?.datos ?? res;

export const inicioApi = {
  async obtenerDashboard() {
    return unwrap(await apiClient.get('/inicio/dashboard'));
  },
};
