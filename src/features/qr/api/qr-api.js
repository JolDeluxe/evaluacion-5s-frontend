import { apiClient } from '@/lib/api/api-client';

export const qrApi = {
  resolverCodigo: (codigo, options) =>
    apiClient.get(`/qr/${encodeURIComponent(codigo)}`, options),
};
