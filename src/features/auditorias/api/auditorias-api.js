import { apiClient } from '@/lib/api/api-client';

const unwrapDatos = (response) => response?.datos ?? response;

export const auditoriasApi = {
  obtenerContextoAsignacion: async (id, options) =>
    unwrapDatos(await apiClient.get(`/asignaciones/${id}/auditoria`, options)),

  verificarQrAsignacion: async (id, body, options) =>
    unwrapDatos(await apiClient.post(`/asignaciones/${id}/verificar-qr-area`, body, options)),

  enviarAuditoria: async (body, options) =>
    unwrapDatos(await apiClient.post('/auditorias', body, options)),

  firmarEvidencia: async (body, options) =>
    unwrapDatos(await apiClient.post('/evidencias/firmar', body, options)),

  obtenerContextoInvitado: async (token, options) =>
    unwrapDatos(await apiClient.get(`/invitados/${token}`, options)),

  verificarQrInvitado: async (token, body, options) =>
    unwrapDatos(await apiClient.post(`/invitados/${token}/verificar-qr-area`, body, options)),

  enviarAuditoriaInvitado: async (token, body, options) =>
    unwrapDatos(await apiClient.post(`/invitados/${token}/auditorias`, body, options)),

  firmarEvidenciaInvitado: async (token, body, options) =>
    unwrapDatos(await apiClient.post(`/invitados/${token}/evidencias/firmar`, body, options)),
};
