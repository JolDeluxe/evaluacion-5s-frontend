import Dexie from "dexie";

export const db = new Dexie("AuditoriasOfflineDB");

db.version(1).stores({
  evidenciasPendientes: "++id, auditoriaId, criterioId, identificadorCliente, [auditoriaId+criterioId]",
});

export const evidenciasOffline = {
  async guardar(auditoriaId, criterioId, identificadorCliente, fileBlob, fileName, fileType) {
    if (!identificadorCliente) return;
    // Eliminar cualquier registro previo con este mismo identificadorCliente para evitar duplicados
    await this.eliminar(identificadorCliente);
    return await db.evidenciasPendientes.add({
      auditoriaId: String(auditoriaId),
      criterioId: String(criterioId),
      identificadorCliente,
      fileBlob,
      fileName,
      fileType,
      timestamp: Date.now(),
    });
  },

  async obtener(identificadorCliente) {
    if (!identificadorCliente) return null;
    return await db.evidenciasPendientes.where("identificadorCliente").equals(identificadorCliente).first();
  },

  async obtenerPorCriterio(auditoriaId, criterioId) {
    const aid = String(auditoriaId);
    const cid = String(criterioId);
    const todos = await db.evidenciasPendientes.toArray();
    return todos.filter((r) => String(r.auditoriaId) === aid && String(r.criterioId) === cid);
  },

  async obtenerPorAuditoria(auditoriaId) {
    const aid = String(auditoriaId);
    const todos = await db.evidenciasPendientes.toArray();
    return todos.filter((r) => String(r.auditoriaId) === aid);
  },

  async eliminar(identificadorCliente) {
    if (!identificadorCliente) return;
    // Elimina TODOS los registros coincidentes en Dexie (evita residuos duplicados)
    return await db.evidenciasPendientes
      .where("identificadorCliente")
      .equals(identificadorCliente)
      .delete();
  },

  async limpiarAuditoria(auditoriaId) {
    const aid = String(auditoriaId);
    const registros = await this.obtenerPorAuditoria(aid);
    const ids = registros.map((r) => r.id).filter(Boolean);
    if (ids.length > 0) {
      return await db.evidenciasPendientes.bulkDelete(ids);
    }
  },
};
