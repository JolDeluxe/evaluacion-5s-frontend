import { useEffect, useState } from 'react';
import { Fab } from './fab';
import { useUIStore } from '@/stores/ui-store';

export const ScrollToTopButton = ({
  bottom = '84px',
  left = '20px',
  threshold = 300,
  getContainer = () => document.querySelector('main'),
}) => {
  const { isBottomNav } = useUIStore();
  const finalBottom = isBottomNav && bottom && bottom.toString().includes('px')
    ? `calc(${bottom} + 75px)`
    : bottom;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = getContainer();
    if (!container) return undefined;

    const onScroll = () => setVisible(container.scrollTop > threshold);
    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => container.removeEventListener('scroll', onScroll);
  }, [getContainer, threshold]);

  if (!visible) return null;

  const scrollToTop = () => {
    const container = getContainer();
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Fab
      icon="arrow_upward"
      onClick={scrollToTop}
      variant="glass"
      size="sm"
      positionClass=""
      ariaLabel="Volver arriba"
      style={{ position: 'fixed', bottom: finalBottom, left, zIndex: 40 }}
    />
  );
};
