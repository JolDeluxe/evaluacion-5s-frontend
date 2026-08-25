export const BLOQUES_AGREGABLES = [
  { tipo: 'TITULO', label: 'Seccion / Titulo', icon: 'title' },
  { tipo: 'TEXTO', label: 'Texto', icon: 'notes' },
  { tipo: 'IMAGEN', label: 'Imagen', icon: 'image' },
  { tipo: 'CRITERIO_5S', label: 'Criterio 5S', icon: 'fact_check' },
  { tipo: 'SEPARADOR', label: 'Separador', icon: 'horizontal_rule' },
];

export function uuid() {
  return crypto.randomUUID();
}

export function crearOpcion(label, valor, puntaje, orden) {
  return {
    claveEstable: uuid(),
    etiqueta: label,
    valor,
    orden,
    valorPuntaje: puntaje,
    excluyeDelPuntaje: false,
    activo: true,
  };
}

export function crearBloque(tipo) {
  const base = {
    claveEstable: uuid(),
    tipo,
    orden: 0,
    etiqueta: '',
    descripcion: null,
    obligatorio: false,
    puntua: false,
    puntajeMaximo: null,
    configuracion: undefined,
    opciones: [],
  };

  if (tipo === 'TITULO') return { ...base, etiqueta: 'Nueva seccion' };
  if (tipo === 'TEXTO') return { ...base, etiqueta: 'Objetivo', descripcion: '' };
  if (tipo === 'IMAGEN') return { ...base, etiqueta: 'Imagen informativa', configuracion: undefined };
  if (tipo === 'SEPARADOR') return { ...base, etiqueta: 'Separador' };
  if (tipo === 'CRITERIO_5S') {
    return {
      ...base,
      etiqueta: 'Nuevo criterio 5S',
      obligatorio: true,
      puntua: true,
      puntajeMaximo: 1,
      opciones: [
        crearOpcion('SI', 'SI', 1, 0),
        crearOpcion('NO', 'NO', 0, 1),
      ],
    };
  }
  return base;
}

export function normalizarOrden(bloques) {
  return bloques.map((bloque, index) => ({ ...bloque, orden: index }));
}

export function moverBloque(bloques, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= bloques.length) return bloques;
  const copia = [...bloques];
  const [item] = copia.splice(fromIndex, 1);
  copia.splice(toIndex, 0, item);
  return normalizarOrden(copia);
}

export function reglasAEstadoEditor(version) {
  const bloques = version?.bloques ?? [];
  const bloquesPorId = new Map(bloques.map((bloque) => [bloque.id, bloque]));
  const opcionesPorId = new Map(bloques.flatMap((bloque) => (bloque.opciones ?? []).map((opcion) => [opcion.id, opcion])));

  return (version?.reglas ?? []).map((regla) => ({
    bloqueOrigenClaveEstable: bloquesPorId.get(regla.bloqueOrigenId)?.claveEstable,
    opcionOrigenClaveEstable: regla.opcionOrigenId ? opcionesPorId.get(regla.opcionOrigenId)?.claveEstable : null,
    operador: regla.operador,
    valorComparacion: regla.valorComparacion,
    bloqueDestinoClaveEstable: regla.bloqueDestinoId ? bloquesPorId.get(regla.bloqueDestinoId)?.claveEstable : null,
    accion: regla.accion,
    configuracion: regla.configuracion,
    activo: regla.activo,
  })).filter((regla) => regla.bloqueOrigenClaveEstable);
}

export function crearReglasDefaultCriterio(bloque) {
  const opcionNo = (bloque.opciones ?? []).find((opcion) => opcion.valor === 'NO') ?? bloque.opciones?.[1];
  if (!opcionNo) return [];
  return [
    {
      bloqueOrigenClaveEstable: bloque.claveEstable,
      opcionOrigenClaveEstable: opcionNo.claveEstable,
      operador: 'IGUAL',
      accion: 'EXIGIR_HALLAZGO',
      activo: true,
    },
    {
      bloqueOrigenClaveEstable: bloque.claveEstable,
      opcionOrigenClaveEstable: opcionNo.claveEstable,
      operador: 'IGUAL',
      accion: 'EXIGIR_EVIDENCIA',
      activo: true,
    },
  ];
}

export function prepararPayload(bloques, reglas) {
  return {
    bloques: normalizarOrden(bloques).map((bloque) => ({
      claveEstable: bloque.claveEstable,
      tipo: bloque.tipo,
      orden: bloque.orden,
      etiqueta: bloque.etiqueta,
      descripcion: bloque.descripcion ?? null,
      obligatorio: Boolean(bloque.obligatorio),
      puntua: Boolean(bloque.puntua),
      puntajeMaximo: bloque.puntajeMaximo === '' || bloque.puntajeMaximo === undefined ? null : Number(bloque.puntajeMaximo),
      configuracion: bloque.configuracion,
      opciones: (bloque.opciones ?? []).map((opcion, index) => ({
        claveEstable: opcion.claveEstable,
        etiqueta: opcion.etiqueta,
        valor: opcion.valor,
        orden: index,
        valorPuntaje: opcion.valorPuntaje === '' || opcion.valorPuntaje === undefined ? null : Number(opcion.valorPuntaje),
        excluyeDelPuntaje: Boolean(opcion.excluyeDelPuntaje),
        activo: opcion.activo !== false,
      })),
    })),
    reglas: reglas.filter((regla) => regla.bloqueOrigenClaveEstable && regla.accion),
  };
}

export function validarEditor(bloques, reglas) {
  const errores = [];
  const clavesBloque = new Set(bloques.map((bloque) => bloque.claveEstable));

  for (const bloque of bloques) {
    if (!bloque.etiqueta?.trim()) errores.push(`Bloque ${bloque.orden + 1}: falta etiqueta.`);
    if (bloque.tipo === 'IMAGEN' && bloque.configuracion) {
      if (!bloque.configuracion.publicIdCloudinary || !bloque.configuracion.alt?.trim()) {
        errores.push(`Imagen ${bloque.orden + 1}: falta imagen o texto alternativo.`);
      }
    }
    if (bloque.tipo === 'CRITERIO_5S') {
      if (!bloque.opciones?.length) errores.push(`Criterio ${bloque.orden + 1}: necesita opciones.`);
      const valores = new Set();
      for (const opcion of bloque.opciones ?? []) {
        if (!opcion.etiqueta?.trim() || !opcion.valor?.trim()) errores.push(`Criterio ${bloque.orden + 1}: opcion incompleta.`);
        if (valores.has(opcion.valor)) errores.push(`Criterio ${bloque.orden + 1}: opciones duplicadas.`);
        valores.add(opcion.valor);
      }
    }
  }

  for (const regla of reglas) {
    if (!clavesBloque.has(regla.bloqueOrigenClaveEstable)) errores.push('Hay una regla apuntando a un bloque inexistente.');
  }

  return errores;
}

export function construirVersionPreview(version, bloques, reglas) {
  const bloquesPreview = normalizarOrden(bloques).map((bloque, index) => ({
    ...bloque,
    id: bloque.id ?? -(index + 1),
    opciones: (bloque.opciones ?? []).map((opcion, opcionIndex) => ({
      ...opcion,
      id: opcion.id ?? -((index + 1) * 1000 + opcionIndex + 1),
    })),
  }));
  const bloquesPorClave = new Map(bloquesPreview.map((bloque) => [bloque.claveEstable, bloque]));
  const opcionesPorClave = new Map(bloquesPreview.flatMap((bloque) => bloque.opciones.map((opcion) => [opcion.claveEstable, opcion])));

  return {
    ...version,
    bloques: bloquesPreview,
    reglas: reglas.map((regla, index) => ({
      id: regla.id ?? -(index + 1),
      versionFormularioId: version.id,
      bloqueOrigenId: bloquesPorClave.get(regla.bloqueOrigenClaveEstable)?.id,
      opcionOrigenId: regla.opcionOrigenClaveEstable ? opcionesPorClave.get(regla.opcionOrigenClaveEstable)?.id : null,
      operador: regla.operador,
      valorComparacion: regla.valorComparacion,
      bloqueDestinoId: regla.bloqueDestinoClaveEstable ? bloquesPorClave.get(regla.bloqueDestinoClaveEstable)?.id : null,
      accion: regla.accion,
      configuracion: regla.configuracion,
      activo: regla.activo,
    })).filter((regla) => regla.bloqueOrigenId),
  };
}
