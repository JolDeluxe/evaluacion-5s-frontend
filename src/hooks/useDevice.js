import { useState, useEffect } from 'react';

/**
 * Clasifica de forma determinista y contextual el dispositivo cliente.
 * Acepta parámetros opcionales para pruebas unitarias y entornos sin DOM (SSR).
 * 
 * Regla de negocio y UX:
 * - Teléfonos: experiencia Mobile (type: 'phone', isMobile: true, isDesktop: false).
 * - Tablets: experiencia Mobile (type: 'tablet', isMobile: true, isDesktop: false),
 *   independientemente de que su viewport supere los 1024px (iPad Pro 11", 13", Android tablets grandes).
 * - Laptops y computadoras de escritorio: experiencia Desktop (type: 'desktop', isMobile: false, isDesktop: true).
 * - Laptops con pantalla táctil (Windows convertibles): experiencia Desktop (evita clasificarlas como tablets).
 * 
 * @param {Navigator} [customNavigator]
 * @param {Window} [customWindow]
 */
export function getDeviceCategory(customNavigator, customWindow) {
  const nav = customNavigator !== undefined ? customNavigator : (typeof navigator !== 'undefined' ? navigator : null);
  const win = customWindow !== undefined ? customWindow : (typeof window !== 'undefined' ? window : null);

  if (!nav) {
    return {
      type: 'desktop',
      isPhone: false,
      isTablet: false,
      isMobile: false,
      isDesktop: true,
    };
  }

  const ua = nav.userAgent || nav.vendor || (win && win.opera) || '';
  const maxTouchPoints = Number(nav.maxTouchPoints || 0);

  // 1. IPADOS / IPAD (todos los modelos, incluidos iPad Pro 11" y 12.9"/13")
  // En iPadOS 13+ Safari se identifica por defecto con User-Agent "Macintosh; Intel Mac OS X...".
  // Apple utiliza oficialmente la combinación de "Macintosh" (o "iPad") con maxTouchPoints > 1
  // para identificar iPads, ya que las computadoras Mac reales jamás han tenido pantalla táctil.
  const isIPad =
    (/Macintosh/i.test(ua) || /iPad/i.test(ua)) && maxTouchPoints > 1;

  if (isIPad) {
    return {
      type: 'tablet',
      isPhone: false,
      isTablet: true,
      isMobile: true,
      isDesktop: false,
    };
  }

  // 2. IPHONE & IPOD
  if (/iPhone|iPod/i.test(ua)) {
    return {
      type: 'phone',
      isPhone: true,
      isTablet: false,
      isMobile: true,
      isDesktop: false,
    };
  }

  // 3. DISPOSITIVOS ANDROID (Diferenciación entre Tablet y Teléfono)
  if (/Android/i.test(ua)) {
    // Los navegadores en teléfonos Android incluyen el token "Mobile".
    // Las tablets Android (Galaxy Tab, Xiaomi Pad, Lenovo) generalmente omiten "Mobile" o traen "Tablet".
    const isAndroidPhone = /Mobile/i.test(ua) && !/Tablet/i.test(ua);
    return {
      type: isAndroidPhone ? 'phone' : 'tablet',
      isPhone: isAndroidPhone,
      isTablet: !isAndroidPhone,
      isMobile: true,
      isDesktop: false,
    };
  }

  // 4. OTRAS TABLETS DEDICADAS Y E-READERS
  if (/Tablet|Silk|Kindle|PlayBook/i.test(ua)) {
    return {
      type: 'tablet',
      isPhone: false,
      isTablet: true,
      isMobile: true,
      isDesktop: false,
    };
  }

  // 5. OTROS TELÉFONOS MÓVILES
  if (/webOS|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua)) {
    return {
      type: 'phone',
      isPhone: true,
      isTablet: false,
      isMobile: true,
      isDesktop: false,
    };
  }

  // 6. LAPTOPS TÁCTILES Y CONVERTIBLES WINDOWS VS TABLETS
  // Una laptop Windows convertible (Lenovo Yoga, Dell XPS 2-in-1, HP Spectre) reporta "Windows NT"
  // y maxTouchPoints > 0. Evaluando el contexto, es una computadora/laptop y debe recibir Desktop.
  if (/Windows NT/i.test(ua)) {
    return {
      type: 'desktop',
      isPhone: false,
      isTablet: false,
      isMobile: false,
      isDesktop: true,
    };
  }

  // Mac real (MacBook, iMac, Mac Mini): maxTouchPoints es 0
  if (/Macintosh/i.test(ua)) {
    return {
      type: 'desktop',
      isPhone: false,
      isTablet: false,
      isMobile: false,
      isDesktop: true,
    };
  }

  // Linux de escritorio convencional
  if (/Linux|X11/i.test(ua)) {
    return {
      type: 'desktop',
      isPhone: false,
      isTablet: false,
      isMobile: false,
      isDesktop: true,
    };
  }

  // 7. HEURÍSTICA DE PANTALLA TÁCTIL (Fallback si el OS no es ninguno de los anteriores)
  const isCoarse = Boolean(win && win.matchMedia && win.matchMedia('(pointer: coarse)').matches);
  if (isCoarse && maxTouchPoints > 0) {
    return {
      type: 'tablet',
      isPhone: false,
      isTablet: true,
      isMobile: true,
      isDesktop: false,
    };
  }

  return {
    type: 'desktop',
    isPhone: false,
    isTablet: false,
    isMobile: false,
    isDesktop: true,
  };
}

/**
 * Hook reactivo centralizado para obtener la categoría de dispositivo y modo de experiencia UX.
 */
export function useDevice() {
  const [device, setDevice] = useState(() => getDeviceCategory());
  const [isWideViewport, setIsWideViewport] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const currentDevice = getDeviceCategory();
    setDevice(currentDevice);

    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.dataset.deviceType = currentDevice.type;
      document.documentElement.dataset.deviceExperience = currentDevice.isMobile ? 'mobile' : 'desktop';
    }

    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setIsWideViewport(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // REGLAS FUNDAMENTALES DE EXPERIENCIA UX:
  // - Teléfonos y Tablets: SIEMPRE experiencia Mobile, independientemente de la resolución o viewport.
  // - Laptops y Desktops: Experiencia Desktop si el viewport no está colapsado a móvil (< 1024px).
  const isMobileExperience = device.isMobile || !isWideViewport;
  const isDesktopExperience = device.isDesktop && isWideViewport;

  return {
    type: device.type,
    isPhone: device.isPhone,
    isTablet: device.isTablet,
    isMobileDevice: device.isMobile,
    isDesktopDevice: device.isDesktop,
    // Banderas de experiencia aplicables a vistas, menús y layouts
    isMobile: isMobileExperience,
    isDesktop: isDesktopExperience,
    isWideViewport,
  };
}

/**
 * Hook de compatibilidad directa.
 * Retorna true ÚNICAMENTE para computadoras de escritorio y laptops en resoluciones adecuadas.
 * NUNCA retorna true para tablets (iPad Pro, Android tablets, etc.) ni teléfonos.
 */
export function useIsDesktop() {
  const { isDesktop } = useDevice();
  return isDesktop;
}

/**
 * Hook que retorna true para cualquier dispositivo que deba recibir experiencia móvil (teléfonos y tablets).
 */
export function useIsMobile() {
  const { isMobile } = useDevice();
  return isMobile;
}

/**
 * Hook para saber si el dispositivo físico es una tablet.
 */
export function useIsTablet() {
  const { isTablet } = useDevice();
  return isTablet;
}
