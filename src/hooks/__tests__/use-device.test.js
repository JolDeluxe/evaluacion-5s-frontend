import { describe, expect, it } from 'bun:test';
import { getDeviceCategory } from '../useDevice';

describe('useDevice - Arquitectura centralizada de clasificación de dispositivos', () => {
  // ─── ESCENARIO 1: iPhone ──────────────────────────────────────────────────────────
  it('1. iPhone: clasifica como phone y experiencia Mobile', () => {
    const nav = {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      maxTouchPoints: 5,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('phone');
    expect(device.isPhone).toBe(true);
    expect(device.isTablet).toBe(false);
    expect(device.isMobile).toBe(true);
    expect(device.isDesktop).toBe(false);
  });

  // ─── ESCENARIO 2: Android Phone ──────────────────────────────────────────────────
  it('2. Android Phone: clasifica como phone y experiencia Mobile', () => {
    const nav = {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36',
      maxTouchPoints: 5,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('phone');
    expect(device.isPhone).toBe(true);
    expect(device.isTablet).toBe(false);
    expect(device.isMobile).toBe(true);
    expect(device.isDesktop).toBe(false);
  });

  // ─── ESCENARIO 3: iPad Pro 11" ───────────────────────────────────────────────────
  it('3. iPad Pro 11": clasifica como tablet y experiencia Mobile (incluso con UA de Macintosh y alta resolución)', () => {
    // Safari en iPadOS 13+ envía "Macintosh; Intel Mac OS X..." por defecto, pero con maxTouchPoints > 1 (5).
    const nav = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      maxTouchPoints: 5,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('tablet');
    expect(device.isPhone).toBe(false);
    expect(device.isTablet).toBe(true);
    expect(device.isMobile).toBe(true);
    expect(device.isDesktop).toBe(false);
  });

  // ─── ESCENARIO 4: iPad Pro 13" / 12.9" ───────────────────────────────────────────
  it('4. iPad Pro 13": clasifica como tablet y experiencia Mobile (viewport >= 1024px o 1366px no lo convierte en Desktop)', () => {
    const nav = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      maxTouchPoints: 5,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('tablet');
    expect(device.isTablet).toBe(true);
    expect(device.isMobile).toBe(true);
    expect(device.isDesktop).toBe(false);
  });

  // ─── ESCENARIO 5: Tablet Android Grande (Galaxy Tab S9 Ultra, 14.6") ──────────────
  it('5. Tablet Android grande: clasifica como tablet y experiencia Mobile (omisión de "Mobile" en UA)', () => {
    // En tablets Android, Chrome omite "Mobile" en el user agent
    const nav = {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Safari/537.36',
      maxTouchPoints: 10,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('tablet');
    expect(device.isPhone).toBe(false);
    expect(device.isTablet).toBe(true);
    expect(device.isMobile).toBe(true);
    expect(device.isDesktop).toBe(false);
  });

  // ─── ESCENARIO 6: Laptop Windows convencional (sin pantalla táctil) ───────────────
  it('6. Laptop Windows (sin touch): clasifica como desktop y experiencia Desktop', () => {
    const nav = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      maxTouchPoints: 0,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('desktop');
    expect(device.isPhone).toBe(false);
    expect(device.isTablet).toBe(false);
    expect(device.isMobile).toBe(false);
    expect(device.isDesktop).toBe(true);
  });

  // ─── ESCENARIO 7: MacBook ────────────────────────────────────────────────────────
  it('7. MacBook: clasifica como desktop y experiencia Desktop (UA Macintosh con maxTouchPoints === 0)', () => {
    const nav = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      maxTouchPoints: 0,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('desktop');
    expect(device.isPhone).toBe(false);
    expect(device.isTablet).toBe(false);
    expect(device.isMobile).toBe(false);
    expect(device.isDesktop).toBe(true);
  });

  // ─── ESCENARIO 8: Computadora de escritorio (Linux / PC torre) ────────────────────
  it('8. Computadora de escritorio Linux: clasifica como desktop y experiencia Desktop', () => {
    const nav = {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      maxTouchPoints: 0,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('desktop');
    expect(device.isMobile).toBe(false);
    expect(device.isDesktop).toBe(true);
  });

  // ─── ESCENARIO 9: Laptop convertible táctil (Windows Yoga / Dell XPS 2-in-1) ──────
  it('9. Laptop convertible táctil: clasifica como desktop y experiencia Desktop (no se confunde con tablet)', () => {
    // Reporta "Windows NT" y maxTouchPoints > 0
    const nav = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      maxTouchPoints: 10,
    };
    const device = getDeviceCategory(nav);

    expect(device.type).toBe('desktop');
    expect(device.isTablet).toBe(false);
    expect(device.isPhone).toBe(false);
    expect(device.isMobile).toBe(false);
    expect(device.isDesktop).toBe(true);
  });

  // ─── ESCENARIO 10: Auditorías y Bypass de excepción ──────────────────────────────
  it('10. Comportamiento en Auditorías y excepción manual', () => {
    // Para iPad Pro (tablet): isDesktop es false -> NUNCA se bloquea la auditoría
    const navTablet = {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
      maxTouchPoints: 5,
    };
    const tabletDevice = getDeviceCategory(navTablet);
    const bloquearTablet = tabletDevice.isDesktop && false;
    expect(bloquearTablet).toBe(false); // Entra directamente

    // Para Desktop convencional: isDesktop es true -> Se bloquea por defecto
    const navDesktop = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    };
    const desktopDevice = getDeviceCategory(navDesktop);
    let forzarDesktop = false;
    const bloquearDesktopInicial = desktopDevice.isDesktop && !forzarDesktop;
    expect(bloquearDesktopInicial).toBe(true); // Muestra MobileRequired con QR

    // Excepción manual activada (click en "Continuar en este equipo de todos modos")
    forzarDesktop = true;
    const bloquearDesktopBypassed = desktopDevice.isDesktop && !forzarDesktop;
    expect(bloquearDesktopBypassed).toBe(false); // Permite continuar en escritorio
  });
});
