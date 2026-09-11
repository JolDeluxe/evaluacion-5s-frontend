import Dexie from "dexie";

export const db = new Dexie("AuditoriasOfflineDB");

db.version(1).stores({
  evidenciasPendientes: "++id, auditoriaId, criterioId, identificadorCliente, [auditoriaId+criterioId]",
});

export const evidenciasOffline = {
  async guardar(auditoriaId, criterioId, identificadorCliente, fileBlob, fileName, fileType) {
    return await db.evidenciasPendientes.put({
      auditoriaId,
      criterioId,
      identificadorCliente,
      fileBlob,
      fileName,
      fileType,
      timestamp: Date.now(),
    });
  },

  async obtener(identificadorCliente) {
    return await db.evidenciasPendientes.where("identificadorCliente").equals(identificadorCliente).first();
  },

  async obtenerPorCriterio(auditoriaId, criterioId) {
    return await db.evidenciasPendientes
      .where({ auditoriaId, criterioId })
      .toArray();
  },

  async obtenerPorAuditoria(auditoriaId) {
    return await db.evidenciasPendientes
      .where("auditoriaId")
      .equals(auditoriaId)
      .toArray();
  },

  async eliminar(identificadorCliente) {
    const registro = await this.obtener(identificadorCliente);
    if (registro) {
      await db.evidenciasPendientes.delete(registro.id);
    }
  },

  async limpiarAuditoria(auditoriaId) {
    return await db.evidenciasPendientes
      .where("auditoriaId")
      .equals(auditoriaId)
      .delete();
  },
};
