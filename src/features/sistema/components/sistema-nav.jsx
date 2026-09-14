import { SectionTabs } from '@/components/ui/section-tabs';

const SISTEMA_TABS = [
  { id: 'entregas', label: 'Entregas', to: '/sistema/entregas' },
  { id: 'sesiones', label: 'Sesiones', to: '/sistema/sesiones' },
  { id: 'registros', label: 'Registro técnico', to: '/sistema/registros' },
];

export function SistemaNav({ className = '' }) {
  return (
    <SectionTabs tabs={SISTEMA_TABS} className={className} label="Configuración" />
  );
}
