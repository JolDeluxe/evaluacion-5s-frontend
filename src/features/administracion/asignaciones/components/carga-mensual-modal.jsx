import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Icon } from '@/components/ui/icon';
import { MESES } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function CargaMensualModal({ auditores, anio, mes, onClose }) {
  const [busqueda, setBusqueda] = useState('');

  const ordenados = [...auditores].sort((a, b) => (
    b.areasAsignadas - a.areasAsignadas
    || a.nombre.localeCompare(b.nombre, 'es-MX')
  ));

  const q = busqueda.trim().toLowerCase();
  const filtrados = ordenados.filter((auditor) => (
    !q || auditor.nombre.toLowerCase().includes(q) || auditor.nombreUsuario.toLowerCase().includes(q)
  ));

  const totalConCarga = auditores.filter((a) => a.areasAsignadas > 0).length;
  const totalSinCarga = auditores.filter((a) => a.areasAsignadas === 0).length;

  return (
    <Modal isOpen onClose={onClose} className="max-w-2xl">
      <ModalHeader onClose={onClose}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">
            {MESES[mes - 1]} {anio}
          </p>
          <h2 className="text-xl font-black text-slate-950">Carga del mes — Todos los auditores</h2>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            {totalConCarga} {totalConCarga === 1 ? 'con asignaciones' : 'con asignaciones'} · {totalSinCarga} sin asignaciones
          </p>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-3">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar auditor por nombre…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold outline-none focus:border-marca-secundario"
          />
        </div>

        <div className="max-h-[55vh] overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          <div className="bg-slate-100 px-4 py-2 text-[11px] font-black uppercase text-slate-500 flex items-center justify-between sticky top-0 z-10">
            <span>Auditor</span>
            <span>Áreas asignadas</span>
          </div>

          {filtrados.map((auditor) => {
            const tieneCarga = auditor.areasAsignadas > 0;
            return (
              <div key={auditor.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-black text-slate-900">{auditor.nombre}</p>
                  <p className="text-xs font-semibold text-slate-400">@{auditor.nombreUsuario}</p>
                </div>
                <div>
                  {tieneCarga ? (
                    <span className="rounded-md bg-marca-secundario/10 px-2.5 py-1 text-xs font-black text-marca-secundario">
                      {auditor.areasAsignadas} {auditor.areasAsignadas === 1 ? 'área' : 'áreas'}
                    </span>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-400">
                      Sin asignaciones
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {!filtrados.length && (
            <p className="p-6 text-center text-xs font-bold text-slate-500">
              No se encontraron auditores con la búsqueda "{busqueda}".
            </p>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="cancelar" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
}