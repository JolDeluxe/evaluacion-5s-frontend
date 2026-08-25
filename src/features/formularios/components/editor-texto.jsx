import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';

export function EditorTexto({ bloque, onChange, readOnly }) {
  return (
    <div className="grid gap-3 md:grid-cols-[220px_1fr]">
      <div className="space-y-2">
        <Label>Etiqueta</Label>
        <Input value={bloque.etiqueta} disabled={readOnly} onChange={(event) => onChange({ etiqueta: event.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Contenido</Label>
        <textarea
          value={bloque.descripcion ?? ''}
          disabled={readOnly}
          onChange={(event) => onChange({ descripcion: event.target.value })}
          rows={4}
          className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20 disabled:bg-slate-100"
        />
      </div>
    </div>
  );
}
