import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { SelectAuditor } from '@/features/administracion/asignaciones/components/select-auditor';
import { MESES } from '@/features/administracion/asignaciones/utils/asignaciones-utils';
import { apiClient } from '@/lib/api/api-client';

export function AutoasignacionModal({
  anio,
  mes,
  auditores,
  onClose,
  onConfirmed,
}) {
  const [status, setStatus] = useState('generating'); // 'generating' | 'review' | 'submitting' | 'done' | 'error'
  const [propuestas, setPropuestas] = useState([]);
  const [sinCandidato, setSinCandidato] = useState([]);
  const [auditoresDisponibles, setAuditoresDisponibles] = useState(auditores || []);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultadoConfirmacion, setResultadoConfirmacion] = useState(null);

  useEffect(() => {
    let active = true;

    async function fetchPropuesta() {
      setStatus('generating');
      setErrorMsg('');

      try {
        const res = await apiClient.post('/asignaciones/mensual/autoasignar/propuesta', { anio, mes });
        if (!active) return;
        const data = res?.datos ?? res;
        setPropuestas(data.propuestas || []);
        setSinCandidato(data.sinCandidato || []);
        if (data.auditoresDisponibles?.length) setAuditoresDisponibles(data.auditoresDisponibles);
        setStatus('review');
      } catch (err) {
        if (!active) return;
        setErrorMsg(err?.message || 'Error al generar la propuesta de autoasignación.');
        setStatus('error');
      }
    }

    fetchPropuesta();

    return () => {
      active = false;
    };
  }, [anio, mes]);

  const handleAuditorChange = (areaId, newAuditorId) => {
    setPropuestas((prev) =>
      prev.map((item) => {
        if (item.area.id !== areaId) return item;
        const nuevoAuditor = auditoresDisponibles.find((a) => a.id === Number(newAuditorId)) || null;
        return { ...item, auditor: nuevoAuditor };
      }),
    );
  };

  const handleConfirmar = async () => {
    const validAsignaciones = propuestas
      .filter((p) => p.auditor?.id)
      .map((p) => ({ areaId: p.area.id, auditorId: p.auditor.id }));

    if (!validAsignaciones.length) {
      setErrorMsg('No hay asignaciones para confirmar.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await apiClient.post('/asignaciones/mensual/autoasignar/confirmar', {
        anio,
        mes,
        asignaciones: validAsignaciones,
      });
      const data = res?.datos ?? res;
      setResultadoConfirmacion(data.confirmacion ?? null);
      setStatus('done');
      onConfirmed();
    } catch (err) {
      setErrorMsg(err?.message || 'No se pudieron guardar los cambios de autoasignación.');
      setStatus('review');
    }
  };

  const asignadasCount = propuestas.filter((p) => p.auditor?.id).length;
  const sinAuditorCount = propuestas.filter((p) => !p.auditor?.id).length;

  return (
    <Modal isOpen onClose={status === 'generating' || status === 'submitting' ? () => {} : onClose} className="max-w-3xl">
      <ModalHeader onClose={status === 'generating' || status === 'submitting' ? null : onClose}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">
            Autoasignación · {MESES[mes - 1]} {anio}
          </p>
          <h2 className="text-xl font-black text-slate-950">
            {status === 'generating' && 'Generando propuesta…'}
            {status === 'submitting' && 'Guardando cambios…'}
            {status === 'review' && 'Revisar propuesta de asignación'}
            {status === 'done' && 'Autoasignación completada'}
            {status === 'error' && 'Error en autoasignación'}
          </h2>
        </div>
      </ModalHeader>

      <ModalBody className="max-h-[65vh] overflow-y-auto space-y-4">
        {/* Loading state */}
        {(status === 'generating' || status === 'submitting') && (
          <div className="py-10 text-center space-y-3">
            <Spinner className="mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {status === 'generating' ? 'Distribuyendo áreas pendientes entre auditores disponibles…' : 'Persistiendo las asignaciones de forma segura…'}
            </p>
            <p className="text-xs font-semibold text-slate-400">Esto puede tomar un momento.</p>
          </div>
        )}

        {/* Error state */}
        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Success state */}
        {status === 'done' && (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-black text-xl">
              ✓
            </div>
            <h3 className="text-base font-black text-slate-900">¡Asignaciones aplicadas con éxito!</h3>
            <p className="text-xs font-semibold text-slate-600">
              Se han registrado {resultadoConfirmacion?.guardadas ?? asignadasCount} {(resultadoConfirmacion?.guardadas ?? asignadasCount) === 1 ? 'área asignada' : 'áreas asignadas'}.
            </p>
            {resultadoConfirmacion?.omitidas > 0 && <p className="text-xs font-bold text-amber-700">{resultadoConfirmacion.omitidas} asignaciones ya habían sido atendidas por otro administrador y no fueron modificadas.</p>}
          </div>
        )}

        {/* Review state */}
        {status === 'review' && (
          <>
            <div className="rounded-xl border border-app-border bg-slate-50/70 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
              <span className="text-slate-700">
                Propuesta: <strong className="text-emerald-700 font-bold">{asignadasCount} áreas listas para asignar</strong>
              </span>
              {sinAuditorCount > 0 && (
                <span className="text-amber-700 font-bold">{sinAuditorCount} sin candidato</span>
              )}
            </div>

            {/* Áreas sin candidato */}
            {sinCandidato.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <span>!</span>
                  <span>{sinCandidato.length} {sinCandidato.length === 1 ? 'área requiere' : 'áreas requieren'} asignación manual</span>
                </div>
                <p className="text-xs font-medium text-amber-800">
                  No se encontró un auditor elegible que no pertenezca ni sea responsable de estas áreas:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sinCandidato.map((sc) => (
                    <span key={sc.area?.id || sc.id} className="rounded-md border border-amber-300 bg-white px-2 py-0.5 text-xs font-bold uppercase text-amber-900">
                      {sc.area?.nombre || sc.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de propuestas */}
            {propuestas.length > 0 ? (
              <div className="divide-y divide-app-border rounded-xl border border-app-border bg-white overflow-hidden">
                <div className="hidden sm:grid sm:grid-cols-[50%_50%] bg-slate-50/70 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  <div>Área</div>
                  <div>Auditor propuesto</div>
                </div>

                <div className="divide-y divide-app-border max-h-[40vh] overflow-y-auto">
                  {propuestas.map((item) => (
                    <div key={item.area.id} className="p-3 sm:px-4 sm:py-3 grid gap-2 sm:grid-cols-[50%_50%] sm:items-center hover:bg-slate-50/50">
                      <div>
                        <p className="text-xs sm:text-sm font-black uppercase text-slate-900">{item.area.nombre}</p>
                      </div>

                      <div>
                        <SelectAuditor
                          value={item.auditor?.id ?? ''}
                          onChange={(val) => handleAuditorChange(item.area.id, val)}
                          auditores={auditoresDisponibles}
                          responsablesIds={item.area.responsablesIds}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-xs font-semibold text-slate-500">
                Todas las áreas activas ya cuentan con auditor asignado.
              </p>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter>
        {status === 'review' && (
          <>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="default"
              icon="check"
              disabled={!asignadasCount}
              onClick={handleConfirmar}
            >
              Confirmar asignaciones ({asignadasCount})
            </Button>
          </>
        )}

        {(status === 'done' || status === 'error') && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
