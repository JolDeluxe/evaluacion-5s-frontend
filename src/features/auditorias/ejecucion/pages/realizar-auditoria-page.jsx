import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { QrCode } from '@/components/ui/qr-code';
import { Spinner } from '@/components/ui/spinner';
import { notify } from '@/components/notification/adaptive-notify';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { CompartirAuditoriaModal } from '@/features/auditorias/shared/components/compartir-auditoria-modal';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { auditoriasApi } from '@/features/auditorias/ejecucion/api/auditorias-api';
import { FormularioDinamico } from '@/features/auditorias/ejecucion/components/formulario-dinamico';
import { normalizarContextoAuditoria } from '@/features/auditorias/ejecucion/components/formulario-dinamico.helpers';
import { buildPublicAppUrl, copyToClipboard } from '@/utils/share-url';

function MobileRequired({
  contexto,
  publicPath,
  qrLabel = 'Escanea para continuar esta auditoría en tu celular',
  canShareWithOther = false,
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const enlace = buildPublicAppUrl(publicPath);

  const asignacionCompartir =
    useMemo(() => {
      if (!contexto?.asignacion) {
        return null;
      }

      return {
        ...contexto.asignacion,
        objetivoAuditoria:
          contexto.asignacion.objetivoAuditoria ??
          contexto.objetivo,
        objetivo: contexto.objetivo,
        area: contexto.area,
        ciclo: contexto.ciclo,
      };
    }, [contexto]);

  const showShareWithOther =
    canShareWithOther &&
    Boolean(asignacionCompartir?.id);

  const copiar = async () => {
    if (!enlace) return;
    await copyToClipboard(enlace);
    notify.success('Enlace al celular copiado.');
  };

  return (
    <section className="flex min-h-dvh items-center justify-center bg-app-surface p-6">
      <Card className="w-full max-w-xl border-white/80 bg-white/80 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
        <CardBody className="space-y-6 p-8 text-center">
          <div className="space-y-3">
            <Button as={Link} to="/mis-auditorias" variant="ghost" icon="arrow_back" className="mx-auto hover:translate-y-0 hover:shadow-none">
              Volver a mis auditorías
            </Button>

            <Icon name="smartphone" size="xl" className="mx-auto text-slate-700" />

            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-marca-acento">
                Captura móvil requerida
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-950">
                Continuar en tu celular
              </h1>
            </div>

            <p className="text-sm font-semibold leading-6 text-slate-600">
              Esta auditoría está diseñada para realizarse desde celular o tablet.
            </p>

            {contexto?.area?.nombre && (
              <p className="rounded-2xl bg-slate-100/80 px-4 py-3 text-sm font-black uppercase text-slate-900">
                {contexto.area.nombre}
              </p>
            )}
          </div>

          {enlace ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-100 bg-white/75 p-4 shadow-sm">
              <QrCode value={enlace} label={qrLabel} />

              <div>
                <p className="text-sm font-black text-slate-800">
                  {qrLabel}
                </p>

                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  Este acceso es para continuar tú mismo con tu sesión.
                </p>
              </div>

              <Button type="button" variant="outline" icon="content_copy" onClick={copiar}>
                Copiar enlace al celular
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-bold leading-6 text-slate-700">
              Configura <span className="font-black">VITE_PUBLIC_APP_URL</span> con una URL pública para generar el QR. No se usa localhost para continuar en celular.
            </div>
          )}

          {showShareWithOther && (
            <div className="space-y-3 border-t border-slate-200/80 pt-5">
              <p className="text-sm font-black text-slate-800">
                ¿Otra persona realizará la auditoría?
              </p>

              <Button
                type="button"
                variant="ghost"
                icon="share"
                className="mx-auto text-slate-600 hover:translate-y-0 hover:bg-slate-100 hover:text-slate-900 hover:shadow-none"
                onClick={() => setIsShareOpen(true)}
              >
                Compartir con otra persona
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <CompartirAuditoriaModal
        asignacion={asignacionCompartir}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </section>
  );
}

function BloqueoPeriodoAnteriorState({ periodoAnteriorData, onBack, onNavigateAnterior }) {
  const { areaNombre, mesEtiqueta, periodo, asignacionId, totalPendientes = 1, pendientes = [], periodoAnterior } = periodoAnteriorData || {};
  const etiqueta = periodoAnterior?.etiqueta || mesEtiqueta || 'Periodo anterior';
  const numPeriodo = periodoAnterior?.periodo || periodo || 1;
  const periodoTexto = numPeriodo === 1 ? '1er Periodo' : numPeriodo === 2 ? '2do Periodo' : `Periodo ${numPeriodo}`;

  const listaPendientes = pendientes.length > 0
    ? pendientes
    : (areaNombre ? [{ asignacionId, areaNombre, estado: 'PENDIENTE' }] : []);

  return (
    <section className="flex min-h-dvh items-center justify-center bg-app-surface p-6">
      <Card className="w-full max-w-lg border-white/80 bg-white/80 shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
        <CardBody className="space-y-6 p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-600 border border-amber-200/60 shadow-sm">
            <Icon name="lock" size="xl" />
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
              AUDITORÍAS PENDIENTES DEL PERIODO ANTERIOR
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-slate-950">
              Primero termina tus auditorías del periodo anterior
            </h1>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-600">
              {totalPendientes === 1
                ? 'Tienes 1 auditoría pendiente del periodo anterior que debes terminar antes de iniciar las del periodo actual.'
                : `Tienes ${totalPendientes} auditorías pendientes del periodo anterior (${etiqueta} · ${periodoTexto}) que debes terminar antes de iniciar las del periodo actual.`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-left space-y-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200/60 pb-2">
              {etiqueta} · {periodoTexto} ({totalPendientes} pendiente{totalPendientes !== 1 ? 's' : ''})
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {listaPendientes.map((item, idx) => (
                <div key={item.asignacionId || idx} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-black uppercase text-slate-900 truncate">
                    {item.areaNombre}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                    item.estado === 'ATRASADA'
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {item.estado === 'ATRASADA' ? 'ATRASADA' : 'PENDIENTE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              className="w-full sm:w-auto"
              icon="arrow_back"
              onClick={onBack}
            >
              Ir a mis auditorías
            </Button>
            {asignacionId && (
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto text-slate-600"
                icon="arrow_forward"
                onClick={() => onNavigateAnterior(asignacionId)}
              >
                Ir a la auditoría pendiente
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </section>
  );
}

function ErrorState({ error, onRetry, onBack }) {
  return (
    <section className="flex min-h-dvh items-center justify-center bg-app-surface p-6">
      <Card className="w-full max-w-lg border-white/70 bg-white/80 shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
        <CardBody className="space-y-4 p-6 text-center">
          <Icon name="error" size="xl" className="mx-auto text-red-600" />
          <h1 className="text-2xl font-black text-slate-950">No se pudo cargar la auditoría</h1>
          <p className="text-sm font-semibold leading-6 text-slate-600">{error}</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" icon="arrow_back" onClick={onBack}>Volver</Button>
            <Button icon="refresh" onClick={onRetry}>Reintentar</Button>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}

export function RealizarAuditoriaPage({ modo = 'autenticado', token: tokenProp, nombreInvitado }) {
  const params = useParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const auth = useAuth();
  const { user } = auth;
  const token = tokenProp ?? params.token;
  const [state, setState] = useState({ status: 'loading', contexto: null, error: null, periodoAnteriorData: null });

  const cargar = useCallback(async () => {
    setState((actual) => ({ ...actual, status: 'loading', error: null, periodoAnteriorData: null }));
    try {
      const datos = modo === 'invitado'
        ? await auditoriasApi.obtenerContextoInvitado(token)
        : await auditoriasApi.obtenerContextoAsignacion(params.id);
      setState({
        status: 'ready',
        contexto: normalizarContextoAuditoria(datos, modo),
        error: null,
        periodoAnteriorData: null,
      });
    } catch (error) {
      if (error?.codigo === 'PERIODO_ANTERIOR_PENDIENTE' || error?.codigo === 'AUDITORIAS_PERIODO_ANTERIOR_PENDIENTES') {
        const errData = error.data?.error || {};
        const periodoAnteriorInfo = errData.periodoAnterior || errData;
        const totalPendientes = errData.totalPendientes || (Array.isArray(errData.pendientes) ? errData.pendientes.length : 1);
        const pendientes = errData.pendientes || [];

        setState({
          status: 'bloqueado_periodo_anterior',
          contexto: null,
          error: error.message,
          periodoAnteriorData: {
            ...periodoAnteriorInfo,
            totalPendientes,
            pendientes,
            asignacionId: errData.asignacionId || periodoAnteriorInfo.asignacionId || pendientes[0]?.asignacionId || null,
          },
        });
        return;
      }

      setState({
        status: 'error',
        contexto: null,
        error: error?.isNetworkError
          ? 'No hay conexión con el servidor. Revisa la red y reintenta.'
          : error?.message || 'La auditoría no está disponible.',
        periodoAnterior: null,
      });
    }
  }, [modo, params.id, token]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (modo !== 'invitado') return;
    if (auth.status === 'loading') return;
    if (!user && !nombreInvitado) navigate(`/invitado/${token}`, { replace: true });
  }, [auth.status, modo, navigate, nombreInvitado, token, user]);

  if (state.status === 'loading') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-app-surface">
        <Spinner label="Cargando auditoria..." />
      </main>
    );
  }

  if (state.status === 'bloqueado_periodo_anterior') {
    return (
      <BloqueoPeriodoAnteriorState
        periodoAnteriorData={state.periodoAnteriorData}
        onBack={() => navigate(modo === 'invitado' ? '/invitado' : '/mis-auditorias')}
        onNavigateAnterior={(asigId) => navigate(`/auditorias/${asigId}/realizar`)}
      />
    );
  }

  if (state.status === 'error') {
    return <ErrorState error={state.error} onRetry={cargar} onBack={() => navigate(modo === 'invitado' ? '/invitado' : '/mis-auditorias')} />;
  }

  if (isDesktop) {
    const publicPath = modo === 'invitado' ? `/invitado/${token}` : `/auditorias/${params.id}/realizar`;
    return (
      <MobileRequired
        contexto={state.contexto}
        publicPath={publicPath}
        qrLabel={modo === 'invitado' ? 'Escanea para abrir la invitación en tu celular' : 'Escanea para continuar esta auditoría en tu celular'}
        canShareWithOther={modo !== 'invitado'}
      />
    );
  }

  const handleExit = () => {
    navigate(modo === 'invitado' ? '/invitado' : '/mis-auditorias');
  };

  return (
    <main className="min-h-dvh bg-app-surface px-4">
      <FormularioDinamico
        contexto={state.contexto}
        modo={modo}
        token={token}
        currentUser={user}
        nombreInvitado={nombreInvitado}
        onExit={handleExit}
      />
    </main>
  );
}
