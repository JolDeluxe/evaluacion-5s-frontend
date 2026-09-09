import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function SimulacionModal({
  isOpen,
  onClose,
  onEjecutarSimulacion,
  onVerPreview,
  resultado,
  cargando,
}) {
  const hoy = new Date();
  const [tipo, setTipo] = useState('asignaciones');
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);

  const handleSimular = (e) => {
    e?.preventDefault?.();
    onEjecutarSimulacion({ tipo, anio: Number(anio), mes: Number(mes) });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader
        title="Simulación de Notificaciones"
        description="Previsualiza los destinatarios y el contenido de los correos antes de enviarlos."
        onClose={onClose}
      />

      <ModalBody className="space-y-6">
        {/* Formulario de parámetros */}
        <form onSubmit={handleSimular} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tipo */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Tipo de Notificación
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                <option value="asignaciones">Asignaciones</option>
                <option value="recordatorio_p1">Recordatorio 1er periodo</option>
                <option value="recordatorio_p2">Recordatorio 2do periodo</option>
                <option value="resultados">Resultados</option>
              </select>
            </div>

            {/* Mes */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Mes
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              >
                {MESES.map((nombreMes, index) => (
                  <option key={index + 1} value={index + 1}>
                    {nombreMes}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Año
              </label>
              <input
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                min="2020"
                max="2035"
                className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon="play_arrow"
              disabled={cargando}
              className="text-xs font-bold"
            >
              {cargando ? 'Simulando...' : 'Ejecutar Simulación'}
            </Button>
          </div>
        </form>

        {/* Loading Spinner */}
        {cargando && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Spinner size="lg" />
            <p className="text-xs font-bold">Calculando destinatarios y analizando base de datos...</p>
          </div>
        )}

        {/* Resultados de la Simulación */}
        {!cargando && resultado && (
          <div className="space-y-4">
            {/* Banner de Resumen de Simulación */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-marca-acento block">
                    Simulación · {
                      resultado.tipo === 'asignaciones'
                        ? 'Asignaciones'
                        : resultado.tipo === 'recordatorio_p1'
                        ? 'Recordatorio 1er periodo'
                        : resultado.tipo === 'recordatorio_p2'
                        ? 'Recordatorio 2do periodo'
                        : 'Resultados'
                    }
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    Período: {resultado.mesEtiqueta}
                  </h3>
                </div>

                {resultado.tipo === 'asignaciones' && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Primer día hábil:</span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(resultado.primerDiaHabil).toLocaleDateString('es-MX', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </div>
                )}

                {(resultado.tipo === 'recordatorio_p1' || resultado.tipo === 'recordatorio_p2') && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Fecha Límite:</span>
                    <span className="text-xs font-bold text-slate-800">
                      {resultado.fechaLimiteTexto || resultado.fechaRecordatorio}
                    </span>
                  </div>
                )}

                {resultado.tipo === 'resultados' && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Resultados Generales:</span>
                    <span className="text-sm font-black text-slate-900">
                      {resultado.resultadoGeneral !== null ? `${resultado.resultadoGeneral.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                )}
              </div>

              {(resultado.tipo === 'recordatorio_p1' || resultado.tipo === 'recordatorio_p2') && resultado.motivoVentana && (
                <div className={cn(
                  'p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2',
                  resultado.esElegiblePorFecha ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                )}>
                  <Icon name={resultado.esElegiblePorFecha ? 'check_circle' : 'schedule'} size="xs" />
                  <span>{resultado.motivoVentana}</span>
                </div>
              )}

              {/* Contadores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total</span>
                  <span className="text-lg font-black text-slate-800">{resultado.resumen.totalDestinatarios}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">A Enviar</span>
                  <span className="text-lg font-black text-emerald-700">{resultado.resumen.aEnviar}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 block">Ya Existen</span>
                  <span className="text-lg font-black text-sky-700">{resultado.resumen.yaRegistrados}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Sin Correo</span>
                  <span className="text-lg font-black text-amber-700">{resultado.resumen.sinCorreo}</span>
                </div>
              </div>
            </div>

            {/* Tabla de Destinatarios */}
            {resultado.destinatarios.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Usuario / Destino</th>
                        <th className="py-2.5 px-3">Áreas Asociadas</th>
                        <th className="py-2.5 px-3">Acción Simulada</th>
                        <th className="py-2.5 px-3 text-right">Vista Previa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {resultado.destinatarios.map((d) => {
                        let badgeAccion = { status: 'neutral', label: d.accionSimulada };
                        if (d.accionSimulada === 'ENVIAR_CORREO') {
                          badgeAccion = { status: 'success', label: 'Nuevo Envío' };
                        } else if (d.accionSimulada === 'IGNORAR_DUPLICADO') {
                          badgeAccion = { status: 'info', label: 'Ya Registrado' };
                        } else if (d.accionSimulada === 'CANCELAR_SIN_CORREO') {
                          badgeAccion = { status: 'warning', label: 'Sin Correo' };
                        }

                        const areasTexto = Array.isArray(d.areas)
                          ? d.areas.map((a) => (typeof a === 'string' ? a : a.nombre)).join(', ')
                          : '—';

                        return (
                          <tr key={d.usuarioId} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 space-y-0.5">
                              <p className="font-bold text-slate-900">{d.nombre}</p>
                              <p className="text-[11px] text-slate-500">{d.correo || 'Sin correo registrado'}</p>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 max-w-[200px]">
                              <p className="truncate" title={areasTexto}>
                                {areasTexto || <span className="italic text-slate-400">Solo resultados generales</span>}
                              </p>
                            </td>
                            <td className="py-2.5 px-3">
                              <Badge status={badgeAccion.status}>
                                {badgeAccion.label}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {onVerPreview && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  icon="visibility"
                                  onClick={() =>
                                    onVerPreview({
                                      tipo: resultado.tipo,
                                      anio: resultado.anio,
                                      mes: resultado.mes,
                                      usuarioId: d.usuarioId,
                                    })
                                  }
                                  title="Ver vista previa exacta del correo"
                                  className="text-xs font-bold text-slate-700 hover:bg-slate-200"
                                >
                                  Ver correo
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">
                No se encontraron destinatarios con obligaciones de notificación para este período.
              </p>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
}