import { resultadosApi } from '@/features/resultados/api/resultados-api';

/**
 * Exporta el reporte PDF oficial de Resultados Generales 5S
 * delegando la generación al motor canónico del backend.
 * 
 * @param {Object} data - Datos o parámetros del reporte/modal
 * @param {Object} [params] - Parámetros de consulta (tipo, mes, anio, trimestre, semestre)
 */
export async function exportarResultadosGeneralPdf(data, params = null) {
  const queryParams = params || {
    tipo: data?.rango?.tipo || data?.tipo || 'mes',
    mes: data?.mes?.clave || data?.mes || undefined,
    anio: data?.rango?.anio || data?.anio || undefined,
    trimestre: data?.rango?.trimestre || data?.trimestre || undefined,
    semestre: data?.rango?.semestre || data?.semestre || undefined,
    tipoArea: data?.tipoArea || undefined,
  };

  return await resultadosApi.descargarPdfGeneral(queryParams);
}
