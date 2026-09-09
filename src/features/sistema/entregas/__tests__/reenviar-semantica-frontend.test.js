import { describe, expect, it } from 'bun:test';

// Helper de resolución de reenvío para pruebas frontend
function evaluarSemanticaReenvio({ entrega, usuario }) {
  const destinoOriginal = entrega?.destinoSnapshot || '';
  const destinoActual = usuario?.correo?.trim() || '';

  const origNorm = destinoOriginal.trim().toLowerCase();
  const actNorm = destinoActual.toLowerCase();
  const sonDistintos = Boolean(origNorm && actNorm && origNorm !== actNorm);

  let errorBloqueo = null;
  if (!usuario) {
    errorBloqueo = 'El usuario destinatario ya no existe en el sistema.';
  } else if (usuario.activo === false) {
    errorBloqueo = `El usuario "${usuario.nombre || 'Destinatario'}" se encuentra inactivo o dado de baja.`;
  } else if (!destinoActual) {
    errorBloqueo = `El usuario "${usuario.nombre || 'Destinatario'}" no tiene una dirección de correo configurada actualmente.`;
  }

  return {
    destinoOriginal,
    destinoActual,
    sonDistintos,
    errorBloqueo,
    puedeReenviar: errorBloqueo === null,
  };
}

describe('Semántica y Protecciones de Reenvío en Entregas (Frontend)', () => {
  it('1. mismo correo → no detecta diferencia y permite el reenvío', () => {
    const res = evaluarSemanticaReenvio({
      entrega: { id: 341, destinoSnapshot: 'andrea.lopez@cuadra.com.mx' },
      usuario: { id: 10, nombre: 'Andrea López', correo: 'andrea.lopez@cuadra.com.mx', activo: true },
    });

    expect(res.sonDistintos).toBe(false);
    expect(res.errorBloqueo).toBeNull();
    expect(res.puedeReenviar).toBe(true);
    expect(res.destinoActual).toBe('andrea.lopez@cuadra.com.mx');
  });

  it('2. correo cambiado → detecta diferencia y usará el correo ACTUAL del usuario', () => {
    const res = evaluarSemanticaReenvio({
      entrega: { id: 341, destinoSnapshot: 'andrea.lopez@cuadra.com.mx' },
      usuario: { id: 10, nombre: 'Andrea López', correo: 'andrea.nueva@cuadra.com.mx', activo: true },
    });

    expect(res.sonDistintos).toBe(true);
    expect(res.destinoOriginal).toBe('andrea.lopez@cuadra.com.mx');
    expect(res.destinoActual).toBe('andrea.nueva@cuadra.com.mx');
    expect(res.errorBloqueo).toBeNull();
    expect(res.puedeReenviar).toBe(true);
  });

  it('3. sin correo actual → bloqueado con motivo explicativo (no reutiliza histórico)', () => {
    const res = evaluarSemanticaReenvio({
      entrega: { id: 341, destinoSnapshot: 'andrea.lopez@cuadra.com.mx' },
      usuario: { id: 10, nombre: 'Andrea López', correo: '', activo: true },
    });

    expect(res.puedeReenviar).toBe(false);
    expect(res.errorBloqueo).toContain('no tiene una dirección de correo configurada');
  });

  it('4. usuario inactivo → bloqueado con motivo explicativo', () => {
    const res = evaluarSemanticaReenvio({
      entrega: { id: 341, destinoSnapshot: 'andrea.lopez@cuadra.com.mx' },
      usuario: { id: 10, nombre: 'Andrea López', correo: 'andrea.nueva@cuadra.com.mx', activo: false },
    });

    expect(res.puedeReenviar).toBe(false);
    expect(res.errorBloqueo).toContain('inactivo o dado de baja');
  });

  it('5. usuario eliminado / inexistente → bloqueado con motivo explicativo', () => {
    const res = evaluarSemanticaReenvio({
      entrega: { id: 341, destinoSnapshot: 'andrea.lopez@cuadra.com.mx' },
      usuario: null,
    });

    expect(res.puedeReenviar).toBe(false);
    expect(res.errorBloqueo).toContain('ya no existe en el sistema');
  });
});
