import { useState } from 'react';
import { Fab } from './fab';
import { hardReload } from '@/utils/hard-reload';

export const RefreshFab = ({
  bottom = '32px',
  right = '32px',
  left,
  size = 50,
  zIndex = 49,
  className,
}) => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = async () => {
    if (spinning) return;
    setSpinning(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await hardReload();
    setSpinning(false);
  };

  return (
    <Fab
      icon="refresh"
      onClick={handleClick}
      disabled={spinning}
      isLoading={spinning}
      variant="glass"
      size={size}
      positionClass=""
      className={className}
      ariaLabel="Recargar aplicación"
      style={{
        position: 'fixed',
        bottom,
        zIndex,
        ...(left ? { left } : { right }),
      }}
    />
  );
};
