import { BloqueToolbar } from '@/features/formularios/components/bloque-toolbar';
import { EditorCriterio5S } from '@/features/formularios/components/editor-criterio-5s';
import { EditorImagen } from '@/features/formularios/components/editor-imagen';
import { EditorTexto } from '@/features/formularios/components/editor-texto';
import { EditorTitulo } from '@/features/formularios/components/editor-titulo';

export function BloqueEditor({
  versionId,
  bloque,
  index,
  total,
  reglas,
  readOnly,
  onChange,
  onChangeReglas,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const dragProps = {
    draggable: !readOnly,
    onDragStart,
    onDragOver,
    onDrop,
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-lg shadow-slate-950/5 backdrop-blur-xl">
      <BloqueToolbar
        bloque={bloque}
        index={index}
        total={total}
        readOnly={readOnly}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        dragProps={dragProps}
      />
      <div className="p-4">
        {bloque.tipo === 'TITULO' && <EditorTitulo bloque={bloque} readOnly={readOnly} onChange={onChange} />}
        {bloque.tipo === 'TEXTO' && <EditorTexto bloque={bloque} readOnly={readOnly} onChange={onChange} />}
        {bloque.tipo === 'IMAGEN' && <EditorImagen versionId={versionId} bloque={bloque} readOnly={readOnly} onChange={onChange} />}
        {bloque.tipo === 'CRITERIO_5S' && (
          <EditorCriterio5S bloque={bloque} reglas={reglas} readOnly={readOnly} onChange={onChange} onChangeReglas={onChangeReglas} />
        )}
        {bloque.tipo === 'SEPARADOR' && (
          <div className="py-3">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          </div>
        )}
      </div>
    </article>
  );
}
