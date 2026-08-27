import { Outlet } from 'react-router';

import { PwaUpdateManager } from '@/components/pwa/pwa-update-manager';

export function AppRouteShell() {
  return (
    <>
      <Outlet />
      <PwaUpdateManager />
    </>
  );
}
