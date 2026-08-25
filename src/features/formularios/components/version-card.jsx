import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { EstadoVersionBadge } from '@/features/formularios/components/estado-version-badge';

export function VersionCard({ formularioId, version, onPreview, onCreateDraft, onArchive, creating }) {
  const criterios = version.bloques?.filter((bloque) => bloque.tipo === 'CRITERIO_5S').length ?? 0;
  const secciones = version.bloques?.filter((bloque) => bloque.tipo === 'TITULO').length ?? 0;
  const editable = version.estado === 'BORRADOR';

  return (
    <article className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-lg shadow-slate-950/5 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-black text-slate-950">V{version.numeroVersion}</h3>
            <EstadoVersionBadge estado={version.estado} />
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {criterios} criterios · {secciones} secciones
          </p>
          {version.publicadoEn && (
            <p className="mt-1 text-xs font-bold text-slate-400">
              Publicada: {new Date(version.publicadoEn).toLocaleDateString()}
            </p>
          )}
          {!editable && <p className="mt-2 text-xs font-bold text-slate-500">Esta version es inmutable.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" icon="visibility" onClick={() => onPreview(version)}>
            Vista previa
          </Button>
          {editable ? (
            <Button as={Link} to={`/admin/formularios/${formularioId}/versiones/${version.id}/editar`} icon="edit">
              Continuar editando
            </Button>
          ) : (
            <>
              <Button variant="outline" icon="content_copy" isLoading={creating} onClick={() => onCreateDraft(version.id)}>
                Crear V{version.numeroVersion + 1}
              </Button>
              {version.estado === 'PUBLICADA' && (
                <Button variant="ghost" icon="archive" onClick={() => onArchive(version.id)}>
                  Archivar
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
