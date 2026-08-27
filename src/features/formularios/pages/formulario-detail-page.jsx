import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formulariosApi } from '@/features/formularios/api/formularios-api';
import { FormularioPreviewModal } from '@/features/formularios/components/formulario-preview-modal';
import { obtenerResumenEstructura } from '@/features/formularios/helpers/estructura-formulario-helpers';

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function FormularioDetailPage() {
  const { formularioId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', formulario: null, error: null });
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const cargar = useCallback(async () => {
    setState({ status: 'loading', formulario: null, error: null });
    try {
      const { formulario } = await formulariosApi.obtener(formularioId);
      setState({ status: 'ready', formulario, error: null });
    } catch (error) {
      setState({ status: 'error', formulario: null, error: error?.message || 'No se pudo cargar el formulario.' });
    }
  }, [formularioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const abrirRevision = async (revisionId) => {
    setPreviewLoading(true);
    try {
      const { revision } = await formulariosApi.obtenerRevision(revisionId);
      setPreview(revision);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>;

  const formulario = state.formulario;
  const resumen = obtenerResumenEstructura(formulario.actual);

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" className="text-sm font-bold text-slate-500" onClick={() => navigate('/admin/formularios')}>
            ← Formularios
          </button>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-marca-acento">{formulario.alcance}</p>
          <h1 className="text-3xl font-black text-slate-950">{formulario.nombre}</h1>
        </div>
      </div>

      <Card className="border-white/70 bg-white/75 shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
        <CardBody className="space-y-4 p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Estado</p>
              <p className="text-lg font-black text-slate-950">{formulario.activo ? 'Activo' : 'Inactivo'}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Tipo</p>
              <p className="text-lg font-black text-slate-950">{formulario.alcance}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Preguntas</p>
              <p className="text-lg font-black text-slate-950">{resumen.totalPreguntas}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-slate-400">Secciones</p>
              <p className="text-lg font-black text-slate-950">{resumen.totalSecciones}</p>
            </div>
            <div className="md:col-span-4">
              <p className="text-xs font-black uppercase text-slate-400">Descripción</p>
              <p className="text-sm font-semibold leading-6 text-slate-600">{formulario.descripcion || 'Sin descripción'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="border-white/70 bg-white/75 shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
        <CardBody className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-marca-acento">Formulario actual</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {resumen.totalPreguntas} preguntas · {resumen.totalSecciones} secciones
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              Esta es la estructura vigente para nuevas auditorías.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" icon="visibility" onClick={() => setPreview(formulario.actual)}>
              Vista previa
            </Button>
            <Button as={Link} to={`/admin/formularios/${formulario.id}/editar`} icon="edit_square">
              Editar formulario
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border-white/70 bg-white/75 shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
        <CardBody className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-marca-acento">Historial de cambios</p>
              <h2 className="text-xl font-black text-slate-950">Revisiones internas</h2>
            </div>
            {previewLoading && <Spinner size="sm" />}
          </div>

          <div className="space-y-3">
            {formulario.historial.map((revision) => (
              <div key={revision.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {revision.actual ? 'Actual' : 'Histórica'}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {formatearFecha(revision.actualizadoEn)} · {revision.totalPreguntas} preguntas · {revision.totalSecciones} secciones
                  </p>
                </div>
                <Button variant="outline" icon="visibility" isLoading={previewLoading} onClick={() => abrirRevision(revision.id)}>
                  Ver
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {preview && (
        <FormularioPreviewModal
          formulario={formulario}
          revision={preview}
          title={preview.actual ? 'Vista previa' : 'Revisión histórica'}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  );
}
