import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { AdministracionNav } from '@/features/administracion/components/administracion-nav';
import { delegacionesApi } from '@/features/administracion/delegaciones/api/delegaciones-api';
import { usuariosApi } from '@/features/administracion/usuarios/api/usuarios-api';
import { notify } from '@/components/notification/adaptive-notify';
import { DelegacionesTable } from '@/features/administracion/delegaciones/components/delegaciones-table';
import { CrearDelegacionModal } from '@/features/administracion/delegaciones/components/crear-delegacion-modal';

export function DelegacionesPage() {
  const [delegaciones, setDelegaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas' | 'activas' | 'inactivas'

  // Confirmación integrada para desactivar / eliminar
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    tipo: null, // 'toggle' | 'eliminar'
    delegacion: null,
    loading: false,
  });

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [delRes, usrRes] = await Promise.all([
        delegacionesApi.listar(),
        usuariosApi.listar({ activos: true }),
      ]);
      setDelegaciones(Array.isArray(delRes?.datos) ? delRes.datos : Array.isArray(delRes) ? delRes : []);
      const listaUsuarios = Array.isArray(usrRes?.datos)
        ? usrRes.datos
        : Array.isArray(usrRes)
        ? usrRes
        : [];
      setUsuarios(listaUsuarios);
    } catch (err) {
      notify.error(err?.message || 'Error al cargar delegaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrear = async (payload) => {
    setGuardando(true);
    setErrorModal('');
    try {
      await delegacionesApi.crear(payload);
      notify.success('Delegación de cumplimiento creada con éxito');
      setModalAbierto(false);
      await cargarDatos();
    } catch (err) {
      setErrorModal(err?.message || 'Error al crear la delegación');
    } finally {
      setGuardando(false);
    }
  };

  const handleSolicitarToggle = (del) => {
    setConfirmModal({
      isOpen: true,
      tipo: 'toggle',
      delegacion: del,
      loading: false,
    });
  };

  const handleSolicitarEliminar = (del) => {
    setConfirmModal({
      isOpen: true,
      tipo: 'eliminar',
      delegacion: del,
      loading: false,
    });
  };

  const handleConfirmarAccion = async () => {
    const { tipo, delegacion } = confirmModal;
    if (!delegacion) return;

    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      if (tipo === 'toggle') {
        await delegacionesApi.actualizar(delegacion.id, { activa: !delegacion.activa });
        notify.success(`Delegación ${delegacion.activa ? 'desactivada' : 'reactivada'} con éxito`);
      } else if (tipo === 'eliminar') {
        await delegacionesApi.eliminar(delegacion.id);
        notify.success('Delegación eliminada con éxito');
      }
      setConfirmModal({ isOpen: false, tipo: null, delegacion: null, loading: false });
      await cargarDatos();
    } catch (err) {
      notify.error(err?.message || 'Ocurrió un error al procesar la acción');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const delegacionesFiltradas = useMemo(() => {
    if (filtroEstado === 'activas') return delegaciones.filter((d) => d.activa);
    if (filtroEstado === 'inactivas') return delegaciones.filter((d) => !d.activa);
    return delegaciones;
  }, [delegaciones, filtroEstado]);

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
          Nueva Delegación
        </Button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-500">Filtrar por:</span>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setFiltroEstado('todas')}
            className={`rounded-md px-3 py-1 text-xs font-black transition ${
              filtroEstado === 'todas'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Todas ({delegaciones.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('activas')}
            className={`rounded-md px-3 py-1 text-xs font-black transition ${
              filtroEstado === 'activas'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Solo Activas ({delegaciones.filter((d) => d.activa).length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroEstado('inactivas')}
            className={`rounded-md px-3 py-1 text-xs font-black transition ${
              filtroEstado === 'inactivas'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Inactivas ({delegaciones.filter((d) => !d.activa).length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <Spinner size="lg" className="mx-auto" />
        </div>
      ) : (
        <DelegacionesTable
          delegaciones={delegacionesFiltradas}
          onToggleActiva={handleSolicitarToggle}
          onEliminar={handleSolicitarEliminar}
        />
      )}

      {/* Modal Crear Delegación */}
      <CrearDelegacionModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardar={handleCrear}
        usuarios={usuarios}
        guardando={guardando}
        error={errorModal}
      />

      {/* Modal de confirmación integrado (Cero window.confirm) */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          !confirmModal.loading &&
          setConfirmModal({ isOpen: false, tipo: null, delegacion: null, loading: false })
        }
        className="max-w-md"
      >
        <ModalHeader
          onClose={() =>
            !confirmModal.loading &&
            setConfirmModal({ isOpen: false, tipo: null, delegacion: null, loading: false })
          }
        >
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-600">
              Confirmar Acción
            </p>
            <h2 className="text-lg font-black text-slate-900">
              {confirmModal.tipo === 'eliminar'
                ? 'Eliminar Delegación'
                : confirmModal.delegacion?.activa
                ? 'Desactivar Delegación'
                : 'Reactivar Delegación'}
            </h2>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            {confirmModal.tipo === 'eliminar' ? (
              <>
                ¿Estás seguro de que deseas eliminar permanentemente la delegación de{' '}
                <strong className="text-slate-900">{confirmModal.delegacion?.ejecutor?.nombre}</strong>{' '}
                hacia{' '}
                <strong className="text-slate-900">{confirmModal.delegacion?.responsable?.nombre}</strong>?
                Esta acción no se puede deshacer.
              </>
            ) : confirmModal.delegacion?.activa ? (
              <>
                ¿Deseas desactivar la delegación? El auditor ejecutor volverá a responder por su propio KPI a partir de este momento.
              </>
            ) : (
              <>
                ¿Deseas reactivar esta delegación de cumplimiento?
              </>
            )}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setConfirmModal({ isOpen: false, tipo: null, delegacion: null, loading: false })
            }
            disabled={confirmModal.loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant={confirmModal.tipo === 'eliminar' ? 'destructive' : 'default'}
            onClick={handleConfirmarAccion}
            isLoading={confirmModal.loading}
          >
            {confirmModal.tipo === 'eliminar'
              ? 'Eliminar'
              : confirmModal.delegacion?.activa
              ? 'Desactivar'
              : 'Reactivar'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
