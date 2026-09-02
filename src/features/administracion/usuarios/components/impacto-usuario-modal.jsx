import { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/form/select';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { MESES } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

const crearDecisiones = (impacto, incluirResponsabilidades) => ({
  responsabilidades: incluirResponsabilidades
    ? (impacto?.responsabilidades || []).map((item) => ({
        relacionId: item.relacionId,
        areaId: item.area.id,
        accion: 'SIN_REEMPLAZO',
        nuevoResponsableId: null,
      }))
    : [],
  auditorias: (impacto?.auditorias || []).map((grupo) => ({
    clave: grupo.clave,
    asignacionIds: grupo.asignacionIds,
    asignacionMensualId: grupo.asignacionMensual?.id ?? null,
    auditorMensualId: grupo.asignacionMensual?.auditorId ?? null,
    accion: 'PENDIENTE',
    nuevoAuditorId: null,
  })),
});

export function ImpactoUsuarioModal({
  impacto,
  modo = 'desactivar',
  saving = false,
  error = '',
  onClose,
  onConfirm,
}) {
  const incluirResponsabilidades = modo === 'desactivar';
  const [decisiones, setDecisiones] = useState(() => crearDecisiones(impacto, incluirResponsabilidades));

  useEffect(() => {
    setDecisiones(crearDecisiones(impacto, incluirResponsabilidades));
  }, [impacto, incluirResponsabilidades]);

  const auditoriasPorClave = useMemo(
    () => new Map((impacto?.auditorias || []).map((grupo) => [grupo.clave, grupo])),
    [impacto],
  );

  if (!impacto) return null;

  const actualizarResponsabilidad = (relacionId, cambios) => {
    setDecisiones((actual) => ({
      ...actual,
      responsabilidades: actual.responsabilidades.map((decision) => (
        decision.relacionId === relacionId ? { ...decision, ...cambios } : decision
      )),
    }));
  };

  const actualizarAuditoria = (clave, cambios) => {
    setDecisiones((actual) => ({
      ...actual,
      auditorias: actual.auditorias.map((decision) => (
        decision.clave === clave ? { ...decision, ...cambios } : decision
      )),
    }));
  };

  const generarPropuesta = () => {
    setDecisiones((actual) => ({
      ...actual,
      auditorias: actual.auditorias.map((decision) => {
        const sugerido = auditoriasPorClave.get(decision.clave)?.auditorSugerido;
        return sugerido
          ? { ...decision, accion: 'REASIGNAR', nuevoAuditorId: sugerido.id }
          : { ...decision, accion: 'PENDIENTE', nuevoAuditorId: null };
      }),
    }));
  };

  const faltanSelecciones = decisiones.responsabilidades.some((decision) => (
    decision.accion === 'REEMPLAZAR' && !decision.nuevoResponsableId
  )) || decisiones.auditorias.some((decision) => (
    decision.accion === 'REASIGNAR' && !decision.nuevoAuditorId
  ));

  return (
    <Modal isOpen onClose={saving ? undefined : onClose} size="lg" closeOnBackdrop={!saving}>
      <ModalHeader
        title={modo === 'desactivar' ? 'Resolver baja de usuario' : 'Resolver cambio de rol'}
        description={`Revisa qué ocurrirá con ${impacto.usuario.nombre} antes de confirmar.`}
        onClose={saving ? undefined : onClose}
      />

      <ModalBody className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {incluirResponsabilidades && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="corporate_fare" size="20px" className="text-marca-acento" />
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900">Responsabilidades de áreas</h3>
                <p className="text-xs font-semibold text-slate-500">Puedes reemplazar a la persona o retirar su relación sin bloquear la baja.</p>
              </div>
            </div>

            {impacto.responsabilidades.length === 0 ? (
              <p className="border-t border-slate-100 py-3 text-sm font-semibold text-slate-500">No tiene áreas bajo su responsabilidad.</p>
            ) : (
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {impacto.responsabilidades.map((item) => {
                  const decision = decisiones.responsabilidades.find((actual) => actual.relacionId === item.relacionId);
                  return (
                    <div key={item.relacionId} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(15rem,1fr)] md:items-center">
                      <div>
                        <p className="text-sm font-black uppercase text-slate-900">{item.area.nombre}</p>
                        <p className="text-xs font-semibold text-slate-500">
                          {item.otrosResponsables.length
                            ? `${item.otrosResponsables.length} responsable(s) activo(s) adicional(es)`
                            : 'Esta área quedará sin responsable activo si no eliges reemplazo.'}
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Select
                          value={decision?.accion || 'SIN_REEMPLAZO'}
                          onChange={(event) => actualizarResponsabilidad(item.relacionId, {
                            accion: event.target.value,
                            nuevoResponsableId: null,
                          })}
                        >
                          <option value="SIN_REEMPLAZO">Retirar sin reemplazo</option>
                          <option value="REEMPLAZAR">Elegir reemplazo</option>
                        </Select>
                        {decision?.accion === 'REEMPLAZAR' && (
                          <Select
                            value={decision.nuevoResponsableId || ''}
                            onChange={(event) => actualizarResponsabilidad(item.relacionId, {
                              nuevoResponsableId: event.target.value ? Number(event.target.value) : null,
                            })}
                          >
                            <option value="">Selecciona persona</option>
                            {item.candidatos.map((persona) => (
                              <option key={persona.id} value={persona.id}>{persona.nombre}</option>
                            ))}
                          </Select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon name="assignment_ind" size="20px" className="text-marca-acento" />
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900">Auditorías pendientes</h3>
                <p className="text-xs font-semibold text-slate-500">La decisión se aplica solo a periodos vigentes, en gracia o reabiertos.</p>
              </div>
            </div>
            {impacto.auditorias.length > 0 && (
              <Button type="button" variant="outline" size="sm" icon="auto_awesome" onClick={generarPropuesta}>
                Generar propuesta
              </Button>
            )}
          </div>

          {impacto.auditorias.length === 0 ? (
            <p className="border-t border-slate-100 py-3 text-sm font-semibold text-slate-500">No tiene auditorías que requieran sustitución.</p>
          ) : (
            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {impacto.auditorias.map((grupo) => {
                const decision = decisiones.auditorias.find((actual) => actual.clave === grupo.clave);
                return (
                  <div key={grupo.clave} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(15rem,1fr)] md:items-center">
                    <div>
                      <p className="text-sm font-black uppercase text-slate-900">{grupo.area.nombre}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {MESES[grupo.mes - 1]} {grupo.anio} · {grupo.periodos.map((periodo) => `P${periodo.periodo}`).join(' y ')}
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select
                        value={decision?.accion || 'PENDIENTE'}
                        onChange={(event) => actualizarAuditoria(grupo.clave, {
                          accion: event.target.value,
                          nuevoAuditorId: null,
                        })}
                      >
                        <option value="PENDIENTE">Dejar por reasignar</option>
                        <option value="REASIGNAR">Asignar sustituto</option>
                      </Select>
                      {decision?.accion === 'REASIGNAR' && (
                        <Select
                          value={decision.nuevoAuditorId || ''}
                          onChange={(event) => actualizarAuditoria(grupo.clave, {
                            nuevoAuditorId: event.target.value ? Number(event.target.value) : null,
                          })}
                        >
                          <option value="">Selecciona auditor</option>
                          {grupo.candidatos.map((auditor) => (
                            <option key={auditor.id} value={auditor.id}>
                              {auditor.nombre} · {auditor.areasAsignadas} área(s)
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-start gap-2">
            <Icon name="history" size="20px" className="mt-0.5 text-emerald-700" />
            <div>
              <h3 className="text-sm font-black uppercase text-emerald-950">Información histórica que se conservará</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-emerald-900/80">
                {impacto.historico.completadas} auditoría(s) completada(s) y {impacto.historico.vencidas} cierre(s) definitivo(s) conservarán su auditor original y sus resultados.
              </p>
            </div>
          </div>
        </section>
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="cancelar" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          type="button"
          variant="guardar"
          icon={modo === 'desactivar' ? 'person_remove' : 'manage_accounts'}
          isLoading={saving}
          disabled={faltanSelecciones}
          onClick={() => onConfirm(decisiones)}
        >
          {modo === 'desactivar' ? 'Confirmar baja' : 'Confirmar cambio de rol'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
