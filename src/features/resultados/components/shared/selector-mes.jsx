import { SelectorMesNavegacion } from '@/components/ui/selector-mes-navegacion';

export function SelectorMes({ value, onChange }) {
  const [y, m] = (value || `${new Date().getFullYear()}-01`).split('-').map(Number);

  return (
    <SelectorMesNavegacion
      anio={y}
      mes={m}
      monthKey={value}
      onChange={({ monthKey }) => onChange(monthKey)}
    />
  );
}
