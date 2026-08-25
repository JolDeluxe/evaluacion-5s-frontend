import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { auditoriasApi } from '@/features/auditorias/api/auditorias-api';
import { FormularioDinamico } from '@/features/auditorias/components/formulario-dinamico';
import { normalizarContextoAuditoria } from '@/features/auditorias/components/formulario-dinamico.helpers';

function MobileRequired({ contexto }) {
  return (
    <section className="flex min-h-dvh items-center justify-center bg-app-surface p-6">
      <Card className="max-w-xl border-amber-200 bg-amber-50/85 shadow-xl shadow-amber-950/5">
        <CardBody className="space-y-4 p-8 text-center">
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

export function RealizarAuditoriaPage({ modo = 'autenticado', token: tokenProp }) {
  const params = useParams();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
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

  if (isDesktop) return <MobileRequired contexto={state.contexto} />;

  return (
    <main className="min-h-dvh bg-app-surface px-4 py-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/70 p-4 shadow-lg shadow-slate-950/5 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">
                {state.contexto.area?.tipo ?? '5S'}
              </p>
              <h1 className="truncate text-xl font-black text-slate-950">{state.contexto.area?.nombre ?? 'Auditoria 5S'}</h1>
              <p className="mt-1 truncate text-xs font-bold text-slate-500">
                {state.contexto.versionFormulario?.formulario?.nombre ?? 'Formulario'}
              </p>
            </div>
            <Button variant="ghost" size="sm" icon="close" onClick={() => navigate(modo === 'invitado' ? '/invitado' : '/mis-auditorias')}>
              Salir
            </Button>
          </div>
        </header>

        <FormularioDinamico contexto={state.contexto} modo={modo} token={token} currentUser={user} />
      </div>
    </main>
  );
}
