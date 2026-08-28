/**
 * Asigna una posición de ranking consecutiva (1, 2, 3...) únicamente
 * a aquellas áreas que tengan un resultadoMensual (RESULTADO FINAL) numérico válido.
 * 
 * Áreas sin resultadoMensual reciben `posicion: null`.
 * 
 * @param {Array} areas Lista de áreas previa y correctamente ordenada por el backend
 * @returns {Array} Nueva lista de áreas con la propiedad `posicion` agregada a cada elemento
 */
export function mapAreasConPosicion(areas = []) {
  let contadorPosicion = 1;

  return areas.map((item) => {
    const tieneResultado = item.resultadoMensual !== null && item.resultadoMensual !== undefined && item.resultadoMensual !== '';
    const posicion = tieneResultado ? contadorPosicion++ : null;

    return {
      ...item,
      posicion,
    };
  });
}
