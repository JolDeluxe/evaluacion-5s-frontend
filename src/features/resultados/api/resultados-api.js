import { apiClient } from '@/lib/api/api-client';

const unwrap = (response) => response?.datos ?? response;

const withQuery = (path, params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
};

export const resultadosApi = {
  async obtenerGeneral({ mes, tipoArea } = {}) {
    return unwrap(await apiClient.get(withQuery('/resultados/general', { mes, tipoArea })));
  },

  async obtenerAreas({ mes, tipoArea } = {}) {
    return unwrap(await apiClient.get(withQuery('/resultados/areas', { mes, tipoArea })));
  },

  async obtenerArea(areaId, { mes } = {}) {
    return unwrap(await apiClient.get(withQuery(`/resultados/areas/${areaId}`, { mes })));
  },

  async obtenerPeriodo(areaId, periodo, { mes } = {}) {
    return unwrap(await apiClient.get(withQuery(`/resultados/areas/${areaId}/periodos/${periodo}`, { mes })));
  },
};
