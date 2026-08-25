import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getHomeForRole } from '@/config/navigation-config';

function FullPageState({ title, children, action }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app-surface p-5">
      <Card className="w-full max-w-md border-white/70 bg-white/75 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl">
        <CardBody className="space-y-4 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-primario/10 text-marca-primario">
            <Spinner size="sm" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-950">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
          </div>
          {action}
        </CardBody>
      </Card>
    </div>
  );
}

export function RequireAuth() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (auth.status === 'loading') {
    return (
      <FullPageState title="Validando sesión">
        Estamos revisando tu acceso de forma segura.
      </FullPageState>
    );
  }

  if (auth.status === 'unknown') {
    return (
      <FullPageState
        title="Sesión sin confirmar"
        action={(
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => auth.refreshSession()} icon="refresh">
              Reintentar
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                auth.goToLoginManually();
                navigate('/login', { replace: true });
              }}
              icon="login"
            >
              Ir a iniciar sesión
            </Button>
          </div>
        )}
      >
        No pudimos verificar tu sesión con el servidor. Tu sesión no se ha cerrado automáticamente.
      </FullPageState>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireRole({ roles }) {
  const auth = useAuth();

  if (!roles.includes(auth.user?.rol)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') {
    return (
      <FullPageState title="Preparando acceso">
        Estamos cargando tu sesión.
      </FullPageState>
    );
  }

  if (auth.isAuthenticated) {
    const target = location.state?.from?.pathname || getHomeForRole(auth.user?.rol);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
