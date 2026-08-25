import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { crearOpcion } from '@/features/formularios/helpers/formulario-editor-helpers';

export function EditorOpciones({ opciones = [], onChange, readOnly }) {
  const actualizar = (index, cambios) => onChange(opciones.map((opcion, i) => (i === index ? { ...opcion, ...cambios } : opcion)));
  const quitar = (index) => onChange(opciones.filter((_, i) => i !== index).map((opcion, i) => ({ ...opcion, orden: i })));

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Respuestas</p>
      {opciones.map((opcion, index) => (
        <div key={opcion.claveEstable} className="grid gap-2 rounded-2xl border border-slate-200 bg-white/75 p-3 md:grid-cols-[1fr_1fr_100px_120px_42px]">
          <Input value={opcion.etiqueta} disabled={readOnly} onChange={(event) => actualizar(index, { etiqueta: event.target.value })} placeholder="Etiqueta" />
          <Input value={opcion.valor} disabled={readOnly} onChange={(event) => actualizar(index, { valor: event.target.value })} placeholder="Valor" />
          <Input type="number" step="0.01" value={opcion.valorPuntaje ?? ''} disabled={readOnly} onChange={(event) => actualizar(index, { valorPuntaje: event.target.value })} placeholder="Pts" />
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <input type="checkbox" checked={Boolean(opcion.excluyeDelPuntaje)} disabled={readOnly} onChange={(event) => actualizar(index, { excluyeDelPuntaje: event.target.checked })} />
            Excluye
          </label>
          {!readOnly && (
            <button type="button" aria-label="Quitar opcion" className="rounded-xl border border-red-100 bg-red-50 text-red-600" onClick={() => quitar(index)}>
              ×
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button variant="ghost" icon="add" onClick={() => onChange([...opciones, crearOpcion('Nueva opcion', 'NUEVA', 0, opciones.length)])}>
          Agregar opcion
        </Button>
      )}
    </div>
  );
}
