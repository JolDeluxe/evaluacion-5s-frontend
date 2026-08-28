import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { resultadosApi } from '@/features/resultados/api/resultados-api';
import { exportarResultadosGeneralPdf } from '@/features/resultados/utils/exportar-resultados-pdf';
import { formatMonthLabel } from '@/features/resultados/utils/resultados-format';
import { cn } from '@/utils/cn';

export function ExportarResultadosModal({
  isOpen,
  onClose,
  rangoInicial = {},
  dataInicial = null,
}) {
  const [rangoModal, setRangoModal] = useState({
    tipo: 'mes',
    mes: '',
    anio: '',
    trimestre: '',
    semestre: '',
  });

  const [dataModal, setDataModal] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [errorCarga, setErrorCarga] = useState(null);
  const [errorExportacion, setErrorExportacion] = useState(null);

  const cargarDatosRango = useCallback(async (rangoTarget) => {
    const esRangoInicial = (
      (rangoTarget.tipo || 'mes') === (rangoInicial.tipo || 'mes') &&
      rangoTarget.mes === rangoInicial.mes &&
      String(rangoTarget.anio || '') === String(rangoInicial.anio || '') &&
      String(rangoTarget.trimestre || '') === String(rangoInicial.trimestre || '') &&
      String(rangoTarget.semestre || '') === String(rangoInicial.semestre || '')
    );

    if (esRangoInicial && dataInicial) {
      setDataModal(dataInicial);
      setErrorCarga(null);
      return;
    }

    setCargandoDatos(true);
    setErrorCarga(null);
    try {
      const res = await resultadosApi.obtenerGeneral({
        tipo: rangoTarget.tipo,
        mes: rangoTarget.mes,
        anio: rangoTarget.anio,
        trimestre: rangoTarget.trimestre,
        semestre: rangoTarget.semestre,
      });
      setDataModal(res);
    } catch (err) {
      console.error('[ExportarResultadosModal] Error al obtener datos:', err);
      setErrorCarga('No se pudieron cargar los resultados de este periodo.');
      setDataModal(null);
    } finally {
      setCargandoDatos(false);
    }
  }, [rangoInicial, dataInicial]);

  useEffect(() => {
    if (isOpen) {
      const tipo = rangoInicial.tipo || 'mes';
      const mes = rangoInicial.mes || '';
      const anio = rangoInicial.anio || '';
      const trimestre = rangoInicial.trimestre || '';
      const semestre = rangoInicial.semestre || '';

      const baseRango = { tipo, mes, anio, trimestre, semestre };
      setRangoModal(baseRango);
      setErrorCarga(null);
      setErrorExportacion(null);

      if (dataInicial) {
        setDataModal(dataInicial);
      } else {
        cargarDatosRango(baseRango);
      }
    }
  }, [isOpen, rangoInicial, dataInicial, cargarDatosRango]);

  const handleTipoChange = (nuevoTipo) => {
    if (nuevoTipo === rangoModal.tipo) return;
    setErrorExportacion(null);
    const ahora = new Date();
    const currAnio = ahora.getFullYear();
    const currMes = ahora.getMonth() + 1;

    let nextRango = { tipo: nuevoTipo };
    if (nuevoTipo === 'mes') {
      const nextMes = rangoModal.mes || `${currAnio}-${String(currMes).padStart(2, '0')}`;
      nextRango.mes = nextMes;
    } else if (nuevoTipo === 'trimestre') {
      nextRango.anio = rangoModal.anio || currAnio;
      nextRango.trimestre = rangoModal.trimestre || Math.ceil(currMes / 3);
    } else if (nuevoTipo === 'semestre') {
      nextRango.anio = rangoModal.anio || currAnio;
      nextRango.semestre = rangoModal.semestre || (currMes <= 6 ? 1 : 2);
    } else if (nuevoTipo === 'anio') {
      nextRango.anio = rangoModal.anio || currAnio;
    }

    setRangoModal(nextRango);
    cargarDatosRango(nextRango);
  };

  const handleShift = (offset) => {
    setErrorExportacion(null);
    const tipo = rangoModal.tipo || 'mes';
    const anioNum = Number(rangoModal.anio || new Date().getFullYear());
    const triNum = Number(rangoModal.trimestre || 1);
    const semNum = Number(rangoModal.semestre || 1);

    let nextRango = { tipo };

    if (tipo === 'mes') {
      const [y, m] = (rangoModal.mes || `${new Date().getFullYear()}-01`).split('-').map(Number);
      const dt = new Date(y, m - 1 + offset, 1);
      nextRango.mes = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    } else if (tipo === 'trimestre') {
      let nextTri = triNum + offset;
      let nextAnio = anioNum;
      if (nextTri > 4) {
        nextTri = 1;
        nextAnio += 1;
      } else if (nextTri < 1) {
        nextTri = 4;
        nextAnio -= 1;
      }
      nextRango.anio = nextAnio;
      nextRango.trimestre = nextTri;
    } else if (tipo === 'semestre') {
      let nextSem = semNum + offset;
      let nextAnio = anioNum;
      if (nextSem > 2) {
        nextSem = 1;
        nextAnio += 1;
      } else if (nextSem < 1) {
        nextSem = 2;
        nextAnio -= 1;
      }
      nextRango.anio = nextAnio;
      nextRango.semestre = nextSem;
    } else if (tipo === 'anio') {
      nextRango.anio = anioNum + offset;
    }

    setRangoModal(nextRango);
    cargarDatosRango(nextRango);
  };

  const handleGenerarPdf = async () => {
    if (generandoPdf || cargandoDatos || !dataModal) return;
    setGenerandoPdf(true);
    setErrorExportacion(null);

    try {
      await exportarResultadosGeneralPdf(dataModal);
      onClose();
    } catch (err) {
      console.error('[ExportarResultadosModal] Error al generar PDF:', err);
      setErrorExportacion('No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      setGenerandoPdf(false);
    }
  };

  const estadoGeneral = dataModal?.estadoRango ?? dataModal?.estadoMes ?? {};
  const enCurso = estadoGeneral.estado === 'EN_CURSO' || estadoGeneral.estado === 'EN_GRACIA' || estadoGeneral.finalizado === false;

  const renderEtiquetaPeriodo = () => {
    const tipo = rangoModal.tipo || 'mes';
    const anioNum = Number(rangoModal.anio || new Date().getFullYear());
    const triNum = Number(rangoModal.trimestre || 1);
    const semNum = Number(rangoModal.semestre || 1);

    if (tipo === 'mes') {
      return formatMonthLabel(rangoModal.mes || `${new Date().getFullYear()}-01`);
    }
    if (tipo === 'trimestre') return `Trimestre ${triNum} · ${anioNum}`;
    if (tipo === 'semestre') return `Semestre ${semNum} · ${anioNum}`;
    return `Año ${anioNum}`;
  };

  const tipos = [
    { id: 'mes', labelMobile: 'Mes', labelDesktop: 'Mes' },
    { id: 'trimestre', labelMobile: 'Trim.', labelDesktop: 'Trimestre' },
    { id: 'semestre', labelMobile: 'Sem.', labelDesktop: 'Semestre' },
    { id: 'anio', labelMobile: 'Año', labelDesktop: 'Año' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" className="w-[calc(100vw-24px)] sm:w-full sm:max-w-[500px]">
      <ModalHeader title="EXPORTAR RESULTADOS" onClose={onClose} />
      <ModalBody className="space-y-5 p-5 sm:p-6 overflow-x-hidden">
        <p className="text-xs font-medium text-slate-600">
          Selecciona el periodo que deseas incluir en el reporte PDF.
        </p>

        {/* 1. TIPO DE PERIODO: Segmented control 4 columnas perfectas */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 block">
            TIPO DE PERIODO
          </label>
          <div className="grid grid-cols-4 w-full rounded-lg border border-app-border bg-slate-100/80 p-1 shadow-sm gap-0.5">
            {tipos.map((t) => {
              const isActive = (rangoModal.tipo || 'mes') === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTipoChange(t.id)}
                  className={cn(
                    'w-full rounded-md py-1.5 text-xs font-black transition text-center min-w-0 truncate',
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800',
                  )}
                >
                  <span className="sm:hidden">{t.labelMobile}</span>
                  <span className="hidden sm:inline">{t.labelDesktop}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. PERIODO: Control simple [ ‹ ] periodo [ › ] sin cajas anidadas */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 block">
            PERIODO
          </label>
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 w-full">
            <Button
              type="button"
              variant="icon"
              size="icon"
              icon="chevron_left"
              onClick={() => handleShift(-1)}
              aria-label="Periodo anterior"
              className="h-9 w-9 shrink-0"
            />

            <div className="h-9 flex items-center justify-center rounded-lg border border-app-border bg-white px-3 text-xs sm:text-sm font-black text-slate-800 shadow-sm min-w-0 w-full truncate">
              {renderEtiquetaPeriodo()}
            </div>

            <Button
              type="button"
              variant="icon"
              size="icon"
              icon="chevron_right"
              onClick={() => handleShift(1)}
              aria-label="Periodo siguiente"
              className="h-9 w-9 shrink-0"
            />
          </div>
        </div>

        {/* Loading de datos del rango */}
        {cargandoDatos && (
          <div className="flex items-center justify-center gap-2 py-2">
            <Spinner size="sm" />
            <span className="text-xs font-medium text-slate-500">Cargando datos...</span>
          </div>
        )}

        {/* Error de Carga de Datos */}
        {errorCarga && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            {errorCarga}
          </div>
        )}

        {/* Advertencia de Periodo EN CURSO */}
        {!cargandoDatos && !errorCarga && enCurso && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/75 p-3 flex items-start gap-2.5 text-amber-900">
            <span className="text-amber-600 font-bold text-base shrink-0">⚠️</span>
            <div className="text-xs leading-relaxed">
              <p className="font-bold">Este periodo aún está en curso.</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Los resultados pueden cambiar hasta el cierre oficial de las auditorías.
              </p>
            </div>
          </div>
        )}

        {/* Error de Exportación PDF */}
        {errorExportacion && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            {errorExportacion}
          </div>
        )}
      </ModalBody>

      <ModalFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="cancelar"
          size="sm"
          onClick={onClose}
          disabled={generandoPdf}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="guardar"
          size="sm"
          onClick={handleGenerarPdf}
          isLoading={generandoPdf}
          disabled={generandoPdf || cargandoDatos || !!errorCarga || !dataModal}
        >
          Generar PDF
        </Button>
      </ModalFooter>
    </Modal>
  );
}
