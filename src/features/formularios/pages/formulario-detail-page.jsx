import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Select } from '@/components/form/select';
import { formulariosApi } from '@/features/formularios/api/formularios-api';
import { FormularioPreviewModal } from '@/features/formularios/components/formulario-preview-modal';
import { VersionCard } from '@/features/formularios/components/version-card';

export function FormularioDetailPage() {
  const { formularioId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', formulario: null, error: null });
  const [preview, setPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);
  const [meta, setMeta] = useState({ nombre: '', descripcion: '', alcance: 'AMBOS', activo: true });

  const cargar = useCallback(async () => {
    setState({ status: 'loading', formulario: null, error: null });
    try {
      const { formulario } = await formulariosApi.obtener(formularioId);
      setState({ status: 'ready', formulario, error: null });
      setMeta({
        nombre: formulario.nombre,
        descripcion: formulario.descripcion ?? '',
        alcance: formulario.alcance,
        activo: formulario.activo,
      });
    } catch (error) {
      setState({ status: 'error', formulario: null, error: error?.message || 'No se pudo cargar el formulario.' });
    }
  }, [formularioId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crearBorrador = async (desdeVersionId) => {
    setCreating(true);
    try {
      const { version } = await formulariosApi.crearVersion(formularioId, { desdeVersionId });
      navigate(`/admin/formularios/${formularioId}/versiones/${version.id}/editar`);
    } finally {
      setCreating(false);
    }
  };

  const guardarMetadata = async (event) => {
    event.preventDefault();
    setSavingMeta(true);
    try {
      await formulariosApi.actualizar(formularioId, meta);
      setEditing(false);
      cargar();
    } finally {
      setSavingMeta(false);
    }
  };

  const archivar = async (versionId) => {
    if (!window.confirm('Archivar no elimina la version ni rompe ciclos historicos.')) return;
    await formulariosApi.archivarVersion(versionId);
    cargar();
  };

  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>;

  const formulario = state.formulario;

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
          {!editing ? (
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Estado</p>
                <p className="text-lg font-black text-slate-950">{formulario.activo ? 'Activo' : 'Inactivo'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Alcance</p>
                <p className="text-lg font-black text-slate-950">{formulario.alcance}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-black uppercase text-slate-400">Descripcion</p>
                <p className="text-sm font-semibold leading-6 text-slate-600">{formulario.descripcion || 'Sin descripcion'}</p>
              </div>
              <Button variant="ghost" icon="edit" onClick={() => setEditing(true)}>Editar metadata</Button>
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={guardarMetadata}>
              <div>
                <Label>Nombre</Label>
                <Input value={meta.nombre} onChange={(event) => setMeta((actual) => ({ ...actual, nombre: event.target.value }))} />
              </div>
              <div>
                <Label>Alcance</Label>
                <Select value={meta.alcance} onChange={(event) => setMeta((actual) => ({ ...actual, alcance: event.target.value }))}>
                  <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                  <option value="OPERATIVO">OPERATIVO</option>
                  <option value="AMBOS">AMBOS</option>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Descripcion</Label>
                <Input multiline value={meta.descripcion} onChange={(event) => setMeta((actual) => ({ ...actual, descripcion: event.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={meta.activo} onChange={(event) => setMeta((actual) => ({ ...actual, activo: event.target.checked }))} />
                Formulario activo
              </label>
              <div className="flex gap-2">
                <Button type="submit" icon="save" isLoading={savingMeta}>Guardar</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </CardBody>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-black text-slate-950">Versiones</h2>
        {formulario.versiones.map((version) => (
          <VersionCard
            key={version.id}
            formularioId={formulario.id}
            version={version}
            creating={creating}
            onPreview={setPreview}
            onCreateDraft={crearBorrador}
            onArchive={archivar}
          />
        ))}
      </div>

      {preview && <FormularioPreviewModal version={preview} onClose={() => setPreview(null)} />}
    </section>
  );
}
