import { useParams } from 'react-router';
import { EditorFormulario } from '@/features/formularios/components/editor-formulario';

export function FormularioEditorPage() {
  const { formularioId, versionId } = useParams();
  return <EditorFormulario formularioId={formularioId} versionId={versionId} />;
}
