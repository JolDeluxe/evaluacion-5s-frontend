// src/features/admin/pages/areas-page.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { TableActions } from '@/components/ui/table-actions';
import { areasApi } from '@/features/admin/api/areas-api';
import { cn } from '@/utils/cn';

// ---------------------------------------------------------------------------
// Helpers visuales
// ---------------------------------------------------------------------------

function TipoBadge({ tipo }) {
  const isOp = tipo === 'OPERATIVA';
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-black uppercase tracking-wide',
      isOp ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700',
    )}>
      {isOp ? 'Operativa' : 'Administrativa'}
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
      {activo ? 'Activa' : 'Inactiva'}
    </span>
  );
}

function ResponsableCell({ usuariosArea }) {
  const responsables = (usuariosArea ?? []).filter((ua) => ua.esResponsable);
  const otros = (usuariosArea ?? []).length - responsables.length;

  if (responsables.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
        Sin responsable
      </span>
    );
  }

  const principal = responsables[0];
  const extra = responsables.length - 1 + otros;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold text-slate-800 leading-tight">
        {principal.usuario.nombre}
      </span>
      <div className="flex items-center gap-1">
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded',
          principal.usuario.rol === 'AUDITOR' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600',
        )}>
          {principal.usuario.rol}
        </span>
        {extra > 0 && <span className="text-[11px] text-slate-400">+{extra}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta mobile
// ---------------------------------------------------------------------------

function AreaCard({ area, onVerDetalle }) {
  const responsable = (area.usuariosArea ?? []).find((ua) => ua.esResponsable);
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm cursor-pointer hover:bg-slate-50 transition"
      onClick={() => onVerDetalle(area)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onVerDetalle(area)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{area.codigo}</p>
          <p className="mt-0.5 text-sm font-black text-slate-900 leading-snug line-clamp-2">{area.nombre}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <EstadoBadge activo={area.activo} />
          <TipoBadge tipo={area.tipo} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 border-t border-slate-100 pt-2">
        <Icon name="person" size="14px" className="text-slate-400 shrink-0" />
        {responsable
          ? <span className="text-xs text-slate-600 font-medium truncate">{responsable.usuario.nombre}</span>
          : <span className="text-xs font-bold text-red-500">Sin responsable</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de detalle del area
// ---------------------------------------------------------------------------

function AreaDetalleModal({ area, onClose }) {
  if (!area) return null;
  const responsables = (area.usuariosArea ?? []).filter((ua) => ua.esResponsable);
  const relacionados = (area.usuariosArea ?? []).filter((ua) => !ua.esResponsable);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/70 bg-white/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
              {area.tipo === 'OPERATIVA' ? 'Área operativa' : 'Área administrativa'}
            </p>
            <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{area.nombre}</h2>
            <p className="mt-1 font-mono text-xs text-slate-400">{area.codigo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <Icon name="close" size="18px" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            <EstadoBadge activo={area.activo} />
            <TipoBadge tipo={area.tipo} />
          </div>

          {/* Responsables */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
              Responsable(s) del área
            </p>
            {responsables.length === 0 ? (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                <p className="text-sm font-bold text-red-600">Sin responsable asignado</p>
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
                    <span className="ml-auto shrink-0 text-[10px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase">
                      Responsable
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Relacionados */}
          {relacionados.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
                Usuarios relacionados
              </p>
              <div className="space-y-1.5">
                {relacionados.map((ua) => (
                  <div key={ua.usuario.id} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <Icon name="person_outline" size="16px" className="text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{ua.usuario.nombre}</p>
                      <p className="text-[11px] text-slate-500">@{ua.usuario.nombreUsuario} · {ua.usuario.rol}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {area.areaPadre && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-1">Área padre</p>
              <p className="text-sm text-slate-700 font-medium">
                {area.areaPadre.codigo} — {area.areaPadre.nombre}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-3 flex justify-end">
          <Button variant="cancelar" size="sm" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
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
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-bold transition-colors',
            value === opt.value
              ? 'bg-marca-primario text-white shadow-sm'
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

function buildColumns(onVerDetalle) {
  return [
    {
      header: 'Código',
      accessorKey: 'codigo',
      headerClassName: 'w-[110px]',
      cell: (row) => (
        <span className="font-mono text-xs font-black text-slate-500 uppercase tracking-wider">
          {row.codigo}
        </span>
      ),
    },
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
      header: 'Responsable',
      accessorKey: 'responsable',
      headerClassName: 'w-[220px]',
      cell: (row) => <ResponsableCell usuariosArea={row.usuariosArea} />,
    },
    {
      header: 'Relacionados',
      accessorKey: 'relacionados',
      align: 'center',
      headerClassName: 'w-[100px]',
      cell: (row) => {
        const count = (row.usuariosArea ?? []).length;
        return <span className="text-sm text-slate-500 font-medium">{count === 0 ? '—' : count}</span>;
      },
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
      headerClassName: 'w-[80px]',
      cell: (row) => (
        <TableActions
          row={row}
          actions={[{ key: 'ver_detalle', enabled: true, onClick: () => onVerDetalle(row), tooltip: 'Ver detalle' }]}
        />
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

const LIMITE = 25;

export function AreasPage() {
  const [state, setState] = useState({
    status: 'loading',
    areas: [],
    total: 0,
    pagina: 1,
    totalPaginas: 1,
    error: null,
  });
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    activo: 'true',
    sinResponsable: '',
  });
  const [areaDetalle, setAreaDetalle] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cargar = useCallback(async (pagina, filtrosActuales) => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const query = { pagina, limite: LIMITE };
      if (filtrosActuales.busqueda) query.busqueda = filtrosActuales.busqueda;
      if (filtrosActuales.tipo) query.tipo = filtrosActuales.tipo;
      if (filtrosActuales.activo !== '') query.activo = filtrosActuales.activo;
      if (filtrosActuales.sinResponsable !== '') query.sinResponsable = filtrosActuales.sinResponsable;
      const response = await areasApi.listar(query);
      const datos = response?.datos ?? [];
      const paginacion = response?.paginacion ?? {};
      setState({
        status: 'ready',
        areas: datos,
        total: paginacion.total ?? datos.length,
        pagina: paginacion.pagina ?? pagina,
        totalPaginas: paginacion.totalPaginas ?? 1,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, status: 'error', error: error?.message || 'No se pudieron cargar las áreas.' }));
    }
  }, []);

  const filtrosRef = useRef(filtros);
  filtrosRef.current = filtros;

  useEffect(() => {
    cargar(1, filtrosRef.current);
  }, [cargar]);

  const handleFiltro = (key, value) => {
    const nuevos = { ...filtros, [key]: value };
    setFiltros(nuevos);
    if (key === 'busqueda') {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => cargar(1, nuevos), 350);
    } else {
      cargar(1, nuevos);
    }
  };

  const handlePagina = (p) => cargar(p, filtros);

  const columns = buildColumns((area) => setAreaDetalle(area));

  const labelEstado = filtros.activo === 'true' ? ' activas' : filtros.activo === 'false' ? ' inactivas' : '';

  return (
    <section className="space-y-5">
      {/* Cabecera */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Administración</p>
        <h1 className="text-3xl font-black text-slate-950">Áreas</h1>
        {state.status === 'ready' && (
          <p className="mt-1 text-sm text-slate-500">
            {state.total} {state.total === 1 ? 'área' : 'áreas'}{labelEstado}
          </p>
        )}
      </div>

      {/* Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <input
            type="text"
            placeholder="Buscar por código, nombre…"
            value={filtros.busqueda}
            onChange={(e) => handleFiltro('busqueda', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-marca-primario focus:outline-none focus:ring-1 focus:ring-marca-primario/30"
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Tipo</span>
            <FilterChips value={filtros.tipo} options={TIPOS} onChange={(v) => handleFiltro('tipo', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Estado</span>
            <FilterChips value={filtros.activo} options={ESTADOS} onChange={(v) => handleFiltro('activo', v)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">Responsable</span>
            <FilterChips value={filtros.sinResponsable} options={RESPONSABLE_OPTS} onChange={(v) => handleFiltro('sinResponsable', v)} />
          </div>
        </div>
      </div>

      {/* Loading */}
      {state.status === 'loading' && <Spinner />}

      {/* Error */}
      {state.status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-bold text-red-700">{state.error}</p>
          <button type="button" onClick={() => cargar(state.pagina, filtros)} className="mt-1 text-xs text-red-500 underline">
            Reintentar
          </button>
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
          page={state.pagina}
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
                <AreaCard key={area.id} area={area} onVerDetalle={(a) => setAreaDetalle(a)} />
              ))}
            </div>
          )}
          {state.totalPaginas > 1 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                disabled={state.pagina <= 1}
                onClick={() => handlePagina(state.pagina - 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs text-slate-500">{state.pagina} / {state.totalPaginas}</span>
              <button
                type="button"
                disabled={state.pagina >= state.totalPaginas}
                onClick={() => handlePagina(state.pagina + 1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      {areaDetalle && (
        <AreaDetalleModal area={areaDetalle} onClose={() => setAreaDetalle(null)} />
      )}
    </section>
  );
}
