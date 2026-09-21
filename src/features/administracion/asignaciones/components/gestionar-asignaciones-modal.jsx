import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { SelectAuditor } from '@/features/administracion/asignaciones/components/select-auditor';
import { Icon } from '@/components/ui/icon';
import {
  buildGuardarAsignacionMensualPayload,
  esFilaEditable,
  MESES,
} from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function GestionarAsignacionesModal({
  filas = [],
  auditores = [],
  anio,
  mes,
  onClose,
  onSaved,
  onSaveAsignacion,
  onSaveLoteAsignaciones,
}) {
  // Estado local para almacenar las asignaciones modificadas en el modal: { [areaId]: auditorId }
  const [asignaciones, setAsignaciones] = useState(() => {
    const mapa = {};
    filas.forEach((fila) => {
      mapa[fila.area.id] = fila.auditorMensual?.id ? String(fila.auditorMensual.id) : '';
    });
    return mapa;
  });

  // Base de valores persistidos (se inicializa con filas y se actualiza al guardar parcialmente)
  const [valoresPersistidos, setValoresPersistidos] = useState(() => {
    const mapa = {};
    filas.forEach((fila) => {
      mapa[fila.area.id] = fila.auditorMensual?.id ? String(fila.auditorMensual.id) : '';
    });
    return mapa;
  });

  const [busqueda, setBusqueda] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [erroresPorArea, setErroresPorArea] = useState({});
  const [resumenGuardado, setResumenGuardado] = useState(null);

  // Lista de áreas que tienen cambios pendientes respecto a los valores base persistidos
  const areasModificadas = useMemo(() => {
    return filas.filter((fila) => {
      const valorActual = asignaciones[fila.area.id] ?? '';
      const valorOriginal = valoresPersistidos[fila.area.id] ?? '';
      return valorActual !== valorOriginal;
    });
  }, [filas, asignaciones, valoresPersistidos]);

  const cambiosCount = areasModificadas.length;

  // Manejar cambio de auditor en una fila del modal
  const handleAuditorChange = (areaId, nuevoAuditorId) => {
    setAsignaciones((prev) => ({
      ...prev,
      [areaId]: nuevoAuditorId ? String(nuevoAuditorId) : '',
    }));
    // Limpiar error específico de esta área al modificarla
    if (erroresPorArea[areaId]) {
      setErroresPorArea((prev) => {
        const copy = { ...prev };
        delete copy[areaId];
        return copy;
      });
    }
  };

  // Filtrado por texto para encontrar áreas rápidamente
  const q = busqueda.trim().toLowerCase();
  const filasFiltradas = useMemo(() => {
    if (!q) return filas;
    return filas.filter((f) =>
      f.area.nombre.toLowerCase().includes(q) ||
      (f.area.codigo && f.area.codigo.toLowerCase().includes(q))
    );
  }, [filas, q]);

  // Guardado masivo mediante un único POST /mensual/lote secuencial y atómico por área
  const handleGuardar = async () => {
    // Protección estricta contra doble clic y ejecuciones concurrentes
    if (cambiosCount === 0 || guardando) return;

    setGuardando(true);
    setResumenGuardado(null);

    const nuevosErrores = {};
    const loteAEnviar = [];

    // Validar precondiciones locales y preparar lote
    for (const fila of areasModificadas) {
      const areaId = fila.area.id;
      const nuevoAuditorId = asignaciones[areaId];

      if (!nuevoAuditorId) {
        nuevosErrores[areaId] = 'Debes seleccionar un auditor válido para asignar esta área.';
        continue;
      }

      const valorOriginal = valoresPersistidos[areaId];
      loteAEnviar.push({
        areaId,
        auditorMensualId: Number(nuevoAuditorId),
        expectedAuditorId: valorOriginal ? Number(valorOriginal) : null,
      });
    }

    if (loteAEnviar.length === 0) {
      setGuardando(false);
      setErroresPorArea(nuevosErrores);
      setResumenGuardado({ exito: 0, fallo: Object.keys(nuevosErrores).length });
      return;
    }

    try {
      let resultado;
      if (onSaveLoteAsignaciones) {
        resultado = await onSaveLoteAsignaciones({
          anio,
          mes,
          asignaciones: loteAEnviar,
        });
      } else {
        // Fallback defensivo si no estuviera disponible el método de lote
        const guardadas = [];
        const fallidas = [];
        for (const item of loteAEnviar) {
          try {
            await onSaveAsignacion(item.areaId, {
              anio,
              mes,
              auditorMensualId: item.auditorMensualId,
              expectedAuditorId: item.expectedAuditorId,
            });
            guardadas.push(item.areaId);
          } catch (err) {
            fallidas.push({ areaId: item.areaId, motivo: err?.message || 'Error al guardar' });
          }
        }
        resultado = { guardadas, fallidas };
      }

      const guardadasSet = new Set(resultado.guardadas || []);
      const fallidas = resultado.fallidas || [];

      // Mapear errores devueltos por el backend a cada área
      fallidas.forEach((f) => {
        nuevosErrores[f.areaId] = f.motivo || 'Error al guardar la asignación.';
      });

      // Actualizar valores base persistidos para las que sí se guardaron correctamente
      if (guardadasSet.size > 0) {
        setValoresPersistidos((prev) => {
          const copia = { ...prev };
          guardadasSet.forEach((areaId) => {
            copia[areaId] = asignaciones[areaId] ?? '';
          });
          return copia;
        });
      }

      const exitoCount = guardadasSet.size;
      const falloCount = Object.keys(nuevosErrores).length;

      setErroresPorArea(nuevosErrores);

      if (falloCount === 0) {
        // Todo el lote se guardó con éxito: cerramos modal y refrescamos la vista
        onSaved();
        onClose();
      } else {
        setResumenGuardado({ exito: exitoCount, fallo: falloCount });
        // Si al menos una guardó con éxito, refrescamos la vista exterior
        if (exitoCount > 0) {
          onSaved();
        }
      }
    } catch (errorLote) {
      // Error de red o fallo general de la petición
      setResumenGuardado({
        exito: 0,
        fallo: loteAEnviar.length,
      });
      loteAEnviar.forEach((item) => {
        nuevosErrores[item.areaId] = errorLote?.message || 'Error al conectar con el servidor.';
      });
      setErroresPorArea(nuevosErrores);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal isOpen onClose={guardando ? () => {} : onClose} size="lg" className="max-w-4xl">
      <ModalHeader onClose={guardando ? null : onClose}>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">
            {MESES[mes - 1]} {anio}
          </p>
          <h2 className="text-xl font-black text-slate-950 uppercase">
            Gestionar Asignaciones Mensuales
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Modifica los auditores responsables para cada una de las áreas y aplica todos los cambios de una sola vez.
          </p>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Banner de resumen si hubo errores parciales */}
        {resumenGuardado && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-amber-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-black">
                !
              </span>
              <span>Guardado parcial completado</span>
            </div>
            <p className="text-xs font-semibold text-amber-800">
              Se guardaron correctamente <strong>{resumenGuardado.exito}</strong> asignaciones.{' '}
              <strong className="text-rose-700">{resumenGuardado.fallo} áreas tuvieron problemas</strong> y siguen pendientes para corregir.
            </p>
          </div>
        )}

        {/* Buscador de áreas dentro del modal */}
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Filtrar por nombre de área…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 outline-none focus:border-marca-secundario focus:bg-white"
          />
        </div>

        {/* Matriz de Áreas y Auditores */}
        <div className="rounded-xl border border-app-border bg-white overflow-hidden shadow-xs">
          <div className="grid grid-cols-[1fr_260px] sm:grid-cols-[1fr_320px] bg-slate-50/80 px-4 py-2.5 border-b border-app-border text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <div>Área</div>
            <div>Auditor mensual</div>
          </div>

          <div className="divide-y divide-app-border">
            {filasFiltradas.map((fila) => {
              const areaId = fila.area.id;
              const editable = esFilaEditable(fila, anio, mes);
              const valorActual = asignaciones[areaId] ?? '';
              const valorOriginal = valoresOriginales[areaId] ?? '';
              const fueModificada = valorActual !== valorOriginal;
              const errorArea = erroresPorArea[areaId];

              return (
                <div
                  key={areaId}
                  className={`p-3 sm:px-4 sm:py-3 grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-2 items-center transition ${
                    fueModificada ? 'bg-amber-50/40' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-black uppercase text-slate-900 leading-tight">
                        {fila.area.nombre}
                      </p>
                      {fueModificada && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800 uppercase">
                          Modificada
                        </span>
                      )}
                    </div>
                    {errorArea && (
                      <p className="text-[11px] font-bold text-rose-600 mt-1">
                        {errorArea}
                      </p>
                    )}
                  </div>

                  <div>
                    {editable ? (
                      <SelectAuditor
                        value={valorActual}
                        onChange={(val) => handleAuditorChange(areaId, val)}
                        auditores={auditores}
                        responsablesIds={fila.area.responsablesIds}
                        disabled={guardando}
                      />
                    ) : (
                      <p className="text-xs font-bold text-slate-400 italic">
                        {fila.auditorMensual?.nombre || 'Bloqueada por auditorías concluidas'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {!filasFiltradas.length && (
              <div className="p-8 text-center text-xs font-semibold text-slate-400">
                No se encontraron áreas con la búsqueda "{busqueda}".
              </div>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-500">
          {cambiosCount > 0 ? (
            <span className="text-amber-700 font-black">
              {cambiosCount} {cambiosCount === 1 ? 'área con cambios pendientes' : 'áreas con cambios pendientes'}
            </span>
          ) : (
            <span>Sin cambios pendientes</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="default"
            icon="save"
            isLoading={guardando}
            disabled={cambiosCount === 0 || guardando}
            onClick={handleGuardar}
          >
            {cambiosCount > 0
              ? `Guardar asignaciones (${cambiosCount} ${cambiosCount === 1 ? 'cambio' : 'cambios'})`
              : 'Guardar asignaciones'}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
