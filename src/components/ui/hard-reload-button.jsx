import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { hardReload } from '@/utils/hard-reload';

export const HardReloadButton = ({ className }) => {
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    if (isReloading) return;
    setIsReloading(true);
    await hardReload();
  };

  return (
    <Button
      type="button"
      onClick={handleReload}
      disabled={isReloading}
      title="Forzar actualización"
      aria-label="Forzar actualización"
      variant="icon"
      size="icon"
      icon="refresh"
      className={className}
      isLoading={isReloading}
    />
  );
};
