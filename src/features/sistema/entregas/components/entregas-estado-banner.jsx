import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

export function EntregasEstadoBanner({
  estado,
  onAbrirSimulacion,
  onAbrirConexionMicrosoft,
  onRecargar,
  cargando,
}) {
  if (!estado) return null;

  const emailActivo = Boolean(estado.emailEnabled);
  const testActivo = Boolean(estado.emailTestEnabled);
  const esMicrosoft = estado.emailProvider === 'microsoft_graph';
  const microsoft = estado.microsoft || {};
  const msConectado = Boolean(microsoft.conectado);
  const msRequiereReconexion = Boolean(microsoft.requiereReconexion);

  return (
    <Card className="border-white/80 bg-white/85 shadow-sm backdrop-blur-xl">
      <CardBody className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border',
                emailActivo
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-600'
              )}
            >
              <Icon name={esMicrosoft ? 'cloud' : 'alternate_email'} size="md" />
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  Proveedor: {esMicrosoft ? 'Microsoft Outlook (Graph v1.0)' : 'Servidor SMTP'}
                </h2>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider',
                    emailActivo
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full', emailActivo ? 'bg-emerald-600' : 'bg-slate-400')} />
                  {emailActivo ? 'Envíos Automáticos Activos' : 'Envíos Automáticos Pausados'}
                </span>

                {testActivo && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    <Icon name="science" size="xs" /> Pruebas Permitidas
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {emailActivo
                  ? 'El worker está despachando notificaciones automáticas en segundo plano.'
                  : 'Los envíos automáticos están pausados de forma segura (las entregas permanecen en cola pendiente).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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

            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="refresh"
              onClick={onRecargar}
              disabled={cargando}
              className="text-xs font-bold"
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Sub-grid con detalles técnicos */}
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
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Zona Horaria</span>
            <p className="font-bold text-slate-800 truncate">
              {estado.timeZone}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}