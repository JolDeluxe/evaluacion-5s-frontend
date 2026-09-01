import { Outlet } from 'react-router';
import { AdministracionNav } from '@/features/administracion/components/administracion-nav';

export function AdministracionLayoutPage() {
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
