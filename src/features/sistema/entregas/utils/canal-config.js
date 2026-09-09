/**
 * Configuración única y centralizada de presentación visual por canal.
 * CORREO   -> Azul
 * WHATSAPP -> Verde
 * PUSH     -> Morado
 */
export const CANAL_CONFIG = {
  CORREO: {
    clave: 'CORREO',
    etiqueta: 'Correo',
    etiquetaBadge: 'CORREO',
    tipoIcono: 'material',
    iconoNombre: 'mail',
    // Badge de tabla y modal: fondo azul suave, texto azul marino contrastado, borde azul sutil
    badgeClasses: 'bg-blue-50 text-blue-700 border-blue-200/80',
    iconClasses: 'text-blue-600',
    // Tab de filtro inactivo: suave acento azul
    filterInactiveClasses: 'bg-blue-50/70 text-blue-700 hover:bg-blue-100/80 border-blue-200/60',
    // Tab de filtro activo: azul principal sólido
    filterActiveClasses: 'bg-blue-600 text-white shadow-sm border-blue-700',
    dotColor: 'bg-blue-500',
  },
  WHATSAPP: {
    clave: 'WHATSAPP',
    etiqueta: 'WhatsApp',
    etiquetaBadge: 'WHATSAPP',
    tipoIcono: 'svg_whatsapp',
    iconoNombre: 'whatsapp',
    // Badge de tabla y modal: fondo verde suave, texto verde oscuro contrastado, borde verde sutil
    badgeClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    iconClasses: 'text-emerald-600',
    // Tab de filtro inactivo: suave acento verde
    filterInactiveClasses: 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/80 border-emerald-200/60',
    // Tab de filtro activo: verde esmeralda sólido
    filterActiveClasses: 'bg-emerald-600 text-white shadow-sm border-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  PUSH: {
    clave: 'PUSH',
    etiqueta: 'Push',
    etiquetaBadge: 'PUSH',
    tipoIcono: 'material',
    iconoNombre: 'notifications',
    // Badge de tabla y modal: fondo morado suave, texto morado oscuro contrastado, borde morado sutil
    badgeClasses: 'bg-purple-50 text-purple-700 border-purple-200/80',
    iconClasses: 'text-purple-600',
    // Tab de filtro inactivo: suave acento morado
    filterInactiveClasses: 'bg-purple-50/70 text-purple-700 hover:bg-purple-100/80 border-purple-200/60',
    // Tab de filtro activo: morado sólido
    filterActiveClasses: 'bg-purple-600 text-white shadow-sm border-purple-700',
    dotColor: 'bg-purple-500',
  },
};

export const CANAL_DEFAULT = {
  clave: 'OTRO',
  etiqueta: 'Otro',
  etiquetaBadge: 'OTRO',
  tipoIcono: 'material',
  iconoNombre: 'send',
  badgeClasses: 'bg-slate-100 text-slate-700 border border-slate-200',
  iconClasses: 'text-slate-500',
  filterInactiveClasses: 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200/60',
  filterActiveClasses: 'bg-slate-900 text-white shadow-sm border-slate-900',
  dotColor: 'bg-slate-400',
};

/**
 * Obtiene la configuración de presentación para un canal determinado.
 * @param {string} canal - Identificador del canal (e.g., 'CORREO', 'WHATSAPP', 'PUSH')
 * @returns {object} Configuración completa de presentación
 */
export function getCanalConfig(canal) {
  if (!canal) return CANAL_DEFAULT;
  const upper = String(canal).toUpperCase().trim();
  return CANAL_CONFIG[upper] || { ...CANAL_DEFAULT, etiqueta: canal, etiquetaBadge: upper };
}
