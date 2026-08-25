import { useState, useEffect } from 'react';

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

// Navaja suiza directa para usar en los componentes contenedores
export function useIsDesktop() {
  // Tailwind lg = 1024px.
  // true = Escritorio (lg, xl, 2xl)
  // false = Móvil/Tablet (xs, sm, md)
  return useMediaQuery('(min-width: 1024px)');
}
