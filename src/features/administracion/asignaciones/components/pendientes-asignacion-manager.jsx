import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ROLES } from '@/config/navigation-config';
import { asignacionesApi } from '@/features/administracion/asignaciones/api/asignaciones-api';
import { AutoasignacionModal } from '@/features/administracion/asignaciones/components/autoasignacion-modal';
import { MESES } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function PendientesAsignacionManager() {
  const { user } = useAuth();
  const [pendientes, setPendientes] = useState([]);
  const [showNotice, setShowNotice] = useState(false);
  const [showAutoasignacion, setShowAutoasignacion] = useState(false);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [error, setError] = useState(false);
  const ahora = useMemo(() => new Date(), []);
  const anio = ahora.getFullYear();
  const mes = ahora.getMonth() + 1;
  const esAdmin = user?.rol === ROLES.ADMINISTRADOR || user?.rol === ROLES.SUPER_ADMIN;
  const sessionKey = `encuestas-5s:reasignacion-pospuesta:${user?.id}:${anio}-${mes}`;

  const cargar = useCallback(async ({ abrir = false } = {}) => {
    if (!esAdmin) return;
    try {
      const data = await asignacionesApi.pendientes();
      setPendientes(data.pendientes ?? []);
      setError(false);
      if (data.total > 0 && (abrir || !sessionStorage.getItem(sessionKey))) setShowNotice(true);
    } catch {
      setError(true);
    }
  }, [esAdmin, sessionKey]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    const onPendientesCambiaron = () => cargar({ abrir: true });
    window.addEventListener('asignaciones:pendientes-cambiaron', onPendientesCambiaron);
    return () => window.removeEventListener('asignaciones:pendientes-cambiaron', onPendientesCambiaron);
  }, [cargar]);

  if (!esAdmin || (!pendientes.length && !showNotice && !showAutoasignacion && !error)) return null;

  const grupos = Object.values(pendientes.reduce((acumulado, pendiente) => {
    const key = `${pendiente.anio}-${pendiente.mes}`;
    if (!acumulado[key]) acumulado[key] = { anio: pendiente.anio, mes: pendiente.mes, pendientes: [] };
    acumulado[key].pendientes.push(pendiente);
    return acumulado;
  }, {})).sort((a, b) => a.anio - b.anio || a.mes - b.mes);

  const posponer = () => {
    sessionStorage.setItem(sessionKey, '1');
    setShowNotice(false);
  };
  const abrirPropuesta = (grupo) => {
    setShowNotice(false);
    setGrupoSeleccionado(grupo);
    setShowAutoasignacion(true);
  };

  return (
    <>
      {pendientes.length > 0 && !showAutoasignacion && (
        <Button
          type="button"
          variant="outline"
          icon="assignment_late"
          onClick={() => setShowNotice(true)}
          className="fixed bottom-5 right-5 z-40 border-amber-300 bg-amber-50 text-amber-900 shadow-lg"
        >
          {pendientes.length} auditorías por asignar
        </Button>
      )}
      {error && (
        <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 shadow-lg">
          <span>No fue posible comprobar las asignaciones pendientes.</span>
          <button type="button" onClick={() => cargar()} className="underline">Reintentar</button>
        </div>
      )}

      <Modal isOpen={showNotice} onClose={posponer} className="max-w-xl">
        <ModalHeader onClose={posponer}>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">Asignaciones pendientes</p>
            <h2 className="text-xl font-black text-slate-950">{pendientes.length} auditorías necesitan auditor</h2>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-sm font-semibold leading-6 text-slate-600">Revisa la propuesta antes de confirmar. Las asignaciones ya atendidas por otra persona se conservarán.</p>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {grupos.map((grupo) => (
              <button key={`${grupo.anio}-${grupo.mes}`} type="button" onClick={() => abrirPropuesta(grupo)} className="w-full rounded-xl border border-app-border bg-white px-3 py-2.5 text-left hover:border-marca-secundario">
                <p className="text-sm font-black text-slate-900">{grupo.pendientes.length} pendientes · {MESES[grupo.mes - 1]} {grupo.anio}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{grupo.pendientes.slice(0, 2).map((item) => `${item.area.nombre} · P${item.periodo}`).join(' · ')}{grupo.pendientes.length > 2 ? '…' : ''}</p>
              </button>
            ))}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={posponer}>Posponer</Button>
          <Button type="button" variant="default" icon="auto_fix_high" onClick={() => abrirPropuesta(grupos[0])}>Revisar primer grupo</Button>
        </ModalFooter>
      </Modal>

      {showAutoasignacion && (
        <AutoasignacionModal
          anio={grupoSeleccionado?.anio ?? anio}
          mes={grupoSeleccionado?.mes ?? mes}
          auditores={[]}
          onClose={() => { setShowAutoasignacion(false); setGrupoSeleccionado(null); cargar(); }}
          onConfirmed={() => { setShowAutoasignacion(false); setGrupoSeleccionado(null); cargar({ abrir: true }); }}
        />
      )}
    </>
  );
}
