import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

const estadoBadgeMap = {
  ENVIADA: { status: 'success', label: 'Enviada' },
  PENDIENTE: { status: 'info', label: 'Pendiente' },
  PROCESANDO: { status: 'warning', label: 'Procesando' },
  FALLIDA: { status: 'danger', label: 'Fallida' },
  CANCELADA: { status: 'neutral', label: 'Cancelada' },
};

const tipoEtiquetaMap = {
  ASIGNACION_MENSUAL_CORREO: 'Asignación Mensual',
  RESULTADO_MENSUAL_CORREO: 'Resultados Mensuales',
  NUEVA_ASIGNACION: 'Nueva Auditoría',
  RECORDATORIO: 'Recordatorio',
  VENCIMIENTO_PROXIMO: 'Vencimiento Próximo',
  AUDITORIA_VENCIDA: 'Auditoría Vencida',
  RESULTADO_PUBLICADO: 'Resultado Publicado',
  APROBACION_PENDIENTE: 'Aprobación Pendiente',
  SISTEMA: 'Aviso Sistema',
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
    });
  } catch {
    return '—';
  }
};

export function EntregasTabla({
  entregas,
  paginacion,
  onCambiarPagina,
  onReintentar,
  onReenviar,
  onVerPreview,
  accionEnProgreso,
  cargando,
}) {
  if (cargando) {
    return (
      <Card className="border-white/80 bg-white/80 shadow-sm backdrop-blur-xl">
        <CardBody className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Spinner size="lg" />
          <p className="text-sm font-bold">Cargando entregas del sistema...</p>
        </CardBody>
      </Card>
    );
  }

  if (!entregas || entregas.length === 0) {
    return (
      <Card className="border-white/80 bg-white/80 shadow-sm backdrop-blur-xl">
        <CardBody className="p-12 text-center space-y-3">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Icon name="inbox" size="lg" />
          </div>
          <h3 className="text-base font-black text-slate-800">No se encontraron entregas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No hay registros de entregas de notificación que coincidan con los filtros seleccionados.
          </p>
        </CardBody>
      </Card>
    );
  }

  const totalPaginas = Math.ceil((paginacion?.total || 1) / (paginacion?.limite || 15));
  const paginaActual = paginacion?.pagina || 1;

  return (
    <Card className="border-white/80 bg-white/80 shadow-sm backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Canal / Destino</th>
              <th className="py-3 px-4">Notificación</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Intentos</th>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
            {entregas.map((entrega) => {
              const badgeInfo = estadoBadgeMap[entrega.estado] || { status: 'neutral', label: entrega.estado };
              const tipoEtiqueta = tipoEtiquetaMap[entrega.notificacion?.tipo] || entrega.notificacion?.tipo || 'Notificación';
              const estaProcesando = accionEnProgreso === entrega.id;

              return (
                <tr key={entrega.id} className="hover:bg-slate-50/60 transition">
                  {/* Canal / Destino */}
                  <td className="py-3.5 px-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {entrega.canal}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">#{entrega.id}</span>
                    </div>
                    <p className="font-bold text-slate-900 truncate max-w-[200px]" title={entrega.destinoSnapshot || ''}>
                      {entrega.destinoSnapshot || '—'}
                    </p>
                  </td>

                  {/* Notificación / Título */}
                  <td className="py-3.5 px-4 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-marca-acento block">
                      {tipoEtiqueta}
                    </span>
                    <p className="font-bold text-slate-800 line-clamp-1" title={entrega.notificacion?.titulo}>
                      {entrega.notificacion?.titulo || '—'}
                    </p>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-4 space-y-1">
                    <Badge status={badgeInfo.status}>
                      {badgeInfo.label}
                    </Badge>
                    {entrega.ultimoError && (
                      <p className="text-[10px] font-normal text-rose-600 line-clamp-2 max-w-[220px]" title={entrega.ultimoError}>
                        {entrega.ultimoError}
                      </p>
                    )}
                  </td>

                  {/* Intentos */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-700">
                      {entrega.intentos} / 5
                    </span>
                    {entrega.proximoIntentoEn && (
                      <span className="block text-[10px] text-slate-400">
                        Próx: {formatFecha(entrega.proximoIntentoEn)}
                      </span>
                    )}
                  </td>

                  {/* Fecha */}
                  <td className="py-3.5 px-4 text-slate-500 space-y-0.5">
                    <div>{formatFecha(entrega.enviadoEn || entrega.creadoEn)}</div>
                    {entrega.enviadoEn && (
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        Enviado
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {entrega.canal === 'CORREO' && onVerPreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          icon="visibility"
                          onClick={() => onVerPreview(entrega.id)}
                          title="Ver correo"
                          className="text-xs font-bold text-slate-700 hover:bg-slate-200"
                        >
                          Ver
                        </Button>
                      )}

                      {entrega.estado === 'FALLIDA' && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="xs"
                          icon="replay"
                          disabled={estaProcesando}
                          onClick={() => onReintentar(entrega.id)}
                          className="text-xs font-bold"
                        >
                          {estaProcesando ? 'Reintentando...' : 'Reintentar'}
                        </Button>
                      )}

                      {entrega.estado === 'ENVIADA' && entrega.canal === 'CORREO' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          icon="send"
                          disabled={estaProcesando}
                          onClick={() => onReenviar(entrega.id)}
                          className="text-xs font-bold"
                        >
                          {estaProcesando ? 'Reenviando...' : 'Reenviar'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong> ({paginacion.total} entregas)
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={paginaActual <= 1}
              onClick={() => onCambiarPagina(paginaActual - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={paginaActual >= totalPaginas}
              onClick={() => onCambiarPagina(paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}