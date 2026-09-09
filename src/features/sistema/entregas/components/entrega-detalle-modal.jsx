import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { CanalBadge } from './canal-badge';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { interpretarErrorEntrega } from '../utils/interpretar-error-entrega';

const estadoBadgeMap = {
  ENVIADA: { status: 'success', label: 'Enviada' },
  PENDIENTE: { status: 'info', label: 'Pendiente' },
  PROCESANDO: { status: 'warning', label: 'Procesando' },
  FALLIDA: { status: 'danger', label: 'Fallida' },
  CANCELADA: { status: 'neutral', label: 'Cancelada' },
};

const formatFecha = (fechaStr) => {
  if (!fechaStr) return '—';
  try {
    const d = new Date(fechaStr);
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
};

export function EntregaDetalleModal({
  isOpen,
  onClose,
  entrega,
  cargando,
  onCancelar,
  onReintentar,
  onReenviar,
  onVerCorreo,
}) {
  const { user } = useAuth();
  const esSuperAdmin = user?.rol === 'SUPER_ADMIN';

  if (!isOpen) return null;

  const badgeInfo = entrega ? (estadoBadgeMap[entrega.estado] || { status: 'neutral', label: entrega.estado }) : null;
  const esPrueba = Boolean(entrega?.esDestinatarioPrueba || entrega?.destinoSnapshot?.includes('example.test'));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title={entrega ? `Detalle de Entrega #${entrega.id}` : 'Detalle de Entrega'}
        description="Auditoría técnica de despacho, estado en cola e historial de intentos."
        onClose={onClose}
      />

      <ModalBody className="space-y-5">
        {cargando || !entrega ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Spinner size="md" />
            <span className="text-xs font-bold">Cargando trazabilidad de la entrega...</span>
          </div>
        ) : (
          <>
            {/* Banner de prueba si aplica */}
            {esPrueba && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-center gap-2">
                <Icon name="science" size="sm" className="text-amber-700 shrink-0" />
                <span className="font-bold">
                  Destinatario con dominio de prueba (<code>@example.test</code>). No corresponde a un usuario real.
                </span>
              </div>
            )}

            {/* Ficha Resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Canal</span>
                <CanalBadge canal={entrega.canal} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Estado</span>
                <Badge status={badgeInfo.status}>{badgeInfo.label}</Badge>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Intentos</span>
                <span className="font-bold text-slate-800">{entrega.intentos} / 5</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Destinatario</span>
                <span className="font-bold text-slate-900 truncate block" title={entrega.destinoSnapshot}>
                  {entrega.destinoSnapshot}
                </span>
              </div>
            </div>

            {/* Trazabilidad Temporal */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Trazabilidad de Tiempos
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Creada en</span>
                  <span className="font-medium text-slate-700">{formatFecha(entrega.creadoEn)}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Programada para</span>
                  <span className="font-medium text-slate-700">{formatFecha(entrega.programadoEn)}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Enviada en</span>
                  <span className="font-medium text-slate-700">{formatFecha(entrega.enviadoEn)}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Último Intento</span>
                  <span className="font-medium text-slate-700">{formatFecha(entrega.ultimoIntentoEn)}</span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Próximo Intento</span>
                  <span className="font-medium text-slate-700">
                    {formatFecha(entrega.estado === 'CANCELADA' || entrega.estado === 'ENVIADA' ? null : entrega.proximoIntentoEn)}
                  </span>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Bloqueada hasta</span>
                  <span className="font-medium text-slate-700">{formatFecha(entrega.bloqueadoHasta)}</span>
                </div>
              </div>
            </div>

            {/* Error o Mensaje de Cancelación */}
            {entrega.ultimoError && (() => {
              const errorInfo = interpretarErrorEntrega(entrega.ultimoError, entrega.estado);
              return (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs space-y-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                      {entrega.estado === 'CANCELADA' ? 'Motivo de Cancelación' : 'Estado del Intento'}
                    </span>
                    <p className="text-rose-950 font-medium leading-relaxed mt-0.5">
                      {errorInfo.mensajeOperativo}
                    </p>
                  </div>

                  {errorInfo.detalleTecnico && esSuperAdmin && (
                    <details className="mt-2 rounded-lg border border-rose-200/80 bg-white/90 p-2.5 text-[11px] group">
                      <summary className="font-bold text-rose-800 cursor-pointer select-none flex items-center gap-1.5 hover:text-rose-900 list-none">
                        <Icon name="code" size="xs" />
                        <span>Detalle técnico (Diagnóstico interno SUPER_ADMIN)</span>
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-[10px] text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto max-h-40">
                        {errorInfo.detalleTecnico}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })()}

            {/* Información de la Notificación */}
            {entrega.notificacion && (
              <div className="rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-black uppercase tracking-wider text-marca-acento text-[10px]">
                    Notificación #{entrega.notificacion.id} · {entrega.notificacion.tipo}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[220px]" title={entrega.notificacion.claveDedupe}>
                    {entrega.notificacion.claveDedupe || 'Sin clave dedupe'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{entrega.notificacion.titulo}</p>
                  <p className="text-slate-600 leading-relaxed">{entrega.notificacion.mensaje}</p>
                </div>
                {entrega.notificacion.usuario && (
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-2 border-t border-slate-100">
                    <Icon name="person" size="xs" />
                    <span>
                      Usuario: <strong>{entrega.notificacion.usuario.nombre}</strong> (ID {entrega.notificacion.usuario.id})
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div>
            {entrega?.canal === 'CORREO' && onVerCorreo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon="visibility"
                onClick={() => {
                  onClose();
                  onVerCorreo(entrega.id);
                }}
              >
                Ver Correo
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(entrega?.estado === 'PENDIENTE' || entrega?.estado === 'FALLIDA') && onCancelar && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon="block"
                onClick={() => {
                  onClose();
                  onCancelar(entrega);
                }}
              >
                Cancelar Entrega
              </Button>
            )}

            {entrega?.estado === 'FALLIDA' && onReintentar && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon="replay"
                onClick={() => {
                  onClose();
                  onReintentar(entrega.id);
                }}
              >
                Reintentar
              </Button>
            )}

            {entrega?.estado === 'ENVIADA' && entrega?.canal === 'CORREO' && onReenviar && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon="send"
                onClick={() => {
                  onClose();
                  onReenviar(entrega);
                }}
                className="text-xs font-bold"
              >
                Reenviar
              </Button>
            )}

            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}
