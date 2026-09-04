import { OfflineBanner } from '@/components/ui/offline-banner';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { DesktopLayout } from '@/layouts/desktop-layout';
import { MobileLayout } from '@/layouts/mobile-layout';
import { Outlet, useLocation } from 'react-router';
import { PendientesAsignacionManager } from '@/features/administracion/asignaciones/components/pendientes-asignacion-manager';

export function DashboardLayout() {
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const isAuditCapture = /^\/auditorias\/[^/]+\/realizar$/.test(location.pathname);
  const isPrintView = location.pathname === '/admin/areas/qr/imprimir';

  return (
    <>
      <OfflineBanner />
      {isAuditCapture || isPrintView ? <Outlet /> : isDesktop ? <DesktopLayout /> : <MobileLayout />}
      {!isAuditCapture && !isPrintView && <PendientesAsignacionManager />}
    </>
  );
}
