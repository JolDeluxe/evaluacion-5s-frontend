import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { formulariosApi } from '@/features/administracion/formularios/api/formularios-api';
import { FormularioPreviewModal } from '@/features/administracion/formularios/components/formulario-preview-modal';
import { obtenerResumenEstructura } from '@/features/administracion/formularios/helpers/estructura-formulario-helpers';

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
  const location = useLocation();
  const [state, setState] = useState({ status: 'loading', formulario: null, error: null });
  const [showPreview, setShowPreview] = useState(false);
  const feedbackMsg = location.state?.feedback;

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

  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>;

  const formulario = state.formulario;
  const resumen = obtenerResumenEstructura(formulario.actual);

  return (
    <section className="space-y-6">
      {feedbackMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm font-bold text-emerald-900 shadow-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-xs font-black">✓</span>
          {feedbackMsg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button type="button" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition" onClick={() => navigate('/admin/formularios')}>
            ← Volver a Formularios
          </button>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">{formulario.alcance}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-black uppercase ${formulario.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              {formulario.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black text-slate-950">{formulario.nombre}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon="visibility" onClick={() => setShowPreview(true)}>
            Vista previa
          </Button>
          <Button as={Link} to={`/admin/formularios/${formulario.id}/editar`} icon="edit_square">
            Editar formulario
          </Button>
        </div>
      </div>

      <Card className="border-white/70 bg-white/75 shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
        <CardBody className="space-y-6 p-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Estado</p>
              <p className="mt-1 text-lg font-black text-slate-950">{formulario.activo ? 'Activo' : 'Inactivo'}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Alcance / Tipo</p>
              <p className="mt-1 text-lg font-black text-slate-950">{formulario.alcance}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Estructura</p>
              <p className="mt-1 text-lg font-black text-slate-950">{resumen.totalPreguntas} preguntas · {resumen.totalSecciones} secciones</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Última actualización</p>
              <p className="mt-1 text-lg font-black text-slate-950">{formatearFecha(formulario.actual?.actualizadoEn || formulario.actualizadoEn)}</p>
            </div>
          </div>

          {formulario.descripcion && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Descripción</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">{formulario.descripcion}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {showPreview && (
        <FormularioPreviewModal
          formulario={formulario}
          revision={formulario.actual}
          onClose={() => setShowPreview(false)}
        />
      )}
    </section>
  );
}
