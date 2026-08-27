import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { QrCode } from '@/components/ui/qr-code';
import { Spinner } from '@/components/ui/spinner';
import { notify } from '@/components/notification/adaptive-notify';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { auditoriasApi } from '@/features/auditorias/api/auditorias-api';
import { FormularioDinamico } from '@/features/auditorias/components/formulario-dinamico';
import { normalizarContextoAuditoria } from '@/features/auditorias/components/formulario-dinamico.helpers';
import { buildPublicAppUrl, copyToClipboard } from '@/utils/share-url';

function MobileRequired({ contexto, publicPath, qrLabel = 'Escanea para continuar en tu celular' }) {
  const enlace = buildPublicAppUrl(publicPath);

  const copiar = async () => {
    if (!enlace) return;
    await copyToClipboard(enlace);
    notify.success('Enlace copiado.');
  };

  return (
    <section className="flex min-h-dvh items-center justify-center bg-app-surface p-6">
      <Card className="max-w-xl border-amber-200 bg-amber-50/85 shadow-xl shadow-amber-950/5">
        <CardBody className="space-y-5 p-8 text-center">
          <Button as={Link} to="/mis-auditorias" variant="ghost" icon="arrow_back" className="mx-auto hover:translate-y-0 hover:shadow-none">
            Volver a mis auditorías
          </Button>
          <Icon name="smartphone" size="xl" className="mx-auto text-amber-700" />
          <h1 className="text-2xl font-black text-amber-950">Captura movil requerida</h1>
          <p className="text-sm font-semibold leading-6 text-amber-900">
            Esta auditoria esta disenada para realizarse desde celular o tablet.
          </p>
          {contexto?.area?.nombre && (
            <p className="rounded-2xl bg-white/60 px-4 py-3 text-sm font-black text-amber-950">
              {contexto.area.nombre}
            </p>
          )}

          {enlace ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/70 p-4">
              <QrCode value={enlace} label={qrLabel} />
              <p className="text-sm font-black text-slate-800">{qrLabel}</p>
              <Button type="button" variant="outline" icon="content_copy" onClick={copiar}>
                Copiar enlace
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-white/70 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
              Configura <span className="font-black">VITE_PUBLIC_APP_URL</span> con una URL publica para generar el QR. No se usa localhost para compartir.
            </div>
          )}
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
          <h1 className="text-2xl font-black text-slate-950">No se pudo cargar la auditoria</h1>
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
  const [state, setState] = useState({ status: 'loading', contexto: null, error: null });

  const cargar = useCallback(async () => {
    setState((actual) => ({ ...actual, status: 'loading', error: null }));
    try {
      const datos = modo === 'invitado'
        ? await auditoriasApi.obtenerContextoInvitado(token)
        : await auditoriasApi.obtenerContextoAsignacion(params.id);
      setState({
        status: 'ready',
        contexto: normalizarContextoAuditoria(datos, modo),
        error: null,
      });
    } catch (error) {
      setState({
        status: 'error',
        contexto: null,
        error: error?.isNetworkError
          ? 'No hay conexion con el servidor. Revisa la red y reintenta.'
          : error?.message || 'La auditoria no esta disponible.',
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

  if (state.status === 'error') {
    return <ErrorState error={state.error} onRetry={cargar} onBack={() => navigate(modo === 'invitado' ? '/invitado' : '/mis-auditorias')} />;
  }

  if (isDesktop) {
    const publicPath = modo === 'invitado' ? `/invitado/${token}` : `/auditorias/${params.id}/realizar`;
    return (
      <MobileRequired
        contexto={state.contexto}
        publicPath={publicPath}
        qrLabel={modo === 'invitado' ? 'Escanea para abrir la invitación en tu celular' : 'Escanea para continuar en tu celular'}
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
