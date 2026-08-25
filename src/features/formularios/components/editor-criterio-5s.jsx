import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { EditorOpciones } from '@/features/formularios/components/editor-opciones';
import { EditorReglas } from '@/features/formularios/components/editor-reglas';

export function EditorCriterio5S({ bloque, reglas, onChange, onChangeReglas, readOnly }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Pregunta</Label>
        <Input value={bloque.etiqueta} disabled={readOnly} onChange={(event) => onChange({ etiqueta: event.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/75 px-3 py-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={Boolean(bloque.obligatorio)} disabled={readOnly} onChange={(event) => onChange({ obligatorio: event.target.checked })} />
          Obligatoria
        </label>
        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/75 px-3 py-2 text-sm font-bold text-slate-700">
          <input type="checkbox" checked={Boolean(bloque.puntua)} disabled={readOnly} onChange={(event) => onChange({ puntua: event.target.checked })} />
          Puntua
        </label>
        <div className="space-y-1">
          <Label>Puntaje maximo</Label>
          <Input type="number" step="0.01" value={bloque.puntajeMaximo ?? ''} disabled={readOnly} onChange={(event) => onChange({ puntajeMaximo: event.target.value })} />
        </div>
      </div>
      <EditorOpciones opciones={bloque.opciones ?? []} readOnly={readOnly} onChange={(opciones) => onChange({ opciones })} />
      <EditorReglas bloque={bloque} reglas={reglas} readOnly={readOnly} onChange={onChangeReglas} />
    </div>
  );
}
