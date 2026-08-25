import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function BloqueToolbar({ bloque, index, total, readOnly, onMoveUp, onMoveDown, onDelete, dragProps }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
          aria-label="Arrastrar bloque"
          disabled={readOnly}
          {...dragProps}
        >
          <Icon name="drag_indicator" />
        </button>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Orden {index + 1}</p>
          <p className="text-sm font-black text-slate-700">{bloque.tipo}</p>
        </div>
      </div>
      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" icon="keyboard_arrow_up" disabled={index === 0} onClick={onMoveUp}>
            Subir
          </Button>
          <Button variant="ghost" size="sm" icon="keyboard_arrow_down" disabled={index === total - 1} onClick={onMoveDown}>
            Bajar
          </Button>
          <Button variant="ghost" size="sm" icon="delete" onClick={onDelete}>
            Quitar
          </Button>
        </div>
      )}
    </div>
  );
}
