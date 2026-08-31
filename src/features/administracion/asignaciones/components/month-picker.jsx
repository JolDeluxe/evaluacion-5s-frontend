import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Select } from '@/components/form/select';
import {
  getPeriodoAnterior,
  getPeriodoSiguiente,
  MESES,
} from '@/features/administracion/asignaciones/utils/asignaciones-utils';

export function MonthPicker({ anio, mes, onChange }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="w-44">
        <Label>Mes</Label>
        <Select value={String(mes)} onChange={(event) => onChange({ anio, mes: Number(event.target.value) })}>
          {MESES.map((nombre, index) => <option key={nombre} value={index + 1}>{nombre}</option>)}
        </Select>
      </div>

      <div className="w-32">
        <Label>Año</Label>
        <Input type="number" value={anio} min="2020" max="2100" onChange={(event) => onChange({ anio: Number(event.target.value), mes })} />
      </div>

      <Button variant="ghost" icon="chevron_left" onClick={() => onChange(getPeriodoAnterior(anio, mes))}>
        Anterior
      </Button>

      <Button variant="ghost" icon="chevron_right" onClick={() => onChange(getPeriodoSiguiente(anio, mes))}>
        Siguiente
      </Button>
    </div>
  );
}
