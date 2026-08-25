import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formulariosApi } from '@/features/formularios/api/formularios-api';
import { AddBlockMenu } from '@/features/formularios/components/add-block-menu';
import { BloqueEditor } from '@/features/formularios/components/bloque-editor';
import { EstadoVersionBadge } from '@/features/formularios/components/estado-version-badge';
import { FormularioPreviewModal } from '@/features/formularios/components/formulario-preview-modal';
import {
  crearBloque,
  crearReglasDefaultCriterio,
  construirVersionPreview,
  moverBloque,
  normalizarOrden,
  prepararPayload,
  reglasAEstadoEditor,
  validarEditor,
} from '@/features/formularios/helpers/formulario-editor-helpers';

export function EditorFormulario({ formularioId, versionId }) {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', version: null, error: null });
  const [bloques, setBloques] = useState([]);
  const [reglas, setReglas] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveState, setSaveState] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const readOnly = state.version?.estado !== 'BORRADOR';
  const previewVersion = useMemo(() => ({
    ...construirVersionPreview(state.version ?? {}, bloques, reglas),
  }), [bloques, reglas, state.version]);

  const cargar = useCallback(async () => {
    setState({ status: 'loading', version: null, error: null });
    try {
      const { version } = await formulariosApi.obtenerVersion(versionId);
      setState({ status: 'ready', version, error: null });
      setBloques(normalizarOrden(version.bloques ?? []));
      setReglas(reglasAEstadoEditor(version));
      setDirty(false);
    } catch (error) {
      setState({ status: 'error', version: null, error: error?.message || 'No se pudo cargar la version.' });
    }
  }, [versionId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const actualizarBloque = (index, cambios) => {
    setBloques((actuales) => actuales.map((bloque, i) => (i === index ? { ...bloque, ...cambios } : bloque)));
    setDirty(true);
    setSaveState('Cambios sin guardar');
  };

  const agregarBloque = (tipo) => {
    const nuevo = { ...crearBloque(tipo), orden: bloques.length };
    setBloques((actuales) => [...actuales, nuevo]);
    if (tipo === 'CRITERIO_5S') setReglas((actuales) => [...actuales, ...crearReglasDefaultCriterio(nuevo)]);
    setDirty(true);
    setSaveState('Cambios sin guardar');
  };

  const quitarBloque = (index) => {
    const bloque = bloques[index];
    if (bloque.tipo === 'CRITERIO_5S' && !window.confirm('Eliminar este criterio quitara sus opciones y reglas del borrador.')) return;
    setBloques((actuales) => normalizarOrden(actuales.filter((_, i) => i !== index)));
    setReglas((actuales) => actuales.filter((regla) => regla.bloqueOrigenClaveEstable !== bloque.claveEstable && regla.bloqueDestinoClaveEstable !== bloque.claveEstable));
    setDirty(true);
    setSaveState('Cambios sin guardar');
  };

  const mover = (from, to) => {
    setBloques((actuales) => moverBloque(actuales, from, to));
    setDirty(true);
    setSaveState('Cambios sin guardar');
  };

  const guardar = async () => {
    const errores = validarEditor(bloques, reglas);
    if (errores.length) {
      setSaveState(errores.slice(0, 3).join(' '));
      return false;
    }

    setSaving(true);
    setSaveState('Guardando...');
    try {
      const { version } = await formulariosApi.guardarEstructura(versionId, prepararPayload(bloques, reglas));
      setState({ status: 'ready', version, error: null });
      setBloques(normalizarOrden(version.bloques ?? []));
      setReglas(reglasAEstadoEditor(version));
      setDirty(false);
      setSaveState('Guardado');
      return true;
    } catch (error) {
      setSaveState(error?.message || 'Error al guardar');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publicar = async () => {
    const ok = dirty ? await guardar() : true;
    if (!ok) return;
    const criterios = bloques.filter((bloque) => bloque.tipo === 'CRITERIO_5S').length;
    const opciones = bloques.reduce((total, bloque) => total + (bloque.opciones?.length ?? 0), 0);
    const secciones = bloques.filter((bloque) => bloque.tipo === 'TITULO').length;
    if (!window.confirm(`Al publicar esta version ya no podra modificarse.\n\n${criterios} criterios\n${opciones} opciones\n${reglas.length} reglas\n${secciones} secciones`)) return;

    setPublishing(true);
    try {
      const { version } = await formulariosApi.publicarVersion(versionId);
      setState((actual) => ({ ...actual, version: { ...actual.version, ...version } }));
      setDirty(false);
      setSaveState('Version publicada');
    } catch (error) {
      setSaveState(error?.message || 'No se pudo publicar');
    } finally {
      setPublishing(false);
    }
  };

  if (state.status === 'loading') return <Spinner />;
  if (state.status === 'error') return <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>;

  return (
    <section className="space-y-5">
      <div className="sticky top-0 z-20 -mx-4 border-b border-white/70 bg-app-surface/80 px-4 py-4 backdrop-blur-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button type="button" className="text-sm font-bold text-slate-500" onClick={() => navigate(`/admin/formularios/${formularioId}`)}>
              ← Formularios
            </button>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-black text-slate-950">{state.version.formulario?.nombre}</h1>
              <span className="text-lg font-black text-slate-500">V{state.version.numeroVersion}</span>
              <EstadoVersionBadge estado={state.version.estado} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" icon="visibility" onClick={() => setPreviewOpen(true)}>Vista previa</Button>
            {!readOnly && <Button variant="outline" icon="save" isLoading={saving} onClick={guardar}>Guardar</Button>}
            {!readOnly && <Button icon="publish" isLoading={publishing} onClick={publicar}>Publicar</Button>}
          </div>
        </div>
        <p className="mt-2 text-xs font-bold text-slate-500">{readOnly ? 'Esta version es inmutable.' : saveState || 'Sin cambios pendientes'}</p>
      </div>

      <div className="mx-auto max-w-5xl space-y-4">
        {bloques.map((bloque, index) => (
          <BloqueEditor
            key={bloque.claveEstable}
            versionId={versionId}
            bloque={bloque}
            index={index}
            total={bloques.length}
            reglas={reglas}
            readOnly={readOnly}
            onChange={(cambios) => actualizarBloque(index, cambios)}
            onChangeReglas={(nuevasReglas) => {
              setReglas(nuevasReglas);
              setDirty(true);
              setSaveState('Cambios sin guardar');
            }}
            onMoveUp={() => mover(index, index - 1)}
            onMoveDown={() => mover(index, index + 1)}
            onDelete={() => quitarBloque(index)}
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) mover(dragIndex, index);
              setDragIndex(null);
            }}
          />
        ))}
        <AddBlockMenu disabled={readOnly} onAdd={agregarBloque} />
      </div>

      {previewOpen && <FormularioPreviewModal version={previewVersion} onClose={() => setPreviewOpen(false)} />}
    </section>
  );
}
