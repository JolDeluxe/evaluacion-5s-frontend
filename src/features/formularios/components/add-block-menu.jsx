import { Button } from '@/components/ui/button';
import { BLOQUES_AGREGABLES } from '@/features/formularios/helpers/formulario-editor-helpers';

export function AddBlockMenu({ onAdd, disabled }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Agregar bloque</p>
      <div className="flex flex-wrap gap-2">
        {BLOQUES_AGREGABLES.map((bloque) => (
          <Button key={bloque.tipo} variant="ghost" icon={bloque.icon} disabled={disabled} onClick={() => onAdd(bloque.tipo)}>
            {bloque.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
