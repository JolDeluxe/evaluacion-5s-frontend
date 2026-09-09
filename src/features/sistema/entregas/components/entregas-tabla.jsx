import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';
import { CanalBadge } from './canal-badge';
import { interpretarErrorEntrega } from '../utils/interpretar-error-entrega';

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
  total: totalProp,
  hayMas,
  cargandoMas,
  onCargarMas,
  paginacion,
  onCambiarPagina,
  onReintentar,
  onReenviar,
  onVerPreview,
  onVerDetalle,
  onCancelar,
  onAbrirCancelarMasivo,
  seleccionados = new Set(),
  onToggleSeleccion,
  onSeleccionarTodos,
  onLimpiarSeleccion,
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

  const total = typeof totalProp === 'number' ? totalProp : (paginacion?.total ?? entregas.length);
  const hayMasEfectivo = hayMas !== undefined ? hayMas : Boolean(paginacion?.hayMas);
  const puedeCargarMas = hayMasEfectivo && entregas.length < total;

  const entregasElegibles = entregas.filter(
    (e) => e.estado === 'PENDIENTE' || e.estado === 'FALLIDA'
  );
  const elegiblesIds = entregasElegibles.map((e) => e.id);
  const todosElegiblesSeleccionados =
    elegiblesIds.length > 0 && elegiblesIds.every((id) => seleccionados.has(id));

  return (
    <div className="space-y-3">
      {/* Barra flotante de acciones masivas */}
      {seleccionados.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Icon name="checklist" size="sm" />
            </div>
            <span className="text-xs font-bold">
              <strong className="text-amber-400">{seleccionados.size}</strong> entregas seleccionadas <span className="text-slate-400 font-normal">(visibles en esta página)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="danger"
              size="xs"
              icon="block"
              onClick={onAbrirCancelarMasivo}
              className="text-xs font-bold"
            >
              Cancelar seleccionadas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onLimpiarSeleccion}
              className="text-xs text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Deseleccionar
            </Button>
          </div>
        </div>
      )}

      <Card className="border-white/80 bg-white/80 shadow-sm backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={todosElegiblesSeleccionados}
                    disabled={elegiblesIds.length === 0}
                    onChange={() => onSeleccionarTodos?.(elegiblesIds)}
                    title={
                      todosElegiblesSeleccionados
                        ? 'Deseleccionar todas las de la página'
                        : 'Seleccionar todas las pendientes/fallidas de la página'
                    }
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer h-4 w-4"
                  />
                </th>
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
                const esElegible = entrega.estado === 'PENDIENTE' || entrega.estado === 'FALLIDA';
                const estaSeleccionado = seleccionados.has(entrega.id);
                const esDestinatarioPrueba = Boolean(
                  entrega.destinoSnapshot && entrega.destinoSnapshot.includes('example.test')
                );

                return (
                  <tr
                    key={entrega.id}
                    className={cn(
                      'hover:bg-slate-50/60 transition',
                      estaSeleccionado && 'bg-amber-50/40'
                    )}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-3 text-center">
                      {esElegible ? (
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => onToggleSeleccion?.(entrega.id)}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer h-4 w-4"
                        />
                      ) : (
                        <span className="inline-block h-4 w-4" />
                      )}
                    </td>

                    {/* Canal / Destino */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        <CanalBadge canal={entrega.canal} />
                        <span className="font-mono text-[11px] text-slate-400">#{entrega.id}</span>
                        {esDestinatarioPrueba && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                            Prueba
                          </span>
                        )}
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
                      {entrega.ultimoError && (() => {
                        const { mensajeOperativo } = interpretarErrorEntrega(entrega.ultimoError, entrega.estado);
                        return (
                          <p className="text-[10px] font-normal text-rose-600 line-clamp-2 max-w-[220px]" title={mensajeOperativo}>
                            {mensajeOperativo}
                          </p>
                        );
                      })()}
                    </td>

                    {/* Intentos */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700">
                        {entrega.intentos} / 5
                      </span>
                      {entrega.proximoIntentoEn && entrega.estado !== 'CANCELADA' && entrega.estado !== 'ENVIADA' && (
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
                        {/* Botón Ver Detalle (siempre disponible) */}
                        {onVerDetalle && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            icon="info"
                            onClick={() => onVerDetalle(entrega.id)}
                            title="Ver detalle técnico"
                            className="text-xs font-bold text-slate-700 hover:bg-slate-200"
                          >
                            Detalle
                          </Button>
                        )}

                        {/* Botón Ver Correo (si es canal CORREO) */}
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
                            Correo
                          </Button>
                        )}

                        {/* Botón Cancelar Entrega (para PENDIENTE y FALLIDA) */}
                        {(entrega.estado === 'PENDIENTE' || entrega.estado === 'FALLIDA') && onCancelar && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            icon="block"
                            onClick={() => onCancelar(entrega)}
                            title="Cancelar entrega"
                            className="text-xs font-bold text-rose-600 hover:bg-rose-50"
                          >
                            Cancelar
                          </Button>
                        )}

                        {/* Botón Reintentar (para FALLIDA) */}
                        {entrega.estado === 'FALLIDA' && onReintentar && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="xs"
                            icon="replay"
                            disabled={estaProcesando}
                            onClick={() => onReintentar(entrega.id)}
                            className="text-xs font-bold"
                          >
                            {estaProcesando ? '...' : 'Reintentar'}
                          </Button>
                        )}

                        {/* Botón Reenviar (para ENVIADA por CORREO) */}
                        {entrega.estado === 'ENVIADA' && entrega.canal === 'CORREO' && onReenviar && (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            icon="send"
                            disabled={estaProcesando}
                            onClick={() => onReenviar(entrega)}
                            className="text-xs font-bold"
                          >
                            {estaProcesando ? '...' : 'Reenviar'}
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

        {/* Footer Cargar más */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Mostrando <strong className="text-slate-800">{entregas.length.toLocaleString('es-MX')}</strong> de{' '}
              <strong className="text-slate-800">{total.toLocaleString('es-MX')}</strong> entregas
            </span>

            {puedeCargarMas && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cargandoMas}
                onClick={onCargarMas}
                className="text-xs font-bold px-4 py-1.5"
              >
                {cargandoMas ? (
                  <>
                    <Spinner size="xs" className="mr-1.5" />
                    <span>Cargando...</span>
                  </>
                ) : (
                  <>
                    <Icon name="expand_more" size="xs" className="mr-1.5" />
                    <span>Cargar más</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}