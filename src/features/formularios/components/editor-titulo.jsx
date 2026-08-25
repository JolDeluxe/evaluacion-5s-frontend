import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';

export function EditorTitulo({ bloque, onChange, readOnly }) {
  return (
    <div className="space-y-2">
      <Label>Nombre de seccion</Label>
      <Input value={bloque.etiqueta} disabled={readOnly} onChange={(event) => onChange({ etiqueta: event.target.value })} />
    </div>
  );
}
