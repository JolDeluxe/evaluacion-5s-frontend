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
import { areasApi } from '@/features/administracion/areas/api/areas-api';
import { usuariosApi } from '@/features/administracion/usuarios/api/usuarios-api';
import { AdministracionNav } from '@/features/administracion/components/administracion-nav';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/utils/cn';
import { obtenerCatalogoCompleto } from '@/utils/catalogo-completo';

// ---------------------------------------------------------------------------
// Helpers visuales
// ---------------------------------------------------------------------------

function EstadoAreaIndicator({ activo, tipo }) {
  const tipoLabel = tipo === 'OPERATIVA' ? 'Operativa' : 'Administrativa';
  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
      <span>{tipoLabel}</span>
      <span>·</span>
      <span className={cn('inline-flex items-center gap-1 font-bold', activo ? 'text-emerald-700' : 'text-slate-500')}>
        <span className={cn('h-1.5 w-1.5 rounded-full', activo ? 'bg-emerald-500' : 'bg-slate-400')} />
        {activo ? 'Activa' : 'Inactiva'}
      </span>
    </div>
  );
}

function ResponsablesList({ usuariosArea }) {
  const responsables = usuariosArea ?? [];

  if (responsables.length === 0) {
    return (
      <span className="text-xs font-bold text-rose-600">Sin responsables</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[280px]">
      {responsables.map((ua) => (
        <span
          key={ua.usuario.id}
          className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full"
        >
          {ua.usuario.nombre}
        </span>
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
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2" onClick={() => onVerDetalle(area)}>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-slate-900 leading-snug break-words">{area.nombre}</h2>
          <EstadoAreaIndicator activo={area.activo} tipo={area.tipo} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <div className="min-w-0 flex-1" onClick={() => onVerDetalle(area)}>
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Responsables</span>
          {responsables.length === 0 ? (
            <span className="text-xs font-bold text-rose-600 block mt-0.5">Sin responsables</span>
          ) : (
            <div className="flex flex-wrap gap-1 mt-1">
              {responsables.map((ua) => (
                <span key={ua.usuario.id} className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {ua.usuario.nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 pt-3">
          <Button
            type="button"
            onClick={() => onVerDetalle(area)}
            variant="ghost"
            size="icon"
            icon="visibility"
            className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-lg"
            title="Ver detalle"
            aria-label="Ver detalle"
          />
          <Button
            type="button"
            onClick={() => onEditar(area)}
            variant="ghost"
            size="icon"
            icon="edit"
            className="h-8 w-8 text-amber-500 hover:bg-slate-100 rounded-lg"
            title="Editar área"
            aria-label="Editar área"
          />
          <Button
            type="button"
            onClick={() => onToggleEstado(area)}
            variant="ghost"
            size="icon"
            icon={area.activo ? "block" : "check_circle"}
            className={cn("h-8 w-8 hover:bg-slate-100 rounded-lg", area.activo ? "text-red-500" : "text-emerald-500")}
            title={area.activo ? "Desactivar área" : "Reactivar área"}
            aria-label={area.activo ? "Desactivar área" : "Reactivar área"}
          />
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
          <EstadoAreaIndicator activo={area.activo} tipo={area.tipo} />

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
  { value: '', label: 'Todos' },
  { value: 'ADMINISTRATIVA', label: 'Administrativa' },
  { value: 'OPERATIVA', label: 'Operativa' },
];

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Activas' },
  { value: 'false', label: 'Inactivas' },
];

const RESPONSABLE_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'false', label: 'Con responsable' },
  { value: 'true', label: 'Sin responsable' },
];

function FilterGridGroup({ title, value, options, onChange }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{title}</span>
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-0.5">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-md py-1 px-1 text-center text-xs font-black transition truncate',
                isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
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
      cell: (row) => <EstadoAreaIndicator activo={row.activo} tipo={row.tipo} />,
    },
    {
      header: 'Responsables',
      accessorKey: 'responsables',
      headerClassName: 'w-[300px]',
      cell: (row) => <ResponsablesList usuariosArea={row.usuariosArea} />,
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

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  const activeFiltersCount = [
    params.tipo !== '',
    params.activo !== 'true',
    params.sinResponsable !== '',
  ].filter(Boolean).length;

  const limpiarFiltros = () => {
    setParam('tipo', '');
    setParam('activo', 'true');
    setParam('sinResponsable', '');
    setSearch('q', '');
  };

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
      const query = {};
      if (currentParams.q) query.busqueda = currentParams.q;
      if (currentParams.tipo) query.tipo = currentParams.tipo;
      if (currentParams.activo !== '') query.activo = currentParams.activo;
      if (currentParams.sinResponsable !== '') query.sinResponsable = currentParams.sinResponsable;

      const { datos } = await obtenerCatalogoCompleto(areasApi.listar, query, 100);
      datos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-MX'));

      setState({
        status: 'ready',
        areas: datos,
        total: datos.length,
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
  }, [params.q, params.tipo, params.activo, params.sinResponsable, cargar]);

  const handleFiltro = (key, value) => {
    if (key === 'busqueda') {
      setSearch('q', value);
    } else {
      setParam(key, value);
    }
  };

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

  const [deactivatingArea, setDeactivatingArea] = useState(null);
  const [deactivationImpact, setDeactivationImpact] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [deactivationEffectiveFrom, setDeactivationEffectiveFrom] = useState('ESTE_MES');

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

    setDeactivatingArea(area);
    setDeactivationEffectiveFrom('ESTE_MES');
    setLoadingImpact(true);
    setActionError(null);
    try {
      const impacto = await areasApi.obtenerImpactoDesactivacion(area.id);
      setDeactivationImpact(impacto);
    } catch (err) {
      setActionError(err.message || 'Error al obtener impacto de desactivación.');
    } finally {
      setLoadingImpact(false);
    }
  };

  const confirmarDesactivacion = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      await areasApi.desactivar(deactivatingArea.id, {
        efectivaDesde: deactivationEffectiveFrom,
      });
      setDeactivatingArea(null);
      setDeactivationImpact(null);
      cargar(params);
    } catch (err) {
      setActionError(err.message || 'Error al desactivar el área.');
    } finally {
      setSaving(false);
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
    <section className="space-y-4 pb-16">
      {/* Encabezado */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento leading-none">
          ADMINISTRACIÓN
        </p>
        <h1 className="fuente-titulos text-2xl sm:text-3xl font-normal uppercase leading-tight text-marca-primario mt-0.5">
          Áreas
        </h1>
      </div>

      {/* Navegación compartida (Mobile local) */}
      <div className="md:hidden">
        <AdministracionNav />
      </div>

      {/* Resumen compacto y Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          {state.status === 'ready' && (
            <p className="text-xs sm:text-sm font-black text-slate-800">
              {state.total} {state.total === 1 ? 'área' : 'áreas'}{labelEstado}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" icon="add" onClick={startCreate} className="h-9 text-xs font-black">
            Nueva área
          </Button>
        </div>
      </div>

      {/* Filtros Mobile (Búsqueda + Botón Filtros Modal) */}
      <div className="md:hidden space-y-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <Input
            type="text"
            placeholder="Buscar por nombre o responsable..."
            value={params.q}
            onChange={(e) => handleFiltro('q', e.target.value)}
            className="bg-white pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            icon="tune"
            iconSize="16px"
            onClick={() => setShowMobileFilters(true)}
            className="h-8 px-3 text-xs font-black gap-1.5 bg-white shadow-sm"
          >
            Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {(activeFiltersCount > 0 || params.q) && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline px-1"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filtros Desktop */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <Input
            type="text"
            placeholder="Buscar por nombre o responsable..."
            value={params.q}
            onChange={(e) => handleFiltro('q', e.target.value)}
            className="bg-slate-50 pl-9 h-9 text-xs"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FilterGridGroup title="TIPO" value={params.tipo} options={TIPOS} onChange={(v) => handleFiltro('tipo', v)} />
          <FilterGridGroup title="ESTADO" value={params.activo} options={ESTADOS} onChange={(v) => handleFiltro('activo', v)} />
          <FilterGridGroup title="RESPONSABLE" value={params.sinResponsable} options={RESPONSABLE_OPTS} onChange={(v) => handleFiltro('sinResponsable', v)} />
        </div>
      </div>

      {/* Modal de Filtros Mobile */}
      <Modal isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)} className="max-w-md">
        <ModalHeader title="Filtros de Áreas" onClose={() => setShowMobileFilters(false)} />
        <ModalBody>
          <div className="space-y-4">
            <FilterGridGroup title="TIPO" value={params.tipo} options={TIPOS} onChange={(v) => handleFiltro('tipo', v)} />
            <FilterGridGroup title="ESTADO" value={params.activo} options={ESTADOS} onChange={(v) => handleFiltro('activo', v)} />
            <FilterGridGroup title="RESPONSABLE" value={params.sinResponsable} options={RESPONSABLE_OPTS} onChange={(v) => handleFiltro('sinResponsable', v)} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="cancelar" size="sm" onClick={limpiarFiltros}>
            Limpiar
          </Button>
          <Button variant="guardar" size="sm" onClick={() => setShowMobileFilters(false)}>
            Aplicar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Loading */}
      {state.status === 'loading' && <Spinner />}

      {/* Error */}
      {state.status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-bold text-red-700">{state.error || 'Error al cargar las áreas.'}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => cargar(params)}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Tabla desktop / Tarjetas mobile */}
      {state.status === 'ready' && (
        <>
          {state.areas.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <Icon name="search_off" size="36px" className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-700">No se encontraron áreas</p>
              <p className="text-xs text-slate-500">Prueba ajustando los filtros de búsqueda.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table columns={columns} data={state.areas} />
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-2.5">
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
            </>
          )}
        </>
      )}

      {/* Modales */}
      <AreaDetalleModal area={areaDetalle} onClose={() => setAreaDetalle(null)} />

      {/* Modal Crear/Editar */}
      <Modal isOpen={isCreating || !!editingArea} onClose={() => { setIsCreating(false); setEditingArea(null); }}>
        <ModalHeader title={editingArea ? 'Editar área' : 'Nueva área'} onClose={() => { setIsCreating(false); setEditingArea(null); }} />
        <form onSubmit={saveArea}>
          <ModalBody>
            <div className="space-y-4">
              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                  {actionError}
                </div>
              )}

              <div>
                <Label required>Nombre del área</Label>
                <Input
                  type="text"
                  placeholder="Ej. Almacén Principal"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label required>Tipo de área</Label>
                <Select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  <option value="OPERATIVA">Operativa</option>
                  <option value="ADMINISTRATIVA">Administrativa</option>
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
                      <Label required>Auditor asignado para este mes</Label>
                      <Select
                        value={form.auditorMensualId}
                        onChange={(e) => setForm({ ...form, auditorMensualId: e.target.value })}
                        required
                      >
                        <option value="">Selecciona auditor</option>
                        {auditoresElegiblesFormulario.map((usuario) => (
                          <option key={usuario.id} value={usuario.id}>
                            {usuario.nombre} (@{usuario.nombreUsuario})
                          </option>
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

      {/* Modal Desactivar Área */}
      <Modal isOpen={!!deactivatingArea} onClose={() => { setDeactivatingArea(null); setDeactivationImpact(null); setActionError(null); }}>
        <ModalHeader title="Desactivar área" onClose={() => { setDeactivatingArea(null); setDeactivationImpact(null); setActionError(null); }} />
        <form onSubmit={confirmarDesactivacion}>
          <ModalBody>
            <div className="space-y-4">
              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                  {actionError}
                </div>
              )}

              <p className="text-xs font-black uppercase tracking-wider text-marca-acento">
                Área seleccionada
              </p>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {deactivatingArea?.nombre}
              </h3>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <p className="text-xs text-slate-600">
                  Esta área tiene auditorías programadas. Define desde cuándo dejará de ser auditable:
                </p>
                {loadingImpact ? (
                  <div className="flex items-center gap-2 py-2">
                    <Spinner size="sm" />
                    <span className="text-xs text-slate-500">Calculando impacto...</span>
                  </div>
                ) : deactivationImpact ? (
                  <div className="text-xs text-slate-500 space-y-1 bg-white p-2 rounded border border-slate-200">
                    <p>• Auditorías pendientes este mes: <strong>{deactivationImpact.objetivosEsteMes}</strong></p>
                    <p>• Auditorías programadas posteriores: <strong>{deactivationImpact.objetivosPosteriores}</strong></p>
                    <p>• Auditores afectados: <strong>{deactivationImpact.auditoresAfectados}</strong></p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <label className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition",
                  deactivationEffectiveFrom === 'ESTE_MES' ? "border-marca-primario bg-marca-primario/5" : "border-slate-200 bg-white"
                )}>
                  <input
                    type="radio"
                    name="efectivaDesde"
                    value="ESTE_MES"
                    checked={deactivationEffectiveFrom === 'ESTE_MES'}
                    onChange={() => setDeactivationEffectiveFrom('ESTE_MES')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-black text-slate-900">Desde este mes</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Las auditorías pendientes de este mes y las de los meses posteriores dejarán de aplicar.
                    </p>
                  </div>
                </label>

                <label className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition",
                  deactivationEffectiveFrom === 'PROXIMO_MES' ? "border-marca-primario bg-marca-primario/5" : "border-slate-200 bg-white"
                )}>
                  <input
                    type="radio"
                    name="efectivaDesde"
                    value="PROXIMO_MES"
                    checked={deactivationEffectiveFrom === 'PROXIMO_MES'}
                    onChange={() => setDeactivationEffectiveFrom('PROXIMO_MES')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-xs font-black text-slate-900">A partir del siguiente mes</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Las auditorías de este mes continuarán normalmente. A partir del siguiente mes dejarán de aplicar.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="cancelar"
              size="sm"
              onClick={() => { setDeactivatingArea(null); setDeactivationImpact(null); setActionError(null); }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="guardar" size="sm" isLoading={saving}>
              Desactivar área
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal Reactivar Área */}
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
