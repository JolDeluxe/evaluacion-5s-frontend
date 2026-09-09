/**
 * Interpreta un mensaje de error crudo de una entrega para separar:
 * 1. Mensaje operativo comprensible y limpio para el usuario final.
 * 2. Detalle técnico original para diagnóstico exclusivo de SUPER_ADMIN.
 *
 * @param {string | null | undefined} rawError
 * @param {string} [estado]
 * @returns {{ mensajeOperativo: string, detalleTecnico: string | null, esErrorProgramacion: boolean, esRechazoBuzon: boolean }}
 */
export function interpretarErrorEntrega(rawError, estado = '') {
  if (!rawError || typeof rawError !== 'string') {
    return {
      mensajeOperativo: '',
      detalleTecnico: null,
      esErrorProgramacion: false,
      esRechazoBuzon: false,
    };
  }

  const err = rawError.trim();
  const lower = err.toLowerCase();

  // Caso 0: Entrega cancelada
  if (estado === 'CANCELADA' || lower.startsWith('cancelada')) {
    return {
      mensajeOperativo: err,
      detalleTecnico: null,
      esErrorProgramacion: false,
      esRechazoBuzon: false,
    };
  }

  // Caso 1: Correo inexistente / Rechazo de buzón (NDR 550, 5.1.10, RecipientNotFound)
  if (
    lower.includes('550 5.1.10') ||
    lower.includes('recipientnotfound') ||
    lower.includes('recipient not found') ||
    lower.includes('user not found') ||
    lower.includes('no such user') ||
    lower.includes('mailbox unavailable') ||
    lower.includes('invalid recipient') ||
    lower.includes('resolver.adr.recipientnotfound')
  ) {
    return {
      mensajeOperativo: 'No se pudo entregar porque el correo del destinatario no existe o no está habilitado.',
      detalleTecnico: err,
      esErrorProgramacion: false,
      esRechazoBuzon: true,
    };
  }

  // Caso 2: Error de programación / excepción de runtime (ej. text.replace sobre undefined)
  if (
    lower.includes('undefined is not') ||
    lower.includes('text.replace') ||
    lower.includes('typeerror') ||
    lower.includes('referenceerror') ||
    lower.includes('syntaxerror') ||
    lower.includes('cannot read properties') ||
    lower.includes('is not a function') ||
    lower.includes('evaluating')
  ) {
    return {
      mensajeOperativo: 'No se pudo preparar el correo por un error interno del sistema.',
      detalleTecnico: err,
      esErrorProgramacion: true,
      esRechazoBuzon: false,
    };
  }

  // Caso 3: Servicio de correo deshabilitado / pausado por configuración
  if (lower.includes('email_enabled=false') || lower.includes('servicio de correo pausado')) {
    return {
      mensajeOperativo: 'Envíos en espera: el despacho de correos está pausado por configuración.',
      detalleTecnico: err,
      esErrorProgramacion: false,
      esRechazoBuzon: false,
    };
  }

  // Caso 4: Correo no configurado en el usuario
  if (lower.includes('correo no configurado') || lower.includes('no tiene una dirección de correo')) {
    return {
      mensajeOperativo: 'El usuario no tiene una dirección de correo electrónico configurada.',
      detalleTecnico: err,
      esErrorProgramacion: false,
      esRechazoBuzon: false,
    };
  }

  // Caso 5: Error de conexión SMTP / Red
  if (
    lower.includes('etimedout') ||
    lower.includes('econnrefused') ||
    lower.includes('connection timeout') ||
    lower.includes('timeout')
  ) {
    return {
      mensajeOperativo: 'Error temporal de conexión con el servidor de correo. Se reintentará automáticamente.',
      detalleTecnico: err,
      esErrorProgramacion: false,
      esRechazoBuzon: false,
    };
  }

  // Fallback por defecto: si el mensaje es corto (< 90 caracteres) y amigable, se muestra tal cual
  if (err.length <= 90 && !err.includes('\n') && !err.includes('{')) {
    return {
      mensajeOperativo: err,
      detalleTecnico: null,
      esErrorProgramacion: false,
      esRechazoBuzon: false,
    };
  }

  // Fallback para mensajes largos o técnicos no clasificados
  return {
    mensajeOperativo: 'Ocurrió un error durante el intento de entrega.',
    detalleTecnico: err,
    esErrorProgramacion: false,
    esRechazoBuzon: false,
  };
}
