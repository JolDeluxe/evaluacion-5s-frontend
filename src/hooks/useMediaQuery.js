import { useState, useEffect } from 'react';
import {
  getDeviceCategory,
  useDevice,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
} from './useDevice';

export {
  getDeviceCategory,
  useDevice,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
};

/**
 * Hook de bajo nivel para consultas de medios CSS (basadas en píxeles).
 * Úsalo cuando necesites evaluar queries de medios puramente cosméticos (p. ej. dark mode).
 * Para la experiencia UI de Mobile vs Desktop, usa siempre useIsDesktop() o useDevice().
 */
export function useMediaQuery(query) {
  const getMatches = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const media = window.matchMedia(query);

    const listener = (event) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Compatibilidad con código previo.
 */
export function isMobileOrTabletDevice() {
  const device = getDeviceCategory();
  return device.isMobile;
}

export function useIsMobileOrTablet() {
  const { isMobile } = useDevice();
  return isMobile;
}
