export const TIPOS_RESPONDIBLES = new Set([
  'TEXTO_CORTO',
  'TEXTO_LARGO',
  'FECHA',
  'DESPLEGABLE',
  'SELECCION_UNICA',
  'SELECCION_MULTIPLE',
  'EVIDENCIA',
  'FIRMA',
  'CRITERIO_5S',
]);

export function ordenarPorOrden(items = []) {
  return [...items].sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0));
}

export function obtenerBloques(versionFormulario) {
  if (Array.isArray(versionFormulario?.bloques)) return ordenarPorOrden(versionFormulario.bloques);

  const secciones = ordenarPorOrden(versionFormulario?.secciones ?? []);
  return secciones.flatMap((seccion, seccionIndex) => {
    const titulo = {
      id: `seccion-${seccion.id ?? seccion.claveEstable}`,
      claveEstable: seccion.claveEstable,
      tipo: 'TITULO',
      orden: seccionIndex * 1000,
      etiqueta: seccion.nombre,
      descripcion: seccion.objetivo ?? null,
    };
    const preguntas = ordenarPorOrden(seccion.preguntas ?? []).map((pregunta, preguntaIndex) => {
      let texto = pregunta.texto;
      if (seccion.nombre?.toUpperCase() === 'CULTURA' && (!texto || texto.trim().toLowerCase().startsWith('cultura'))) {
        const culturaQuestions = [
          "¿Cuántas y cuáles son las 5'S?",
          "¿Qué significa WPO y para qué nos sirve dentro de nuestro lugar de trabajo?",
          "¿Sabes cuál es el estándar ideal de WPO en tu lugar de trabajo?"
        ];
        if (preguntaIndex < culturaQuestions.length) {
          texto = culturaQuestions[preguntaIndex];
        }
      }

      return {
        id: pregunta.id,
        preguntaFormularioId: pregunta.id,
        claveEstable: pregunta.claveEstable,
        tipo: 'CRITERIO_5S',
        orden: seccionIndex * 1000 + preguntaIndex + 10,
        etiqueta: texto,
        obligatorio: true,
        requiereHallazgo: Boolean(pregunta.requiereHallazgo),
        puntua: true,
        puntajeMaximo: preguntaIndex + 1,
        opciones: [
          {
            id: `${pregunta.id}-si`,
            etiqueta: 'SI',
            valor: 'SI',
            orden: 0,
            valorPuntaje: 1,
            activo: true,
          },
          {
            id: `${pregunta.id}-no`,
            etiqueta: 'NO',
            valor: 'NO',
            orden: 1,
            valorPuntaje: 0,
            activo: true,
          },
        ],
      };
    });

    return [titulo, ...preguntas];
  });
}

export function agruparSecciones(bloques = []) {
  const secciones = [];
  let actual = null;

  for (const bloque of bloques) {
    if (bloque.tipo === 'TITULO') {
      actual = {
        id: bloque.id,
        titulo: bloque,
        bloques: [bloque],
        criterios: [],
      };
      secciones.push(actual);
      continue;
    }

    if (!actual) {
      actual = {
        id: `sin-titulo-${bloque.id}`,
        titulo: null,
        bloques: [],
        criterios: [],
      };
      secciones.push(actual);
    }

    actual.bloques.push(bloque);
    if (TIPOS_RESPONDIBLES.has(bloque.tipo)) actual.criterios.push(bloque);
  }

  return secciones.filter((seccion) => seccion.bloques.length > 0);
}

export function obtenerCriterios(secciones = []) {
  return secciones.flatMap((seccion) => seccion.criterios.map((criterio) => ({
    ...criterio,
    seccionId: seccion.id,
    seccionTitulo: seccion.titulo?.etiqueta ?? 'Evaluacion',
  })));
}

export function evaluarReglas(reglas = [], respuesta, criterio) {
  if (respuesta?.cumple === false) {
    const exigeHallazgo = Boolean(criterio?.requiereHallazgo);
    return {
      reglas: [],
      exigeHallazgo,
      exigeEvidencia: false,
    };
  }

  const opcionIds = new Set(respuesta?.opcionFormularioIds ?? []);
  const reglasAplicadas = reglas.filter((regla) => (
    regla.activo !== false
    && regla.bloqueOrigenId === respuesta?.bloqueFormularioId
    && (!regla.opcionOrigenId || opcionIds.has(regla.opcionOrigenId))
  ));

  return {
    reglas: reglasAplicadas,
    exigeHallazgo: reglasAplicadas.some((regla) => regla.accion === 'EXIGIR_HALLAZGO'),
    exigeEvidencia: reglasAplicadas.some((regla) => regla.accion === 'EXIGIR_EVIDENCIA'),
  };
}

export function normalizarContextoAuditoria(datos, modo) {
  if (modo === 'invitado') {
    const invitacion = datos?.invitacion ?? datos;
    const objetivo = invitacion?.objetivo ?? invitacion?.asignacion?.objetivoAuditoria ?? invitacion?.asignacion?.objetivo ?? null;
    return {
      invitacion,
      asignacion: invitacion?.asignacion ?? null,
      objetivo,
      area: invitacion?.area ?? objetivo?.area ?? null,
      ciclo: invitacion?.ciclo ?? (objetivo ? {
        id: objetivo.id,
        anio: objetivo.anio,
        mes: objetivo.mes,
        numeroCorte: objetivo.periodo,
        iniciaEn: objetivo.iniciaEn,
        terminaEn: objetivo.terminaEn,
      } : null),
      versionFormulario: invitacion?.versionFormulario ?? datos?.versionFormulario ?? datos?.objetivo?.versionFormulario ?? datos?.asignacion?.objetivoAuditoria?.versionFormulario ?? objetivo?.versionFormulario ?? null,
      nombreAuditor: invitacion?.nombreInvitado ?? 'Invitado',
    };
  }

  const objetivo = datos?.objetivo ?? datos?.asignacion?.objetivoAuditoria ?? null;
  return {
    asignacion: datos?.asignacion ?? null,
    objetivo,
    area: datos?.area ?? objetivo?.area ?? null,
    ciclo: datos?.ciclo ?? (objetivo ? {
      id: objetivo.id,
      anio: objetivo.anio,
      mes: objetivo.mes,
      numeroCorte: objetivo.periodo,
      iniciaEn: objetivo.iniciaEn,
      terminaEn: objetivo.terminaEn,
    } : null),
    versionFormulario: datos?.versionFormulario ?? datos?.objetivo?.versionFormulario ?? datos?.asignacion?.objetivoAuditoria?.versionFormulario ?? objetivo?.versionFormulario ?? null,
    nombreAuditor: datos?.asignacion?.auditor?.nombre ?? 'Auditor',
  };
}

export function crearRespuestaInicial(bloque) {
  return {
    bloqueFormularioId: bloque.id,
    preguntaFormularioId: bloque.preguntaFormularioId ?? bloque.id,
    claveEstable: bloque.claveEstable,
    opcionFormularioIds: [],
    cumple: null,
    valorTexto: null,
    valorNumero: null,
    valorBooleano: null,
    valorFecha: null,
    valorJson: undefined,
    hallazgo: '',
    evidencias: [],
  };
}

export function buildCloudinaryUrl(configuracion) {
  const publicId = configuracion?.publicIdCloudinary;
  const cloudName = configuracion?.cloudName || configuracion?.cloudinaryCloudName;
  if (configuracion?.url) return configuracion.url;
  if (!publicId || !cloudName) return '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`;
}
