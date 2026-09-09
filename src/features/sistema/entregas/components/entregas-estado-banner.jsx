import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function EntregasEstadoBanner({
  estado,
  controlOperativo,
  onAbrirControlOperativo,
  onAbrirSimulacion,
  onAbrirConexionMicrosoft,
  onProbarCola,
  probandoCola,
  onRecargar,
  cargando,
}) {
  if (!estado) return null;

  const controlEstado = controlOperativo?.estado || 'PAUSADO';
  const esControlActivo = controlEstado === 'ACTIVO';
  const esServidorHabilitado = Boolean(estado.emailEnabled);
  const estadoEfectivoActivo = Boolean(esServidorHabilitado && esControlActivo);
  const testActivo = Boolean(estado.emailTestEnabled);
  const esMicrosoft = estado.emailProvider === 'microsoft_graph';
  const microsoft = estado.microsoft || {};
  const msConectado = Boolean(microsoft.conectado);
  const msRequiereReconexion = Boolean(microsoft.requiereReconexion);

  const preflight = controlOperativo?.preflight;
  const hayPendientesPrueba = Boolean(preflight?.bloqueadoPorPruebas);

  return (
    <Card className="border-white/80 bg-white/85 shadow-sm backdrop-blur-xl">
      <CardBody className="p-5 sm:p-6 space-y-4">
        {/* Cabecera Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                estadoEfectivoActivo
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              )}
            >
              <Icon name={esMicrosoft ? 'cloud' : 'alternate_email'} size="md" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Proveedor: {esMicrosoft ? 'Microsoft Outlook (Graph v1.0)' : 'Servidor SMTP'}
                </h2>

                {/* Badge de Estado Efectivo */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border',
                    estadoEfectivoActivo
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      estadoEfectivoActivo ? 'bg-emerald-600' : 'bg-amber-600'
                    )}
                  />
                  Estado Efectivo: {estadoEfectivoActivo ? 'ACTIVO' : 'PAUSADO'}
                </span>

                {testActivo && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-900 border border-sky-200">
                    <Icon name="science" size="xs" /> Pruebas Permitidas
                  </span>
                )}
              </div>

              {/* Mensaje explicativo según la combinación de estados */}
              <p className="text-xs font-semibold text-slate-500">
                {estadoEfectivoActivo
                  ? 'El worker está despachando notificaciones automáticas en segundo plano (ambos interruptores activos).'
                  : !esServidorHabilitado && !esControlActivo
                  ? 'Despacho inactivo: tanto el interruptor del servidor (.env) como el control operativo (BD) están desactivados.'
                  : !esServidorHabilitado && esControlActivo
                  ? 'Despacho inactivo: el control operativo (BD) está ACTIVO, pero EMAIL_ENABLED está DESHABILITADO en el servidor.'
                  : 'Despacho pausado: el servidor está HABILITADO, pero el control operativo (BD) está en PAUSADO (modo seguro fail-safe).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Botón de Pausa / Reanudación Operativa */}
            <Button
              type="button"
              variant={esControlActivo ? 'danger' : 'primary'}
              size="sm"
              icon={esControlActivo ? 'pause' : 'play_arrow'}
              onClick={() => onAbrirControlOperativo(esControlActivo ? 'pausar' : 'reanudar')}
              className="text-xs font-bold shadow-sm"
            >
              {esControlActivo ? 'Pausar Envíos' : 'Reanudar Envíos'}
            </Button>

            {esMicrosoft && (
              <Button
                type="button"
                variant={msConectado ? 'outline' : 'primary'}
                size="sm"
                icon="account_circle"
                onClick={onAbrirConexionMicrosoft}
                className="text-xs font-bold"
              >
                {msConectado ? 'Cuenta Outlook' : 'Conectar Outlook'}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="science"
              onClick={onAbrirSimulacion}
              className="text-xs font-bold"
            >
              Simular Envíos
            </Button>

            {testActivo && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon="biotech"
                onClick={onProbarCola}
                disabled={cargando || probandoCola}
                className="text-xs font-bold text-sky-800 border-sky-200 bg-sky-50/50 hover:bg-sky-100/70"
                title="Crea 1 entrega real en cola (estado PENDIENTE) dirigida a tu correo de Super Admin"
              >
                {probandoCola ? 'Creando...' : 'Probar cola'}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="refresh"
              onClick={onRecargar}
              disabled={cargando || probandoCola}
              className="text-xs font-bold"
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Panel comparativo de los tres estados clave */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3">
          {/* 1. Interruptor Servidor (.env) */}
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-100 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Interruptor Servidor (.env)
              </span>
              <p className="text-xs font-bold text-slate-700">EMAIL_ENABLED</p>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-black uppercase tracking-wider border',
                esServidorHabilitado
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              )}
            >
              {esServidorHabilitado ? 'HABILITADO' : 'DESHABILITADO'}
            </span>
          </div>

          {/* 2. Control Operativo (BD) */}
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-100 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Control Operativo (BD)
              </span>
              <p className="text-xs font-bold text-slate-700 truncate max-w-[140px]" title={controlOperativo?.motivo || ''}>
                {controlOperativo?.motivo || (esControlActivo ? 'Envíos autorizados' : 'Envíos detenidos')}
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-black uppercase tracking-wider border',
                esControlActivo
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}
            >
              {esControlActivo ? 'ACTIVO' : 'PAUSADO'}
            </span>
          </div>

          {/* 3. Estado Efectivo */}
          <div className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-slate-100 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Estado Efectivo
              </span>
              <p className="text-xs font-bold text-slate-700">
                {estadoEfectivoActivo ? 'Despachando correos' : 'Envíos en espera'}
              </p>
            </div>
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border',
                estadoEfectivoActivo
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              )}
            >
              {estadoEfectivoActivo ? 'ACTIVO' : 'PAUSADO'}
            </span>
          </div>
        </div>

        {/* Alerta de Preflight: Entregas hacia @example.test */}
        {hayPendientesPrueba && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-xs flex items-center justify-between gap-3 text-amber-950">
            <div className="flex items-center gap-2">
              <Icon name="warning" size="sm" className="text-amber-700 shrink-0" />
              <span>
                <strong>Atención Preflight:</strong> Existen{' '}
                <strong>{preflight.pendientesExampleTest} entregas pendientes</strong> dirigidas a dominios de prueba (
                <code>@example.test</code>). Deben ser canceladas antes de poder reanudar los envíos automáticos.
              </span>
            </div>
          </div>
        )}

        {/* Sub-grid con detalles técnicos adicionales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {esMicrosoft ? (
            <>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Estado Microsoft</span>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  {msRequiereReconexion ? (
                    <span className="text-amber-600">Requiere Reconexión</span>
                  ) : msConectado ? (
                    <span className="text-emerald-600">Conectado</span>
                  ) : (
                    <span className="text-slate-400">No conectado</span>
                  )}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Buzón de Salida</span>
                <p className="font-bold text-slate-800 truncate" title={microsoft.cuenta || 'Sin cuenta'}>
                  {microsoft.cuenta || '—'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Servidor SMTP</span>
                <p className="font-bold text-slate-800 truncate">
                  {estado.smtp?.habilitado ? `${estado.smtp.host || 'SMTP'}:${estado.smtp.port}` : 'No configurado'}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Remitente (From)</span>
                <p className="font-bold text-slate-800 truncate" title={estado.smtp?.remitente || ''}>
                  {estado.smtp?.remitente || '—'}
                </p>
              </div>
            </>
          )}

          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Worker de Fondo</span>
            <p className="font-bold text-slate-800">
              {estado.worker?.habilitado ? `Activo (${estado.worker.cron})` : 'Deshabilitado'}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Zona Horaria Servidor</span>
            <p className="font-bold text-slate-800 truncate">
              {estado.timeZone || 'America/Mexico_City'}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}