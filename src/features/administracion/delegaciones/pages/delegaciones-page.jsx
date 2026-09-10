import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Select } from '@/components/form/select';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { AdministracionNav } from '@/features/administracion/components/administracion-nav';
import { delegacionesApi } from '@/features/administracion/delegaciones/api/delegaciones-api';
import { usuariosApi } from '@/features/administracion/usuarios/api/usuarios-api';
import { notify } from '@/components/notification/adaptive-notify';

export function DelegacionesPage() {
  const [delegaciones, setDelegaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const [form, setForm] = useState({
    ejecutorId: '',
    responsableId: '',
    vigenteDesde: new Date().toISOString().slice(0, 10),
    vigenteHasta: '',
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [delRes, usrRes] = await Promise.all([
        delegacionesApi.listar(),
        usuariosApi.listar({ activos: true }),
      ]);
      setDelegaciones(delRes || []);
      setUsuarios(usrRes || []);
    } catch (err) {
      notify.error(err?.message || 'Error al cargar delegaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const auditoresDisponibles = usuarios.filter((u) => ['SUPER_ADMIN', 'ADMINISTRADOR', 'AUDITOR'].includes(u.rol));

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!form.ejecutorId || !form.responsableId) {
      setErrorModal('Debes seleccionar tanto el ejecutor como el responsable');
      return;
    }
    if (form.ejecutorId === form.responsableId) {
      setErrorModal('El ejecutor y el responsable no pueden ser el mismo usuario');
      return;
    }

    setGuardando(true);
    setErrorModal('');
    try {
      await delegacionesApi.crear({
        ejecutorId: Number(form.ejecutorId),
        responsableId: Number(form.responsableId),
        vigenteDesde: new Date(form.vigenteDesde),
        vigenteHasta: form.vigenteHasta ? new Date(form.vigenteHasta) : null,
        activa: true,
      });
      notify.success('Delegación de cumplimiento creada con éxito');
      setModalAbierto(false);
      setForm({
        ejecutorId: '',
        responsableId: '',
        vigenteDesde: new Date().toISOString().slice(0, 10),
        vigenteHasta: '',
      });
      await cargarDatos();
    } catch (err) {
      setErrorModal(err?.message || 'Error al crear la delegación');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActiva = async (del) => {
    try {
      await delegacionesApi.actualizar(del.id, { activa: !del.activa });
      notify.success('Estado de la delegación actualizado');
      await cargarDatos();
    } catch (err) {
      notify.error(err?.message || 'No se pudo actualizar la delegación');
    }
  };

  const handleEliminar = async (id) => {
    try {
      await delegacionesApi.eliminar(id);
      notify.success('Delegación eliminada');
      await cargarDatos();
    } catch (err) {
      notify.error(err?.message || 'No se pudo eliminar la delegación');
    }
  };

  return (
    <div className="space-y-6">
      <AdministracionNav />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Delegaciones de Cumplimiento
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Configura qué usuario asume la responsabilidad del KPI cuando otro auditor ejecuta la auditoría.
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorModal('');
            setModalAbierto(true);
          }}
          icon="add"
          size="sm"
        >
          Nueva delegación
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <Spinner size="lg" className="mx-auto" />
        </div>
      ) : delegaciones.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-12 text-center shadow-sm">
          <Icon name="swap_horiz" size="xl" className="mx-auto text-slate-400 mb-2" />
          <h3 className="text-base font-black text-slate-800">No hay delegaciones configuradas</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Por defecto, el auditor asignado responde personalmente por su propio KPI. Si un auditor apoya a otro, puedes crear una delegación aquí.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 shadow-xl backdrop-blur-xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/70 bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Auditor Ejecutor</th>
                <th className="px-4 py-3.5">Responsable del KPI</th>
                <th className="px-4 py-3.5">Vigencia</th>
                <th className="px-4 py-3.5 text-center">Estado</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delegaciones.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="font-black text-slate-900 leading-snug">
                      {d.ejecutor?.nombre}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {d.ejecutor?.nombreUsuario} · {d.ejecutor?.rol}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-black text-indigo-950 leading-snug">
                      {d.responsable?.nombre}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {d.responsable?.nombreUsuario} · {d.responsable?.rol}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                    <span>Desde: {new Date(d.vigenteDesde).toLocaleDateString()}</span>
                    {d.vigenteHasta && (
                      <span className="block text-[11px] text-slate-400">
                        Hasta: {new Date(d.vigenteHasta).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ' + (
                        d.activa
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      )}
                    >
                      {d.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleToggleActiva(d)}
                    >
                      {d.activa ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => handleEliminar(d.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear Delegación */}
      {modalAbierto && (
        <Modal isOpen onClose={() => setModalAbierto(false)} className="max-w-md">
          <ModalHeader onClose={() => setModalAbierto(false)}>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">Configuración</p>
              <h2 className="text-lg font-black text-slate-900">Nueva Delegación</h2>
            </div>
          </ModalHeader>
          <form onSubmit={handleCrear}>
            <ModalBody className="space-y-4">
              {errorModal && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                  {errorModal}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Auditor Ejecutor (quien realiza la auditoría)</Label>
                <Select
                  value={form.ejecutorId}
                  onChange={(e) => setForm((p) => ({ ...p, ejecutorId: e.target.value }))}
                  required
                >
                  <option value="">Selecciona auditor ejecutor...</option>
                  {auditoresDisponibles.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.nombreUsuario})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Responsable del KPI (en quien repercute)</Label>
                <Select
                  value={form.responsableId}
                  onChange={(e) => setForm((p) => ({ ...p, responsableId: e.target.value }))}
                  required
                >
                  <option value="">Selecciona responsable del KPI...</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.nombreUsuario})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Vigente Desde</Label>
                  <Input
                    type="date"
                    value={form.vigenteDesde}
                    onChange={(e) => setForm((p) => ({ ...p, vigenteDesde: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Vigente Hasta (opcional)</Label>
                  <Input
                    type="date"
                    value={form.vigenteHasta}
                    onChange={(e) => setForm((p) => ({ ...p, vigenteHasta: e.target.value }))}
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="ghost" onClick={() => setModalAbierto(false)} disabled={guardando}>
                Cancelar
              </Button>
              <Button type="submit" variant="default" isLoading={guardando}>
                Guardar Delegación
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </div>
  );
}
