import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Select } from '@/components/form/select';
import { formulariosApi } from '@/features/formularios/api/formularios-api';
import { FormularioCard } from '@/features/formularios/components/formulario-card';

export function FormulariosPage() {
  const [state, setState] = useState({ status: 'loading', formularios: [], error: null });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nombre: '', slug: '', descripcion: '', alcance: 'AMBOS' });

  const cargar = async () => {
    setState((actual) => ({ ...actual, status: 'loading', error: null }));
    try {
      const response = await formulariosApi.listar({ limite: 50 });
      setState({ status: 'ready', formularios: response?.datos ?? [], error: null });
    } catch (error) {
      setState({ status: 'error', formularios: [], error: error?.message || 'No se pudieron cargar formularios.' });
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const crearFormulario = async (event) => {
    event.preventDefault();
    await formulariosApi.crear(form);
    setCreating(false);
    setForm({ nombre: '', slug: '', descripcion: '', alcance: 'AMBOS' });
    cargar();
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Gestion 5S</p>
          <h1 className="text-3xl font-black text-slate-950">Formularios</h1>
        </div>
        <Button variant="outline" icon="add" onClick={() => setCreating(true)}>Nuevo formulario</Button>
      </div>

      {state.status === 'loading' && <Spinner />}
      {state.status === 'error' && <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>}
      {state.status === 'ready' && state.formularios.length === 0 && (
        <Card className="border-dashed border-slate-300 bg-white/70">
          <CardBody className="py-12 text-center">
            <p className="text-lg font-black text-slate-950">No hay formularios configurados.</p>
          </CardBody>
        </Card>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {state.formularios.map((formulario) => <FormularioCard key={formulario.id} formulario={formulario} />)}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-white/70 bg-white/90 shadow-2xl">
            <CardBody className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">Nuevo</p>
                  <h2 className="text-2xl font-black text-slate-950">Formulario</h2>
                </div>
                <button type="button" className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" onClick={() => setCreating(false)}>Cerrar</button>
              </div>
              <form className="space-y-3" onSubmit={crearFormulario}>
                <div>
                  <Label>Nombre</Label>
                  <Input value={form.nombre} required onChange={(event) => setForm((actual) => ({ ...actual, nombre: event.target.value }))} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} required placeholder="evaluacion-5s-especial" onChange={(event) => setForm((actual) => ({ ...actual, slug: event.target.value }))} />
                </div>
                <div>
                  <Label>Alcance</Label>
                  <Select value={form.alcance} onChange={(event) => setForm((actual) => ({ ...actual, alcance: event.target.value }))}>
                    <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                    <option value="OPERATIVO">OPERATIVO</option>
                    <option value="AMBOS">AMBOS</option>
                  </Select>
                </div>
                <div>
                  <Label>Descripcion</Label>
                  <Input multiline value={form.descripcion} onChange={(event) => setForm((actual) => ({ ...actual, descripcion: event.target.value }))} />
                </div>
                <Button type="submit" className="w-full" icon="save">Crear</Button>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </section>
  );
}
