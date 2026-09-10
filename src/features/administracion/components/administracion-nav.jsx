import { SectionTabs } from '@/components/ui/section-tabs';

const ADMIN_TABS = [
  { id: 'asignaciones', label: 'Asignaciones', to: '/admin/asignaciones' },
  { id: 'formularios', label: 'Formularios', to: '/admin/formularios' },
  { id: 'areas', label: 'Áreas', to: '/admin/areas' },
  { id: 'usuarios', label: 'Usuarios', to: '/admin/usuarios' },
  { id: 'delegaciones', label: 'Delegaciones', to: '/admin/delegaciones' },
];

export function AdministracionNav({ className = '' }) {
  return (
    <SectionTabs tabs={ADMIN_TABS} className={className} label="Administración" />
  );
}
