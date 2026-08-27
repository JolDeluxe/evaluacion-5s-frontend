import { useEffect, useRef, useState, useCallback } from 'react';
import { useUrlState, parsePageParam } from '@/hooks/use-url-state';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { TableActions } from '@/components/ui/table-actions';
import { Label } from '@/components/form/label';
import { Input } from '@/components/form/input';
import { Select } from '@/components/form/select';
import { usuariosApi } from '@/features/usuarios/api/usuarios-api';
import { areasApi } from '@/features/areas/api/areas-api';
import { AreaMultiSelect } from '@/features/usuarios/components/area-multi-select';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Helpers visuales
// ---------------------------------------------------------------------------

function RolBadge({ rol }) {
  const isSuper = rol === 'SUPER_ADMIN';
  const isAdmin = rol === 'ADMINISTRADOR';
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wide',
      isSuper ? 'bg-red-50 text-red-700 border border-red-150' :
      isAdmin ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-indigo-700',
    )}>
      {isSuper ? 'Super Admin' : isAdmin ? 'Administrador' : 'Auditor'}
    </span>
  );
}

function EstadoBadge({ activo }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold',
      activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
    )}>
      <span className={cn('h-1.5 w-1.5 rounded-full', activo ? 'bg-emerald-500' : 'bg-slate-400')} />
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function ResponsableAreasCell({ areasUsuario = [] }) {
  if (areasUsuario.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[280px]">
      {areasUsuario.map((ua) => (
        <span
          key={ua.area.id}
          className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full"
        >
          {ua.area.nombre}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta mobile
// ---------------------------------------------------------------------------

function UsuarioCard({ usuario, onVerDetalle, onEditar, onToggleEstado }) {
  const responsables = usuario.areasUsuario ?? [];
  const isSuper = usuario.rol === 'SUPER_ADMIN';

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:bg-slate-50 transition"
    >
      <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => onVerDetalle(usuario)}>
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-900 leading-snug truncate">{usuario.nombre}</p>
          <p className="text-xs font-medium text-slate-400">@{usuario.nombreUsuario}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <EstadoBadge activo={usuario.activo} />
          <RolBadge rol={usuario.rol} />
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-1 border-t border-slate-100 pt-2 text-xs" onClick={() => onVerDetalle(usuario)}>
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Áreas bajo su responsabilidad</span>
        {responsables.length === 0 ? (
          <span className="font-semibold text-slate-400 block">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {responsables.map((ua) => (
              <span
                key={ua.area.id}
                className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-[9px] font-bold px-1.5 py-0.2 rounded"
              >
                {ua.area.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
      {!isSuper && (
        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-2">
          <button
            onClick={() => onEditar(usuario)}
            className="p-1 text-amber-500 hover:bg-slate-100 rounded-lg"
            title="Editar usuario"
          >
            <Icon name="edit" size="18px" />
          </button>
          <button
            onClick={() => onToggleEstado(usuario)}
            className={cn("p-1 rounded-lg hover:bg-slate-100", usuario.activo ? "text-red-500" : "text-emerald-500")}
            title={usuario.activo ? "Desactivar" : "Reactivar"}
          >
            <Icon name={usuario.activo ? "person_remove" : "person_add"} size="18px" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de detalle del usuario
// ---------------------------------------------------------------------------

function UsuarioDetalleModal({ usuario, onClose }) {
  if (!usuario) return null;
  const areas = usuario.areasUsuario ?? [];

  return (
    <Modal isOpen={!!usuario} onClose={onClose}>
      <ModalHeader title="Detalle de Usuario" onClose={onClose}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
            Detalle de usuario
          </p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{usuario.nombre}</h2>
          <p className="mt-1 font-mono text-xs text-slate-400">@{usuario.nombreUsuario}</p>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4 font-sans">
          <div className="flex items-center gap-3">
            <EstadoBadge activo={usuario.activo} />
            <RolBadge rol={usuario.rol} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3 text-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo</p>
              <p className="font-semibold text-slate-700 truncate">{usuario.correo ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contraseña Temporal</p>
              <p className="font-semibold text-slate-700">
                {usuario.debeCambiarContrasena ? 'Cambio requerido' : 'Normal'}
              </p>
            </div>
          </div>

          {/* Áreas vinculadas */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
              Áreas bajo su responsabilidad ({areas.length})
            </p>
            {areas.length === 0 ? (
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3 text-center">
                <p className="text-sm italic text-slate-400">Sin áreas asociadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {areas.map((ua) => (
                  <div key={ua.area.id} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{ua.area.nombre}</p>
                      <p className="text-[11px] text-slate-400">{ua.area.tipo}</p>
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

const ROLES_OPTIONS = [
  { value: '', label: 'Todos los roles' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'AUDITOR', label: 'Auditor' },
];

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
];

const RESPONSABILIDAD_OPTS = [
  { value: '', label: 'Cualquier responsabilidad' },
  { value: 'con', label: 'Con áreas a cargo' },
  { value: 'sin', label: 'Sin áreas a cargo' },
];

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

// ---------------------------------------------------------------------------
// Columnas desktop
// ---------------------------------------------------------------------------

function buildColumns(onVerDetalle, onEditar, onToggleEstado) {
  return [
    {
      header: 'Usuario',
      accessorKey: 'nombre',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca-primario/10 font-bold text-marca-primario text-sm uppercase">
            {row.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 text-sm block leading-tight">{row.nombre}</span>
            {row.correo && <span className="text-xs text-slate-400 block mt-0.5">{row.correo}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Username',
      accessorKey: 'nombreUsuario',
      headerClassName: 'w-[140px]',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">
          @{row.nombreUsuario}
        </span>
      ),
    },
    {
      header: 'Rol',
      accessorKey: 'rol',
      headerClassName: 'w-[140px]',
      cell: (row) => <RolBadge rol={row.rol} />,
    },
    {
      header: 'Áreas bajo su responsabilidad',
      accessorKey: 'responsable',
      cell: (row) => <ResponsableAreasCell areasUsuario={row.areasUsuario} />,
    },
    {
      header: 'Estado',
      accessorKey: 'activo',
      headerClassName: 'w-[110px]',
      cell: (row) => <EstadoBadge activo={row.activo} />,
    },
    {
      header: '',
      accessorKey: '_acciones',
      align: 'center',
      headerClassName: 'w-[120px]',
      cell: (row) => {
        const isSuper = row.rol === 'SUPER_ADMIN';
        return (
          <TableActions
            row={row}
            actions={[
              { key: 'ver_detalle', enabled: true, onClick: () => onVerDetalle(row), tooltip: 'Ver detalle' },
              { key: 'editar', enabled: !isSuper, onClick: () => onEditar(row), tooltip: 'Editar' },
              row.activo 
                ? { key: 'toggle_estatus_desactivar', enabled: !isSuper, onClick: () => onToggleEstado(row), tooltip: 'Desactivar' }
                : { key: 'toggle_estatus_activar', enabled: !isSuper, onClick: () => onToggleEstado(row), tooltip: 'Activar' }
            ]}
          />
        );
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

const LIMITE = 25;

const URL_DEFAULTS = { q: '', rol: '', estado: 'activo', responsabilidad: '', pagina: '1' };

export function UsuariosPage() {
  const [state, setState] = useState({
    status: 'loading',
    usuarios: [],
    total: 0,
    totalPaginas: 1,
    error: null,
  });
  const { params, setParam, setSearch } = useUrlState(URL_DEFAULTS);
  const pagina = parsePageParam(params.pagina);

  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [allAreas, setAllAreas] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    nombreUsuario: '',
    correo: '',
    telefonoE164: '',
    rol: 'AUDITOR',
    contrasena: '',
    areasResponsablesIds: [],
  });

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [isMobile, setIsMobile] = useState(false);
  const debounceRef = useRef(null);

  // Contadores de roles
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    auditores: 0,
    supers: 0,
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cargarStats = useCallback(async () => {
    try {
      const response = await usuariosApi.listar({ limite: 100 });
      const lista = response?.datos ?? [];
      setStats({
        total: lista.length,
        admins: lista.filter((u) => u.rol === 'ADMINISTRADOR').length,
        auditores: lista.filter((u) => u.rol === 'AUDITOR').length,
        supers: lista.filter((u) => u.rol === 'SUPER_ADMIN').length,
      });
    } catch {
      // Ignorar fallos de contadores
    }
  }, []);

  const cargarAreas = useCallback(async () => {
    try {
      const response = await areasApi.listar({ limite: 100, activo: true });
      setAllAreas([...(response?.datos ?? [])].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    } catch {
      // Ignorar errores
    }
  }, []);

  const cargar = useCallback(async (currentParams) => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const p = parsePageParam(currentParams.pagina);
      const query = { pagina: p, limite: LIMITE };
      
      if (currentParams.q) query.busqueda = currentParams.q;
      if (currentParams.rol) query.rol = currentParams.rol.toUpperCase();
      
      if (currentParams.estado === 'activo') query.activo = true;
      else if (currentParams.estado === 'inactivo') query.activo = false;
      
      if (currentParams.responsabilidad) query.responsabilidad = currentParams.responsabilidad;
      
      const response = await usuariosApi.listar(query);
      const datos = response?.datos ?? [];
      const paginacion = response?.paginacion ?? {};
      setState({
        status: 'ready',
        usuarios: datos,
        total: paginacion.total ?? datos.length,
        totalPaginas: paginacion.totalPaginas ?? 1,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, status: 'error', error: error?.message || 'No se pudieron cargar los usuarios.' }));
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(params), 300);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.rol, params.estado, params.responsabilidad, params.pagina, cargar]);

  useEffect(() => {
    cargarStats();
    cargarAreas();
  }, [cargarStats, cargarAreas]);

  const handleFiltro = (key, value) => {
    if (key === 'q') {
      setSearch('q', value);
    } else {
      setParam(key, value);
    }
  };

  const handlePagina = (p) => setParam('pagina', String(p), { resetPage: false });

  const startCreate = () => {
    setForm({
      nombre: '',
      nombreUsuario: '',
      correo: '',
      telefonoE164: '',
      rol: 'AUDITOR',
      contrasena: '',
      areasResponsablesIds: [],
    });
    setActionError(null);
    setIsCreating(true);
  };

  const startEdit = (usuario) => {
    const responsables = (usuario.areasUsuario ?? []).map((ua) => String(ua.area.id));
    setForm({
      nombre: usuario.nombre,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo ?? '',
      telefonoE164: usuario.telefonoE164 ?? '',
      rol: usuario.rol,
      contrasena: '',
      areasResponsablesIds: responsables,
    });
    setActionError(null);
    setEditingUsuario(usuario);
  };

  const saveUsuario = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      if (form.telefonoE164 && !/^\+[1-9]\d{7,14}$/.test(form.telefonoE164.trim())) {
        throw new Error('El teléfono debe usar formato E.164, por ejemplo +525512345678.');
      }

      const payload = {
        nombre: form.nombre,
        nombreUsuario: form.nombreUsuario,
        correo: form.correo || null,
        telefonoE164: form.telefonoE164.trim() || null,
        rol: form.rol,
      };

      let usuarioId;
      if (editingUsuario) {
        usuarioId = editingUsuario.id;
        await usuariosApi.actualizar(usuarioId, payload);
      } else {
        if (!form.contrasena) {
          throw new Error('La contraseña es obligatoria para nuevos usuarios.');
        }
        payload.contrasena = form.contrasena;
        const res = await usuariosApi.crear(payload);
        usuarioId = res.usuario.id;
      }

      // Procesar asignación de áreas bajo su responsabilidad (UsuarioArea)
      const prevResponsables = editingUsuario
        ? (editingUsuario.areasUsuario ?? []).map((ua) => String(ua.area.id))
        : [];

      const toAdd = form.areasResponsablesIds.filter((id) => !prevResponsables.includes(id));
      const toRemove = prevResponsables.filter((id) => !form.areasResponsablesIds.includes(id));

      for (const areaId of toAdd) {
        await areasApi.guardarUsuarioArea(Number(areaId), {
          usuarioId,
        });
      }

      for (const areaId of toRemove) {
        await areasApi.eliminarUsuarioArea(Number(areaId), usuarioId);
      }

      setIsCreating(false);
      setEditingUsuario(null);
      cargar(params);
      cargarStats();
    } catch (err) {
      setActionError(err.message || 'Error al guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (usuario) => {
    const isActivo = usuario.activo;
    const actionMsg = isActivo ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿Estás seguro de que deseas ${actionMsg} a ${usuario.nombre}?`)) return;

    try {
      if (isActivo) {
        await usuariosApi.desactivar(usuario.id);
      } else {
        await usuariosApi.reactivar(usuario.id);
      }
      cargar(params);
      cargarStats();
    } catch (err) {
      alert(err.message || `No se pudo ${actionMsg} el usuario.`);
    }
  };

  const columns = buildColumns(
    (usuario) => setUsuarioDetalle(usuario),
    (usuario) => startEdit(usuario),
    (usuario) => toggleEstado(usuario),
  );

  const labelEstado = params.activo === 'true' ? ' activos' : params.activo === 'false' ? ' inactivos' : '';

  return (
    <section className="space-y-5">
      {/* Cabecera y Contadores */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Administración</p>
          <h1 className="text-3xl font-black text-slate-950">Usuarios</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-center shadow-inner">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Total</span>
            <span className="text-lg font-black text-slate-700">{stats.total}</span>
          </div>
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-center shadow-inner">
            <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-400">Auditores</span>
            <span className="text-lg font-black text-indigo-700">{stats.auditores}</span>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5 text-center shadow-inner">
            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-400">Admins</span>
            <span className="text-lg font-black text-amber-700">{stats.admins}</span>
          </div>
          <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 text-center shadow-inner">
            <span className="block text-[10px] font-black uppercase tracking-wider text-red-400">Super</span>
            <span className="text-lg font-black text-red-700">{stats.supers}</span>
          </div>
        </div>
      </div>

      {/* Acciones e Indicadores */}
      <div className="flex justify-end">
        <Button variant="outline" icon="add" onClick={startCreate}>
          Nuevo usuario
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
            placeholder="Buscar por nombre, username o área a cargo…"
            value={params.q}
            onChange={(e) => handleFiltro('q', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-marca-primario focus:outline-none focus:ring-1 focus:ring-marca-primario/30"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Rol</span>
            <FilterChips value={params.rol} options={ROLES_OPTIONS} onChange={(v) => handleFiltro('rol', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Estado</span>
            <FilterChips value={params.estado} options={ESTADOS} onChange={(v) => handleFiltro('estado', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Responsabilidad</span>
            <FilterChips value={params.responsabilidad} options={RESPONSABILIDAD_OPTS} onChange={(v) => handleFiltro('responsabilidad', v)} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {state.status === 'loading' && <Spinner />}

      {/* Error */}
      {state.status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-bold text-red-700">{state.error}</p>
          <button type="button" onClick={() => cargar(params)} className="mt-1 text-xs text-red-500 underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Desktop: Tabla */}
      {state.status === 'ready' && !isMobile && (
        <Table
          columns={columns}
          data={state.usuarios}
          keyField="id"
          loading={false}
          emptyMessage="No hay usuarios con los filtros aplicados."
          page={pagina}
          totalPages={state.totalPaginas}
          totalItems={state.total}
          onPageChange={handlePagina}
        />
      )}

      {/* Mobile: Cards */}
      {state.status === 'ready' && isMobile && (
        <>
          {state.usuarios.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl bg-white border border-slate-200 text-sm text-slate-400 italic">
              No hay usuarios con los filtros aplicados.
            </div>
          ) : (
            <div className="space-y-2">
              {state.usuarios.map((usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  onVerDetalle={(u) => setUsuarioDetalle(u)}
                  onEditar={(u) => startEdit(u)}
                  onToggleEstado={(u) => toggleEstado(u)}
                />
              ))}
            </div>
          )}
          {state.totalPaginas > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                disabled={pagina <= 1}
                onClick={() => handlePagina(pagina - 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500">{pagina} / {state.totalPaginas}</span>
              <button
                type="button"
                disabled={pagina >= state.totalPaginas}
                onClick={() => handlePagina(pagina + 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      {usuarioDetalle && (
        <UsuarioDetalleModal usuario={usuarioDetalle} onClose={() => setUsuarioDetalle(null)} />
      )}

      {/* Modal de Crear / Editar */}
      <Modal
        isOpen={isCreating || !!editingUsuario}
        onClose={() => { setIsCreating(false); setEditingUsuario(null); }}
        className="max-w-xl"
      >
        <ModalHeader
          title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          onClose={() => { setIsCreating(false); setEditingUsuario(null); }}
        />
        <form onSubmit={saveUsuario} autoComplete="off">
          <ModalBody>
            <div className="space-y-4 font-sans text-sm">
              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                  {actionError}
                </div>
              )}

              <div>
                <Label>Nombre Completo</Label>
                <Input
                  name="name"
                  autoComplete="name"
                  value={form.nombre}
                  required
                  placeholder="Ej: Carlos Mendoza"
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              <div>
                <Label>Username</Label>
                <Input
                  name="username"
                  autoComplete="username"
                  value={form.nombreUsuario}
                  required
                  placeholder="Ej: carlos.mendoza"
                  disabled={!!editingUsuario}
                  onChange={(e) => setForm({ ...form, nombreUsuario: e.target.value })}
                />
              </div>

              <div>
                <Label>Correo Electrónico (Opcional)</Label>
                <Input
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={form.correo}
                  placeholder="Ej: carlos.mendoza@example.test"
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                />
              </div>

              <div>
                <Label>Teléfono (Opcional, E.164)</Label>
                <Input
                  name="telefonoE164"
                  autoComplete="tel"
                  type="tel"
                  inputMode="tel"
                  value={form.telefonoE164}
                  placeholder="Ej: +525512345678"
                  onChange={(e) => setForm({ ...form, telefonoE164: e.target.value })}
                />
              </div>

              <div>
                <Label>Rol</Label>
                <Select
                  name="rol"
                  autoComplete="off"
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                >
                  <option value="AUDITOR">Auditor</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                </Select>
              </div>

              {!editingUsuario && (
                <div>
                  <Label>Contraseña Temporal</Label>
                  <Input
                    name="new-password"
                    autoComplete="new-password"
                    type="password"
                    value={form.contrasena}
                    required
                    placeholder="Mínimo 6 caracteres"
                    onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Se forzará al usuario a cambiarla en su primer inicio de sesión.
                  </p>
                </div>
              )}

              <div>
                <p id="areas-responsabilidad-label" className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Áreas bajo su responsabilidad
                </p>
                <AreaMultiSelect
                  areas={allAreas}
                  value={form.areasResponsablesIds}
                  onChange={(areasResponsablesIds) => setForm({ ...form, areasResponsablesIds })}
                  labelId="areas-responsabilidad-label"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="cancelar"
              size="sm"
              onClick={() => { setIsCreating(false); setEditingUsuario(null); }}
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
    </section>
  );
}
