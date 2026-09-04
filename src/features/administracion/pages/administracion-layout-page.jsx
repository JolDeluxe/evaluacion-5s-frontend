import { Outlet, useLocation } from 'react-router';
import { AdministracionNav } from '@/features/administracion/components/administracion-nav';

export function AdministracionLayoutPage() {
  const location = useLocation();
  const isPrintView = location.pathname === '/admin/areas/qr/imprimir';

  if (isPrintView) {
    return <Outlet />;
  }

  return (
    <section className="space-y-5">
      <div className="hidden md:block">
        <AdministracionNav />
      </div>

      <div>
        <Outlet />
      </div>
    </section>
  );
}
