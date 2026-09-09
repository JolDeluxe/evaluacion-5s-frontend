/**
 * Asigna una posición correlativa consecutiva (1, 2, 3...) a la lista de áreas,
 * únicamente a aquellas áreas que tengan un resultado numérico válido.
 * 
 * Áreas sin resultado reciben `posicion: null`.
 * 
 * @param {Array} areas Lista de áreas previa y correctamente ordenada descendentemente por el backend
 * @returns {Array} Nueva lista de áreas con la propiedad `posicion` agregada a cada elemento
 */
export function mapAreasConPosicion(areas = []) {
  let contadorPosicion = 1;

  return areas.map((item) => {
    const valor = item.resultadoRango !== undefined && item.resultadoRango !== null
      ? item.resultadoRango
      : item.resultadoMensual;
    const tieneResultado = valor !== null && valor !== undefined && valor !== '';
    const posicion = tieneResultado ? contadorPosicion++ : null;

    return {
      ...item,
      posicion,
    };
  });
}

