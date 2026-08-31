import { Outlet } from 'react-router';
import { SectionTabs } from '@/components/ui/section-tabs';

const ADMIN_TABS = [
  { label: 'Asignaciones', to: '/admin/asignaciones' },
  { label: 'Formularios', to: '/admin/formularios' },
  { label: 'Áreas', to: '/admin/areas' },
  { label: 'Usuarios', to: '/admin/usuarios' },
];

export function AdministracionLayoutPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
          Administración
        </p>
        <h1 className="fuente-titulos text-3xl font-normal uppercase leading-none text-marca-primario">
          Administración
        </h1>
      </div>

      <SectionTabs tabs={ADMIN_TABS} />

      <div>
        <Outlet />
      </div>
    </section>
  );
}
