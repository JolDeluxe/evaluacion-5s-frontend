import { useParams } from 'react-router';
import { EditorFormulario } from '@/features/administracion/formularios/components/editor-formulario';

export function FormularioEditorPage() {
  const { formularioId } = useParams();
  return <EditorFormulario formularioId={formularioId} />;
}
