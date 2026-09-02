// src/features/administracion/formularios/pages/formularios-page.jsx
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Select } from '@/components/form/select';
import { formulariosApi } from '@/features/administracion/formularios/api/formularios-api';
import { FormularioCard } from '@/features/administracion/formularios/components/formulario-card';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';
import { useUrlState } from '@/hooks/use-url-state';

import { AdministracionNav } from '@/features/administracion/components/administracion-nav';
import { obtenerCatalogoCompleto } from '@/utils/catalogo-completo';

const ALCANCE_OPTS = [
  { value: '', label: 'Todos los alcances' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'OPERATIVO', label: 'Operativo' },
  { value: 'AMBOS', label: 'Ambos' },
];

const ESTADOS = [
  { value: '', label: 'Todos los estados' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
];

const URL_DEFAULTS = { q: '', alcance: '', estado: 'activo' };

function FilterChips({ value, options, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-bold transition-colors',
            value === opt.value
              ? 'bg-navigation-active text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function FormulariosPage() {
  const [state, setState] = useState({ status: 'loading', formularios: [], error: null });
  const [creating, setCreating] = useState(false);

  const { params, setParam, setSearch } = useUrlState(URL_DEFAULTS);

  const [form, setForm] = useState({ nombre: '', descripcion: '', alcance: 'AMBOS' });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const cargar = useCallback(async (filtrosActuales) => {
    try {
      const query = {};
      if (filtrosActuales.q) query.busqueda = filtrosActuales.q;
      if (filtrosActuales.alcance) query.alcance = filtrosActuales.alcance;
      if (filtrosActuales.estado === 'activo') query.activo = true;
      else if (filtrosActuales.estado === 'inactivo') query.activo = false;

      const { datos } = await obtenerCatalogoCompleto(formulariosApi.listar, query, 100);

      setState({ status: 'ready', formularios: datos, error: null });
    } catch (error) {
      setState({ status: 'error', formularios: [], error: error?.message || 'No se pudieron cargar formularios.' });
    }
  }, []);

  useEffect(() => {
    cargar({ q: params.q, alcance: params.alcance, estado: params.estado });
  }, [params.q, params.alcance, params.estado, cargar]);

  const handleFiltro = (key, value) => {
    if (key === 'q') {
      setSearch('q', value);
    } else {
      setParam(key, value);
    }
  };

  const crearFormulario = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      await formulariosApi.crear(form);
      setCreating(false);
      setForm({ nombre: '', descripcion: '', alcance: 'AMBOS' });
      cargar(params);
    } catch (err) {
      setActionError(err?.message || 'No se pudo crear el formulario.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4 pb-16">
      {/* Encabezado */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento leading-none">
          ADMINISTRACIÓN
        </p>
        <h1 className="fuente-titulos text-2xl sm:text-3xl font-normal uppercase leading-tight text-marca-primario mt-0.5">
          Formularios
        </h1>
      </div>

      {/* Navegación compartida (Mobile local) */}
      <div className="md:hidden">
        <AdministracionNav />
      </div>

      {/* Botón Acción */}
      <div className="flex justify-end">
        <Button variant="outline" icon="add" onClick={() => { setActionError(null); setCreating(true); }}>
          Nuevo formulario
        </Button>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre…"
            value={params.q}
            onChange={(e) => handleFiltro('q', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-marca-primario focus:outline-none focus:ring-1 focus:ring-marca-primario/30"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Alcance</span>
            <FilterChips value={params.alcance} options={ALCANCE_OPTS} onChange={(v) => handleFiltro('alcance', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Estado</span>
            <FilterChips value={params.estado} options={ESTADOS} onChange={(v) => handleFiltro('estado', v)} />
          </div>
        </div>
      </div>

      {state.status === 'loading' && <Spinner />}
      {state.status === 'error' && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{state.error}</p>
      )}

      {state.status === 'ready' && state.formularios.length === 0 && (
        <Card className="border-dashed border-slate-300 bg-white/70">
          <CardBody className="py-12 text-center">
            <p className="text-lg font-black text-slate-950">No hay formularios configurados.</p>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {state.status === 'ready' &&
          state.formularios.map((formulario) => (
            <FormularioCard key={formulario.id} formulario={formulario} />
          ))}
      </div>

      {/* Modal de Crear Formulario */}
      <Modal isOpen={creating} onClose={() => setCreating(false)}>
        <ModalHeader title="Nuevo Formulario" onClose={() => setCreating(false)} />
        <form onSubmit={crearFormulario}>
          <ModalBody>
            <div className="space-y-4 font-sans text-sm">
              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                  {actionError}
                </div>
              )}

              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.nombre}
                  required
                  placeholder="Ej: Evaluación Administrativa General"
                  onChange={(event) => setForm((actual) => ({ ...actual, nombre: event.target.value }))}
                />
              </div>

              <div>
                <Label>Alcance</Label>
                <Select
                  value={form.alcance}
                  onChange={(event) => setForm((actual) => ({ ...actual, alcance: event.target.value }))}
                >
                  <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                  <option value="OPERATIVO">OPERATIVO</option>
                  <option value="AMBOS">AMBOS</option>
                </Select>
              </div>

              <div>
                <Label>Descripción</Label>
                <Input
                  multiline
                  value={form.descripcion}
                  placeholder="Describa el propósito de este formulario..."
                  onChange={(event) => setForm((actual) => ({ ...actual, descripcion: event.target.value }))}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="cancelar" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="guardar" isLoading={saving}>
              Crear Formulario
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </section>
  );
}
