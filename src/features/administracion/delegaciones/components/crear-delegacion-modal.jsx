import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Select } from '@/components/form/select';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export function CrearDelegacionModal({
  isOpen,
  onClose,
  onGuardar,
  usuarios = [],
  guardando = false,
  error = '',
}) {
  const [form, setForm] = useState({
    ejecutorId: '',
    responsableId: '',
    vigenteDesde: new Date().toISOString().slice(0, 10),
    vigenteHasta: '',
  });

  const listaUsuarios = Array.isArray(usuarios) ? usuarios : [];
  const auditoresDisponibles = listaUsuarios.filter((u) =>
    ['SUPER_ADMIN', 'ADMINISTRADOR', 'AUDITOR'].includes(u.rol)
  );

  const esMismaPersona = Boolean(
    form.ejecutorId && form.responsableId && form.ejecutorId === form.responsableId
  );

  const camposIncompletos = !form.ejecutorId || !form.responsableId || !form.vigenteDesde;
  const isSubmitDisabled = guardando || camposIncompletos || esMismaPersona;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;
    onGuardar({
      ejecutorId: Number(form.ejecutorId),
      responsableId: Number(form.responsableId),
      vigenteDesde: new Date(form.vigenteDesde),
      vigenteHasta: form.vigenteHasta ? new Date(form.vigenteHasta) : null,
      activa: true,
    });
  };

  const handleClose = () => {
    setForm({
      ejecutorId: '',
      responsableId: '',
      vigenteDesde: new Date().toISOString().slice(0, 10),
      vigenteHasta: '',
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <ModalHeader onClose={handleClose}>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-indigo-600">Configuración</p>
          <h2 className="text-lg font-black text-slate-900">Nueva Delegación</h2>
        </div>
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          {esMismaPersona && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800 flex items-start gap-2">
              <Icon name="warning" size="xs" className="text-amber-600 shrink-0 mt-0.5" />
              <span>El auditor ejecutor y el responsable del KPI no pueden ser la misma persona.</span>
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
          <Button type="button" variant="ghost" onClick={handleClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="default" isLoading={guardando} disabled={isSubmitDisabled}>
            Guardar Delegación
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
