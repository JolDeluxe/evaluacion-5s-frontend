import { Outlet } from 'react-router';
import { SistemaNav } from '@/features/sistema/components/sistema-nav';

export function SistemaLayoutPage() {
  return (
    <section className="space-y-5 pt-4 sm:pt-0">
      <SistemaNav />

      <div>
        <Outlet />
      </div>
    </section>
  );
}
