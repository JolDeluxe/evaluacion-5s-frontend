export function ordenarPorOrden(items = []) {
  return [...items].sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
}

export function contarPreguntas(secciones = []) {
  return secciones.reduce((total, seccion) => total + (seccion.preguntas?.length ?? 0), 0);
}

export function obtenerResumenEstructura(revision) {
  const secciones = revision?.secciones ?? [];
  return {
    totalSecciones: revision?.totalSecciones ?? secciones.length,
    totalPreguntas: revision?.totalPreguntas ?? contarPreguntas(secciones),
  };
}

export function crearClaveEstable() {
  return crypto.randomUUID();
}

export function normalizarEstructuraEditable(secciones = []) {
  return ordenarPorOrden(secciones).map((seccion, seccionIndex) => ({
    claveEstable: seccion.claveEstable ?? crearClaveEstable(),
    nombre: seccion.nombre ?? '',
    objetivo: seccion.objetivo ?? '',
    orden: seccionIndex,
    preguntas: ordenarPorOrden(seccion.preguntas).map((pregunta, preguntaIndex) => ({
      claveEstable: pregunta.claveEstable ?? crearClaveEstable(),
      texto: pregunta.texto ?? '',
      orden: preguntaIndex,
    })),
  }));
}

export function prepararEstructuraPayload(secciones = []) {
  return {
    secciones: normalizarEstructuraEditable(secciones).map((seccion) => ({
      claveEstable: seccion.claveEstable,
      nombre: seccion.nombre.trim(),
      objetivo: seccion.objetivo?.trim() || null,
      orden: seccion.orden,
      preguntas: seccion.preguntas.map((pregunta) => ({
        claveEstable: pregunta.claveEstable,
        texto: pregunta.texto.trim(),
        orden: pregunta.orden,
      })),
    })),
  };
}

export function crearSeccionEditable(orden) {
  return {
    claveEstable: crearClaveEstable(),
    nombre: 'Nueva seccion',
    objetivo: '',
    orden,
    preguntas: [crearPreguntaEditable(0)],
  };
}

export function crearPreguntaEditable(orden) {
  return {
    claveEstable: crearClaveEstable(),
    texto: 'Nueva pregunta',
    orden,
  };
}

export function moverItem(items, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= items.length) return items;
  const copia = [...items];
  const [item] = copia.splice(fromIndex, 1);
  copia.splice(toIndex, 0, item);
  return copia.map((actual, index) => ({ ...actual, orden: index }));
}
