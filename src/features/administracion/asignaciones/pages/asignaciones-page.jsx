import { useAsignaciones } from '@/features/administracion/asignaciones/hooks/use-asignaciones';
import { AsignacionesView } from '@/features/administracion/asignaciones/views/asignaciones-view';

export function AsignacionesPage() {
  const asignaciones = useAsignaciones();

  return (
    <AsignacionesView
      anio={asignaciones.anio}
      mes={asignaciones.mes}
      params={asignaciones.params}
      state={asignaciones.state}
      data={asignaciones.data}
      editing={asignaciones.editing}
      autoLoading={asignaciones.autoLoading}
      mensaje={asignaciones.mensaje}
      onPeriodoChange={asignaciones.handlePeriodo}
      onAutoasignar={asignaciones.autoasignar}
      onSetParam={asignaciones.setParam}
      onSetSearch={asignaciones.setSearch}
      onEdit={asignaciones.setEditing}
      onCloseEdit={asignaciones.cerrarEdicion}
      onSaved={asignaciones.handleSaved}
      onSaveAsignacion={asignaciones.guardarAsignacionMensual}
      onReabrirAsignacion={asignaciones.reabrirAsignacion}
    />
  );
}
