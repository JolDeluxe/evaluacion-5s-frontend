import { describe, expect, it } from 'bun:test';
import {
  CANAL_CONFIG,
  CANAL_DEFAULT,
  getCanalConfig,
} from '../utils/canal-config';

describe('Identidad Visual y Configuración de Canales (Frontend)', () => {
  it('1. CORREO: tiene icono de correo, etiqueta explícita y paleta azul suave/contrastada', () => {
    const config = getCanalConfig('CORREO');

    expect(config.clave).toBe('CORREO');
    expect(config.etiqueta).toBe('Correo');
    expect(config.etiquetaBadge).toBe('CORREO');
    expect(config.tipoIcono).toBe('material');
    expect(config.iconoNombre).toBe('mail');

    // Clases visuales de acento azul
    expect(config.badgeClasses).toContain('bg-blue-50');
    expect(config.badgeClasses).toContain('text-blue-700');
    expect(config.iconClasses).toContain('text-blue-600');
    expect(config.filterActiveClasses).toContain('bg-blue-600');
  });

  it('2. WHATSAPP: tiene icono svg_whatsapp, etiqueta explícita y paleta verde suave/contrastada', () => {
    const config = getCanalConfig('WHATSAPP');

    expect(config.clave).toBe('WHATSAPP');
    expect(config.etiqueta).toBe('WhatsApp');
    expect(config.etiquetaBadge).toBe('WHATSAPP');
    expect(config.tipoIcono).toBe('svg_whatsapp');

    // Clases visuales de acento verde
    expect(config.badgeClasses).toContain('bg-emerald-50');
    expect(config.badgeClasses).toContain('text-emerald-800');
    expect(config.iconClasses).toContain('text-emerald-600');
    expect(config.filterActiveClasses).toContain('bg-emerald-600');
  });

  it('3. PUSH: tiene icono de notificaciones/campana, etiqueta explícita y paleta morada', () => {
    const config = getCanalConfig('PUSH');

    expect(config.clave).toBe('PUSH');
    expect(config.etiqueta).toBe('Push');
    expect(config.etiquetaBadge).toBe('PUSH');
    expect(config.tipoIcono).toBe('material');
    expect(config.iconoNombre).toBe('notifications');

    // Clases visuales de acento morado
    expect(config.badgeClasses).toContain('bg-purple-50');
    expect(config.badgeClasses).toContain('text-purple-700');
    expect(config.iconClasses).toContain('text-purple-600');
    expect(config.filterActiveClasses).toContain('bg-purple-600');
  });

  it('4. Fallback para canal no reconocido o vacío devuelve valores por defecto seguros', () => {
    const configVacio = getCanalConfig('');
    expect(configVacio.clave).toBe(CANAL_DEFAULT.clave);

    const configNulo = getCanalConfig(null);
    expect(configNulo.clave).toBe(CANAL_DEFAULT.clave);

    const configDesconocido = getCanalConfig('SMS');
    expect(configDesconocido.etiquetaBadge).toBe('SMS');
  });

  it('5. Independencia estricta entre color de Canal y color de Estado', () => {
    // Definición de estados del sistema
    const estadoBadgeMap = {
      ENVIADA: { status: 'success', label: 'Enviada' },
      PENDIENTE: { status: 'info', label: 'Pendiente' },
      FALLIDA: { status: 'danger', label: 'Fallida' },
      CANCELADA: { status: 'neutral', label: 'Cancelada' },
    };

    // Caso A: CORREO (azul) + FALLIDA (rojo/danger)
    const canalCorreo = getCanalConfig('CORREO');
    const estadoFallida = estadoBadgeMap.FALLIDA;
    expect(canalCorreo.badgeClasses).toContain('bg-blue-50');
    expect(estadoFallida.status).toBe('danger');
    expect(canalCorreo.badgeClasses).not.toContain('danger');

    // Caso B: WHATSAPP (verde) + ENVIADA (success)
    const canalWa = getCanalConfig('WHATSAPP');
    const estadoEnviada = estadoBadgeMap.ENVIADA;
    expect(canalWa.badgeClasses).toContain('bg-emerald-50');
    expect(estadoEnviada.status).toBe('success');

    // Caso C: PUSH (morado) + PENDIENTE (info)
    const canalPush = getCanalConfig('PUSH');
    const estadoPendiente = estadoBadgeMap.PENDIENTE;
    expect(canalPush.badgeClasses).toContain('bg-purple-50');
    expect(estadoPendiente.status).toBe('info');
  });
});
