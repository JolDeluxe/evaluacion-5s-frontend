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
  return ordenarPorOrden(versionFormulario?.bloques ?? []);
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

export function evaluarReglas(reglas = [], respuesta) {
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
    return {
      invitacion,
      asignacion: invitacion?.asignacion ?? null,
      objetivo: invitacion?.objetivo ?? invitacion?.asignacion?.objetivo ?? null,
      area: invitacion?.area ?? invitacion?.objetivo?.area ?? invitacion?.asignacion?.objetivo?.area ?? null,
      ciclo: invitacion?.ciclo ?? invitacion?.objetivo?.cicloAuditoria ?? null,
      versionFormulario: invitacion?.versionFormulario ?? invitacion?.objetivo?.formularioCiclo?.versionFormulario ?? null,
      nombreAuditor: invitacion?.nombreInvitado ?? 'Invitado',
    };
  }

  return {
    asignacion: datos?.asignacion ?? null,
    objetivo: datos?.objetivo ?? datos?.asignacion?.objetivoAuditoria ?? null,
    area: datos?.area ?? datos?.objetivo?.area ?? datos?.asignacion?.objetivoAuditoria?.area ?? null,
    ciclo: datos?.ciclo ?? datos?.objetivo?.cicloAuditoria ?? null,
    versionFormulario: datos?.versionFormulario ?? datos?.objetivo?.formularioCiclo?.versionFormulario ?? null,
    nombreAuditor: datos?.asignacion?.auditor?.nombre ?? 'Auditor',
  };
}

export function crearRespuestaInicial(bloque) {
  return {
    bloqueFormularioId: bloque.id,
    claveEstable: bloque.claveEstable,
    opcionFormularioIds: [],
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
