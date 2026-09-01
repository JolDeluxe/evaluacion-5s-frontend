import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Select } from '@/components/form/select';
import { MonthPicker } from '@/features/administracion/asignaciones/components/month-picker';
import { AsignacionesList } from '@/features/administracion/asignaciones/components/asignaciones-list';
import { EditarAsignacionModal } from '@/features/administracion/asignaciones/components/editar-asignacion-modal';
import { CargaMensual } from '@/features/administracion/asignaciones/components/carga-mensual';
import { AutoasignacionModal } from '@/features/administracion/asignaciones/components/autoasignacion-modal';
import { AdministracionNav } from '@/features/administracion/components/administracion-nav';
import { ESTADOS_ASIGNACION } from '@/features/administracion/asignaciones/utils/asignaciones-utils';

import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';

function AsignacionesHeader({ anio, mes, onPeriodoChange }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento leading-none">
          ADMINISTRACIÓN
        </p>
        <h1 className="fuente-titulos text-2xl sm:text-3xl font-normal uppercase leading-tight text-marca-primario mt-0.5">
          Asignaciones de Auditoría
        </h1>
      </div>

      {/* Navegación compartida (Mobile local) */}
      <div className="md:hidden">
        <AdministracionNav />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
        <p className="text-xs font-medium text-slate-500">
          Asigna y gestiona el auditor responsable de cada área durante el mes.
        </p>
        <div className="w-full sm:w-auto sm:min-w-[260px]">
          <MonthPicker anio={anio} mes={mes} onChange={onPeriodoChange} />
        </div>
      </div>
    </div>
  );
}

function ResumenAsignaciones({ resumen, onOpenAutoasignar }) {
  return (
    <div className="space-y-2.5">
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-sm">
        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div className="px-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Total</span>
            <span className="text-base sm:text-xl font-black text-slate-900">{resumen.areas}</span>
          </div>
          <div className="px-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-600">Con Auditor</span>
            <span className="text-base sm:text-xl font-black text-emerald-700">{resumen.asignadas}</span>
          </div>
          <div className="px-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-600">Sin Auditor</span>
            <span className="text-base sm:text-xl font-black text-amber-600">{resumen.sinAuditor}</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="default"
        icon="auto_fix_high"
        onClick={onOpenAutoasignar}
        className="w-full md:w-auto shadow-sm text-xs font-black h-9"
      >
        Autoasignar pendientes
      </Button>
    </div>
  );
}

function FiltrosAsignaciones({ params, auditores, mensaje, onSetParam, onSetSearch }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const tieneFiltrosActivos = params.q || params.estado || params.auditor;

  const activeFiltersCount = [
    Boolean(params.estado),
    Boolean(params.auditor),
  ].filter(Boolean).length;

  const limpiarFiltros = () => {
    onSetSearch('q', '');
    onSetParam('estado', '');
    onSetParam('auditor', '');
  };

  return (
    <div className="space-y-2">
      {/* Mobile: Búsqueda + Botón Filtros Modal */}
      <div className="md:hidden space-y-2">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <input
            value={params.q}
            onChange={(event) => onSetSearch('q', event.target.value)}
            placeholder="Buscar por área o auditor…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-marca-secundario focus:ring-1 focus:ring-marca-secundario h-9"
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

          {tieneFiltrosActivos && (
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

      {/* Desktop: Filtros directos */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm space-y-2">
        <div className="grid gap-2.5 md:grid-cols-[1fr_180px_220px_auto]">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icon name="search" size="18px" />
            </span>
            <input
              value={params.q}
              onChange={(event) => onSetSearch('q', event.target.value)}
              placeholder="Buscar por área o auditor…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-marca-secundario focus:ring-1 focus:ring-marca-secundario h-9"
            />
          </div>

          <Select
            value={params.estado}
            onChange={(event) => onSetParam('estado', event.target.value)}
            className="bg-white text-xs font-semibold h-9"
          >
            {ESTADOS_ASIGNACION.map((estado) => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </Select>

          <Select
            value={params.auditor}
            onChange={(event) => onSetParam('auditor', event.target.value)}
            className="bg-white text-xs font-semibold h-9"
          >
            <option value="">Todos los auditores</option>
            {auditores.map((auditor) => (
              <option key={auditor.id} value={auditor.id}>{auditor.nombre}</option>
            ))}
          </Select>

          {tieneFiltrosActivos && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon="filter_alt_off"
              onClick={limpiarFiltros}
              className="text-slate-500 hover:text-slate-900 h-9"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Filtros Mobile */}
      <Modal isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)} className="max-w-md">
        <ModalHeader title="Filtros de Asignaciones" onClose={() => setShowMobileFilters(false)} />
        <ModalBody>
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Estado</span>
              <Select
                value={params.estado}
                onChange={(event) => onSetParam('estado', event.target.value)}
                className="bg-white text-xs font-semibold h-9 w-full"
              >
                {ESTADOS_ASIGNACION.map((estado) => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </Select>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Auditor</span>
              <Select
                value={params.auditor}
                onChange={(event) => onSetParam('auditor', event.target.value)}
                className="bg-white text-xs font-semibold h-9 w-full"
              >
                <option value="">Todos los auditores</option>
                {auditores.map((auditor) => (
                  <option key={auditor.id} value={auditor.id}>{auditor.nombre}</option>
                ))}
              </Select>
            </div>
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

      {mensaje && <p className="px-1 text-xs font-bold text-slate-500">{mensaje}</p>}
    </div>
  );
}

export function AsignacionesView({
  anio,
  mes,
  params,
  state,
  data,
  editing,
  mensaje,
  onPeriodoChange,
  onSaved,
  onSetParam,
  onSetSearch,
  onEdit,
  onCloseEdit,
  onSaveAsignacion,
  onReabrirAsignacion,
}) {
  const [showAutoModal, setShowAutoModal] = useState(false);

  return (
    <section className="space-y-4 pb-16">
      <AsignacionesHeader anio={anio} mes={mes} onPeriodoChange={onPeriodoChange} />

      {data && (
        <ResumenAsignaciones
          resumen={data.resumen}
          onOpenAutoasignar={() => setShowAutoModal(true)}
        />
      )}

      <FiltrosAsignaciones
        params={params}
        auditores={data?.auditores ?? []}
        mensaje={mensaje}
        onSetParam={onSetParam}
        onSetSearch={onSetSearch}
      />

      <CargaMensual auditores={data?.auditores ?? []} anio={anio} mes={mes} />

      {state.status === 'loading' && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {state.status === 'error' && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {state.error}
        </p>
      )}

      {state.status === 'ready' && (
        <AsignacionesList filas={data?.filas ?? []} onEdit={onEdit} />
      )}

      {editing && (
        <EditarAsignacionModal
          fila={editing}
          auditores={data?.auditores ?? []}
          anio={anio}
          mes={mes}
          onClose={onCloseEdit}
          onSaved={onSaved}
          onSaveAsignacion={onSaveAsignacion}
          onReabrirAsignacion={onReabrirAsignacion}
        />
      )}

      {showAutoModal && (
        <AutoasignacionModal
          anio={anio}
          mes={mes}
          auditores={data?.auditores ?? []}
          onClose={() => setShowAutoModal(false)}
          onConfirmed={onSaved}
        />
      )}
    </section>
  );
}
