import { SelectorMesNavegacion } from '@/components/ui/selector-mes-navegacion';

export function MonthPicker({ anio, mes, onChange }) {
  return (
    <SelectorMesNavegacion
      anio={anio}
      mes={mes}
      onChange={({ anio: nextAnio, mes: nextMes }) => onChange({ anio: nextAnio, mes: nextMes })}
    />
  );
}
