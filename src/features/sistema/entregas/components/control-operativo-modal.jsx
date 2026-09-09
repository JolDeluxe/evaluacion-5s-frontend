import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { cn } from '@/utils/cn';

export function ControlOperativoModal({
  isOpen,
  onClose,
  modo = 'pausar',
  controlOperativo,
  onConfirmar,
  cargando,
}) {
  const [motivo, setMotivo] = useState('');
  const esPausa = modo === 'pausar';
  const preflight = controlOperativo?.preflight;
  const bloqueadoPorPruebas = Boolean(preflight?.bloqueadoPorPruebas);

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!esPausa && bloqueadoPorPruebas) return;
    onConfirmar(motivo.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader
        title={esPausa ? 'Pausar Envíos Automáticos' : 'Reanudar Envíos Automáticos'}
        description={
          esPausa
            ? 'Detén inmediatamente el despacho de correos automáticos en el worker.'
            : 'Revisa el impacto previo antes de activar el despacho de correos.'
        }
        onClose={onClose}
      />

      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-4">
          {esPausa ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <Icon name="pause_circle" size="sm" className="text-amber-700" />
                <span>Efecto de la pausa técnica:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                <li>El worker <strong>NO despachará correos</strong> hacia los destinatarios.</li>
                <li>Los reconciliadores seguirán registrando obligaciones en cola como <strong>PENDIENTE</strong>.</li>
                <li>Las entregas no se perderán ni fallarán; esperarán a la reactivación.</li>
              </ul>
            </div>
          ) : (
            <>
              {/* Bloqueo preventivo si hay @example.test pendientes */}
              {bloqueadoPorPruebas && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50/80 p-4 text-xs text-rose-950 space-y-2">
                  <div className="flex items-center gap-2 font-black text-rose-700">
                    <Icon name="error" size="sm" />
                    <span>Reanudación Bloqueada por Seguridad</span>
                  </div>
                  <p className="font-semibold text-rose-900 leading-relaxed">
                    Existen <strong>{preflight?.pendientesExampleTest} entregas pendientes</strong> dirigidas a dominios de prueba (<code>@example.test</code>).
                  </p>
                  <p className="text-rose-800">
                    Para evitar envíos erróneos o saturación del servidor SMTP, debes <strong>cancelar</strong> estas entregas desde la tabla antes de reanudar el sistema.
                  </p>
                </div>
              )}

              {/* Resumen del Preflight de Impacto */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Impacto Estimado al Reanudar
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {preflight?.pendientes ?? 0} correos listos en cola
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/80 bg-white p-2.5 shadow-sm space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Asignaciones</span>
                    <p className="text-base font-black text-slate-900">
                      {preflight?.pendientesPorTipo?.asignaciones ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white p-2.5 shadow-sm space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Recordatorios</span>
                    <p className="text-base font-black text-slate-900">
                      {preflight?.pendientesPorTipo?.recordatorios ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white p-2.5 shadow-sm space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resultados</span>
                    <p className="text-base font-black text-slate-900">
                      {preflight?.pendientesPorTipo?.resultados ?? 0}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white p-2.5 shadow-sm space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Otros / Avisos</span>
                    <p className="text-base font-black text-slate-900">
                      {preflight?.pendientesPorTipo?.otros ?? 0}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-medium">
                  El proveedor despachará 1 correo cada 3 segundos respetando el rate limiting configurado.
                </p>
              </div>
            </>
          )}

          {/* Campo de Motivo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Motivo u Observación (Opcional)
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={
                esPausa
                  ? 'Ej. Pausa por mantenimiento en servidor de correo'
                  : 'Ej. Activación tras depurar cola de prueba'
              }
              maxLength={250}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400"
            />
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={cargando}
          >
            Volver
          </Button>

          <Button
            type="submit"
            variant={esPausa ? 'danger' : 'primary'}
            size="sm"
            disabled={cargando || (!esPausa && bloqueadoPorPruebas)}
            icon={esPausa ? 'pause' : 'play_arrow'}
          >
            {cargando
              ? 'Guardando...'
              : esPausa
              ? 'Confirmar Pausa'
              : 'Confirmar y Reanudar'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
