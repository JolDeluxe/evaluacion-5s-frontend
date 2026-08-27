import { useEffect, useRef, useState, useCallback } from 'react';
import { useUrlState, parsePageParam } from '@/hooks/use-url-state';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { TableActions } from '@/components/ui/table-actions';
import { Label } from '@/components/form/label';
import { Input } from '@/components/form/input';
import { Select } from '@/components/form/select';
import { areasApi } from '@/features/areas/api/areas-api';
import { usuariosApi } from '@/features/usuarios/api/usuarios-api';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Helpers visuales
// ---------------------------------------------------------------------------

function TipoBadge({ tipo }) {
  const isOp = tipo === 'OPERATIVA';
  return (
    <Badge variant={isOp ? 'info' : 'warning'} className="rounded-md py-0.5 text-[11px] uppercase tracking-wide shadow-none">
      {isOp ? 'Operativa' : 'Administrativa'}
    </Badge>
  );
}

function EstadoBadge({ activo }) {
  return (
    <Badge variant={activo ? 'success' : 'neutral'} className="gap-1 rounded-md py-0.5 text-[11px] shadow-none">
      <span className={cn('h-1.5 w-1.5 rounded-full', activo ? 'bg-emerald-500' : 'bg-slate-400')} />
      {activo ? 'Activa' : 'Inactiva'}
    </Badge>
  );
}

function ResponsablesList({ usuariosArea }) {
  const responsables = usuariosArea ?? [];

  if (responsables.length === 0) {
    return (
      <Badge variant="danger" className="rounded-md py-0.5 text-[11px] shadow-none">
        Sin responsables
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[280px]">
      {responsables.map((ua) => (
          <Badge
            key={ua.usuario.id}
            variant="neutral"
            className="text-[11px] shadow-none"
          >
            {ua.usuario.nombre}
          </Badge>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta mobile
// ---------------------------------------------------------------------------

function AreaCard({ area, onVerDetalle, onEditar, onToggleEstado }) {
  const responsables = area.usuariosArea ?? [];
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:bg-slate-50 transition"
    >
      <div className="flex items-start justify-between gap-2" onClick={() => onVerDetalle(area)}>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900 leading-snug line-clamp-2">{area.nombre}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <EstadoBadge activo={area.activo} />
          <TipoBadge tipo={area.tipo} />
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-1 border-t border-slate-100 pt-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Responsables</span>
        <div className="flex items-center justify-between">
          <div className="min-w-0" onClick={() => onVerDetalle(area)}>
            {responsables.length === 0 ? (
              <span className="text-xs font-bold text-red-500">Sin responsables</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {responsables.map((ua) => (
                  <span key={ua.usuario.id} className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                    {ua.usuario.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => onEditar(area)}
              variant="ghost"
              size="icon"
              icon="edit"
              className="h-8 w-8 text-amber-500 hover:translate-y-0 hover:shadow-none"
              title="Editar área"
              aria-label="Editar área"
            />
            <Button
              type="button"
              onClick={() => onToggleEstado(area)}
              variant="ghost"
              size="icon"
              icon={area.activo ? "block" : "check_circle"}
              className={cn("h-8 w-8 hover:translate-y-0 hover:shadow-none", area.activo ? "text-red-500" : "text-emerald-500")}
              title={area.activo ? "Desactivar área" : "Reactivar área"}
              aria-label={area.activo ? "Desactivar área" : "Reactivar área"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de detalle del area
// ---------------------------------------------------------------------------

function AreaDetalleModal({ area, onClose }) {
  if (!area) return null;
  const responsables = area.usuariosArea ?? [];

  return (
    <Modal isOpen={!!area} onClose={onClose}>
      <ModalHeader title="Detalle de Área" onClose={onClose}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
            {area.tipo === 'OPERATIVA' ? 'Área operativa' : 'Área administrativa'}
          </p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{area.nombre}</h2>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <EstadoBadge activo={area.activo} />
            <TipoBadge tipo={area.tipo} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
              Responsables del área
            </p>
            {responsables.length === 0 ? (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-sm font-bold text-red-600">Sin responsables asignados</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {responsables.map((ua) => (
                  <div key={ua.usuario.id} className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <Icon name="person" size="16px" className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{ua.usuario.nombre}</p>
                      <p className="text-[11px] text-slate-500">@{ua.usuario.nombreUsuario} · {ua.usuario.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="cancelar" size="sm" onClick={onClose}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------------

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ADMINISTRATIVA', label: 'Administrativa' },
  { value: 'OPERATIVA', label: 'Operativa' },
];

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Inactivas' },
];

const RESPONSABLE_OPTS = [
  { value: '', label: 'Con o sin responsable' },
  { value: 'false', label: 'Con responsable' },
  { value: 'true', label: 'Sin responsable' },
];

function FilterChips({ value, options, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          variant="filtro_todos"
          size="sm"
          isActive={value === opt.value}
          className="h-7 rounded-full px-3"
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Columnas desktop
// ---------------------------------------------------------------------------

function buildColumns(onVerDetalle, onEditar, onToggleEstado) {
  return [
    {
      header: 'Área',
      accessorKey: 'nombre',
      cell: (row) => (
        <span className="font-semibold text-slate-900 text-sm">{row.nombre}</span>
      ),
    },
    {
      header: 'Tipo',
      accessorKey: 'tipo',
      headerClassName: 'w-[140px]',
      cell: (row) => <TipoBadge tipo={row.tipo} />,
    },
    {
      header: 'Responsables',
      accessorKey: 'responsables',
      headerClassName: 'w-[300px]',
      cell: (row) => <ResponsablesList usuariosArea={row.usuariosArea} />,
    },
    {
      header: 'Estado',
      accessorKey: 'activo',
      headerClassName: 'w-[100px]',
      cell: (row) => <EstadoBadge activo={row.activo} />,
    },
    {
      header: '',
      accessorKey: '_acciones',
      align: 'center',
      headerClassName: 'w-[120px]',
      cell: (row) => (
        <TableActions
          row={row}
          actions={[
            { key: 'ver_detalle', enabled: true, onClick: () => onVerDetalle(row), tooltip: 'Ver detalle' },
            { key: 'editar', enabled: true, onClick: () => onEditar(row), tooltip: 'Editar' },
            row.activo 
              ? { key: 'toggle_estatus_desactivar', enabled: true, onClick: () => onToggleEstado(row), tooltip: 'Desactivar' }
              : { key: 'toggle_estatus_activar', enabled: true, onClick: () => onToggleEstado(row), tooltip: 'Reactivar' }
          ]}
        />
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

const LIMITE = 25;

const URL_DEFAULTS = {
  q: '',
  tipo: '',
  activo: 'true',
  sinResponsable: '',
  pagina: '1',
};

function generarCodigoInterno(nombre) {
  const base = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toUpperCase()
    .slice(0, 36) || 'AREA';
  return `${base}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export function AreasPage() {
  const { params, setParam, setSearch } = useUrlState(URL_DEFAULTS);
  const pagina = parsePageParam(params.pagina);

  const [state, setState] = useState({
    status: 'loading',
    areas: [],
    total: 0,
    totalPaginas: 1,
    error: null,
  });

  const [areaDetalle, setAreaDetalle] = useState(null);
  const [editingArea, setEditingArea] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [reactivatingArea, setReactivatingArea] = useState(null);
  const [allUsuarios, setAllUsuarios] = useState([]);
  
  const [form, setForm] = useState({
    nombre: '',
    tipo: 'OPERATIVA',
    responsablesIds: [],
    inicioProgramaAuditoria: 'PROXIMO_MES',
    auditorMensualId: '',
  });
  const [reactivationForm, setReactivationForm] = useState({
    inicioProgramaAuditoria: 'PROXIMO_MES',
    auditorMensualId: '',
  });

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cargar = useCallback(async (currentParams) => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const p = parsePageParam(currentParams.pagina);
      const query = { pagina: p, limite: LIMITE };
      if (currentparams.q) query.busqueda = currentparams.q;
      if (currentParams.tipo) query.tipo = currentParams.tipo;
      if (currentParams.activo !== '') query.activo = currentParams.activo;
      if (currentParams.sinResponsable !== '') query.sinResponsable = currentParams.sinResponsable;
      const response = await areasApi.listar(query);
      const datos = response?.datos ?? [];
      const paginacion = response?.paginacion ?? {};
      setState({
        status: 'ready',
        areas: datos,
        total: paginacion.total ?? datos.length,
        totalPaginas: paginacion.totalPaginas ?? 1,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, status: 'error', error: error?.message || 'No se pudieron cargar las áreas.' }));
    }
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      const response = await usuariosApi.listar({ limite: 100, activo: true });
      setAllUsuarios(response?.datos ?? []);
    } catch {
      // Ignorar errores silenciosamente
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(params), 300);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.tipo, params.activo, params.sinResponsable, params.pagina, cargar]);

  const handleFiltro = (key, value) => {
    if (key === 'busqueda') {
      setSearch('q', value);
    } else {
      setParam(key, value);
    }
  };

  const handlePagina = (p) => setParam('pagina', String(p), { resetPage: false });

  const startCreate = () => {
    setForm({
      nombre: '',
      tipo: 'OPERATIVA',
      responsablesIds: [],
      inicioProgramaAuditoria: 'PROXIMO_MES',
      auditorMensualId: '',
    });
    setActionError(null);
    setIsCreating(true);
  };

  const startEdit = (area) => {
    const responsables = (area.usuariosArea ?? []).map((ua) => String(ua.usuario.id));
    setForm({
      nombre: area.nombre,
      tipo: area.tipo,
      responsablesIds: responsables,
      inicioProgramaAuditoria: 'PROXIMO_MES',
      auditorMensualId: '',
    });
    setActionError(null);
    setEditingArea(area);
  };

  const saveArea = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      // Regla de integridad: Si el área se crea o edita como ACTIVA (o ya lo era), debe tener al menos 1 responsable
      const nextActivo = editingArea ? editingArea.activo : true;
      if (nextActivo && form.responsablesIds.length === 0) {
        throw new Error('El área activa debe tener al menos un responsable.');
      }

      const payload = {
        nombre: form.nombre,
        tipo: form.tipo,
      };

      let areaId;
      if (editingArea) {
        areaId = editingArea.id;
        await areasApi.actualizar(areaId, payload);
      } else {
        if (form.inicioProgramaAuditoria === 'ESTE_MES' && !form.auditorMensualId) {
          throw new Error('Para incluir esta área en el mes actual debes seleccionar un auditor.');
        }
        const res = await areasApi.crear({
          ...payload,
          codigo: generarCodigoInterno(form.nombre),
          responsablesIds: form.responsablesIds.map(Number),
          inicioProgramaAuditoria: form.inicioProgramaAuditoria,
          auditorMensualId: form.auditorMensualId ? Number(form.auditorMensualId) : null,
        });
        areaId = res.area.id;
      }

      // Sincronizar responsables en una sola tanda
      if (editingArea) {
        const prevResponsables = (editingArea.usuariosArea ?? []).map((ua) => String(ua.usuario.id));
        const toAdd = form.responsablesIds.filter((id) => !prevResponsables.includes(id));
        const toRemove = prevResponsables.filter((id) => !form.responsablesIds.includes(id));

        for (const usuarioId of toAdd) {
          await areasApi.guardarUsuarioArea(areaId, {
            usuarioId: Number(usuarioId),
          });
        }

        for (const usuarioId of toRemove) {
          await areasApi.eliminarUsuarioArea(areaId, Number(usuarioId));
        }
      }

      setIsCreating(false);
      setEditingArea(null);
      cargar(params);
    } catch (err) {
      setActionError(err.message || 'Error al guardar el área.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (area) => {
    // Si se quiere reactivar un área inactiva, validar que tenga al menos 1 responsable
    if (!area.activo) {
      const responsabilidadesCount = (area.usuariosArea ?? []).length;
      if (responsabilidadesCount === 0) {
        alert('No se puede reactivar esta área porque no tiene ningún responsable asignado. Modifícala primero.');
        return;
      }
      setReactivationForm({ inicioProgramaAuditoria: 'PROXIMO_MES', auditorMensualId: '' });
      setReactivatingArea(area);
      return;
    }

    const confirmMsg = `¿Desactivar ${area.nombre}? Esta área dejará de utilizarse para nuevas auditorías. Su histórico se conservará.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await areasApi.desactivar(area.id);
      cargar(params);
    } catch (err) {
      alert(err.message || 'Error al cambiar estado.');
    }
  };

  const confirmarReactivacion = async (event) => {
    event.preventDefault();
    if (reactivationForm.inicioProgramaAuditoria === 'ESTE_MES' && !reactivationForm.auditorMensualId) {
      setActionError('Para incluir esta área en el mes actual debes seleccionar un auditor.');
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await areasApi.reactivar(reactivatingArea.id, {
        inicioProgramaAuditoria: reactivationForm.inicioProgramaAuditoria,
        auditorMensualId: reactivationForm.auditorMensualId ? Number(reactivationForm.auditorMensualId) : null,
      });
      setReactivatingArea(null);
      cargar(params);
    } catch (err) {
      setActionError(err.message || 'Error al reactivar el área.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckboxResponsable = (usuarioId, checked) => {
    let nuevas = [...form.responsablesIds];
    if (checked) {
      if (!nuevas.includes(usuarioId)) nuevas.push(usuarioId);
    } else {
      nuevas = nuevas.filter((id) => id !== usuarioId);
    }
    setForm({
      ...form,
      responsablesIds: nuevas,
    });
  };

  const columns = buildColumns(
    (area) => setAreaDetalle(area),
    (area) => startEdit(area),
    (area) => toggleEstado(area),
  );

  const labelEstado = params.activo === 'true' ? ' activas' : params.activo === 'false' ? ' inactivas' : '';
  const auditores = allUsuarios.filter((usuario) => usuario.rol === 'AUDITOR' || usuario.rol === 'ADMINISTRADOR');
  const responsablesSet = new Set(form.responsablesIds);
  const auditoresElegiblesFormulario = auditores.filter((usuario) => !responsablesSet.has(String(usuario.id)));

  return (
    <section className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Administración</p>
          <h1 className="text-3xl font-black text-slate-950">Áreas</h1>
          {state.status === 'ready' && (
            <p className="mt-1 text-sm text-slate-500">
              {state.total} {state.total === 1 ? 'área' : 'áreas'}{labelEstado}
            </p>
          )}
        </div>
        <Button variant="outline" icon="add" onClick={startCreate}>
          Nueva área
        </Button>
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <Input
            type="text"
            placeholder="Buscar por nombre o responsable..."
            value={params.q}
            onChange={(e) => handleFiltro('q', e.target.value)}
            className="bg-slate-50 pl-9"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Tipo</span>
            <FilterChips value={params.tipo} options={TIPOS} onChange={(v) => handleFiltro('tipo', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Estado</span>
            <FilterChips value={params.activo} options={ESTADOS} onChange={(v) => handleFiltro('activo', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Responsable</span>
            <FilterChips value={params.sinResponsable} options={RESPONSABLE_OPTS} onChange={(v) => handleFiltro('sinResponsable', v)} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {state.status === 'loading' && <Spinner />}

      {/* Error */}
      {state.status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-bold text-red-700">{state.error}</p>
          <Button type="button" variant="ghost" size="sm" onClick={() => cargar(params)} className="mt-1 px-0 text-red-600 hover:bg-transparent hover:translate-y-0 hover:shadow-none">
            Reintentar
          </Button>
        </div>
      )}

      {/* Desktop: Tabla */}
      {state.status === 'ready' && !isMobile && (
        <Table
          columns={columns}
          data={state.areas}
          keyField="id"
          loading={false}
          emptyMessage="No hay áreas con los filtros aplicados."
          page={pagina}
          totalPages={state.totalPaginas}
          totalItems={state.total}
          onPageChange={handlePagina}
        />
      )}

      {/* Mobile: Cards */}
      {state.status === 'ready' && isMobile && (
        <>
          {state.areas.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl bg-white border border-slate-200 text-sm text-slate-400 italic">
              No hay áreas con los filtros aplicados.
            </div>
          ) : (
            <div className="space-y-2">
              {state.areas.map((area) => (
                <AreaCard
                  key={area.id}
                  area={area}
                  onVerDetalle={(a) => setAreaDetalle(a)}
                  onEditar={(a) => startEdit(a)}
                  onToggleEstado={(a) => toggleEstado(a)}
                />
              ))}
            </div>
          )}
          {state.totalPaginas > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                disabled={pagina <= 1}
                onClick={() => handlePagina(pagina - 1)}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <span className="text-xs text-slate-500">{pagina} / {state.totalPaginas}</span>
              <Button
                type="button"
                disabled={pagina >= state.totalPaginas}
                onClick={() => handlePagina(pagina + 1)}
                variant="outline"
                size="sm"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      {areaDetalle && (
        <AreaDetalleModal area={areaDetalle} onClose={() => setAreaDetalle(null)} />
      )}

      {/* Modal de Crear / Editar */}
      <Modal isOpen={isCreating || !!editingArea} onClose={() => { setIsCreating(false); setEditingArea(null); }}>
        <ModalHeader 
          title={editingArea ? 'Editar Área' : 'Nueva Área'} 
          onClose={() => { setIsCreating(false); setEditingArea(null); }} 
        />
        <form onSubmit={saveArea}>
          <ModalBody>
            <div className="space-y-4">
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
                  placeholder="Ej: Área de Corte"
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  <option value="OPERATIVA">OPERATIVA</option>
                  <option value="ADMINISTRATIVA">ADMINISTRATIVA</option>
                </Select>
              </div>

              {!editingArea && (
                <>
                  <div>
                    <Label>Comienza a auditarse</Label>
                    <Select
                      value={form.inicioProgramaAuditoria}
                      onChange={(e) => setForm({ ...form, inicioProgramaAuditoria: e.target.value, auditorMensualId: '' })}
                    >
                      <option value="PROXIMO_MES">Próximo mes</option>
                      <option value="ESTE_MES">Este mes</option>
                    </Select>
                  </div>

                  {form.inicioProgramaAuditoria === 'ESTE_MES' && (
                    <div>
                      <Label>Auditor asignado para este mes</Label>
                      <Select
                        value={form.auditorMensualId}
                        required
                        onChange={(e) => setForm({ ...form, auditorMensualId: e.target.value })}
                      >
                        <option value="">Selecciona auditor</option>
                        {auditoresElegiblesFormulario.map((usuario) => (
                          <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
                        ))}
                      </Select>
                    </div>
                  )}
                </>
              )}

              {/* Selección de Múltiples Responsables */}
              <div>
                <Label>Responsables</Label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1">
                  {allUsuarios.map((u) => {
                    const isChecked = form.responsablesIds.includes(String(u.id));
                    return (
                      <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxResponsable(String(u.id), e.target.checked)}
                          className="rounded text-marca-primario focus:ring-marca-primario/30"
                        />
                        <span className="text-xs font-medium text-slate-700">
                          {u.nombre} (@{u.nombreUsuario} · {u.rol})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="cancelar"
              size="sm"
              onClick={() => { setIsCreating(false); setEditingArea(null); }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="guardar"
              size="sm"
              isLoading={saving}
            >
              Guardar
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <Modal isOpen={!!reactivatingArea} onClose={() => { setReactivatingArea(null); setActionError(null); }}>
        <ModalHeader title="Reactivar área" onClose={() => { setReactivatingArea(null); setActionError(null); }} />
        <form onSubmit={confirmarReactivacion}>
          <ModalBody>
            <div className="space-y-4">
              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                  {actionError}
                </div>
              )}
              <p className="text-sm font-bold text-slate-700">{reactivatingArea?.nombre}</p>
              <div>
                <Label>Comienza a auditarse</Label>
                <Select
                  value={reactivationForm.inicioProgramaAuditoria}
                  onChange={(e) => setReactivationForm({ inicioProgramaAuditoria: e.target.value, auditorMensualId: '' })}
                >
                  <option value="PROXIMO_MES">Próximo mes</option>
                  <option value="ESTE_MES">Este mes</option>
                </Select>
              </div>
              {reactivationForm.inicioProgramaAuditoria === 'ESTE_MES' && (
                <div>
                  <Label>Auditor asignado para este mes</Label>
                  <Select
                    value={reactivationForm.auditorMensualId}
                    required
                    onChange={(e) => setReactivationForm((actual) => ({ ...actual, auditorMensualId: e.target.value }))}
                  >
                    <option value="">Selecciona auditor</option>
                    {auditores
                      .filter((usuario) => !(reactivatingArea?.usuariosArea ?? []).some((ua) => ua.usuario.id === usuario.id))
                      .map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>)}
                  </Select>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="cancelar" size="sm" onClick={() => { setReactivatingArea(null); setActionError(null); }}>
              Cancelar
            </Button>
            <Button type="submit" variant="guardar" size="sm" isLoading={saving}>
              Reactivar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </section>
  );
}
