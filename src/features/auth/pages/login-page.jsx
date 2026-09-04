import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { notify } from '@/components/notification/adaptive-notify';
import { getHomeForRole } from '@/config/navigation-config';

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const user = await auth.login({ nombreUsuario, password: contrasena, contrasena });
      notify.success('Sesión iniciada.');
      navigate(location.state?.from?.pathname || getHomeForRole(user?.rol), { replace: true });
    } catch (error) {
      notify.error(error?.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-surface px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,132,115,0.20),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(244,158,72,0.18),transparent_24%),linear-gradient(135deg,#f8fafc,#eef4f1_45%,#fff7ed)]" />
      <section className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="hidden lg:block">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-marca-acento">Cuadra</p>
          <h1 className="mt-4 max-w-xl text-6xl font-black leading-[0.9] tracking-tight text-slate-950">
            Auditorías 5S con seguimiento claro.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-600">
            Ejecución móvil, aprobaciones, evidencias y resultados en una sola experiencia operativa.
          </p>
        </div>

        <Card className="border-white/70 bg-white/70 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl">
          <CardBody className="p-6 sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-primario text-white shadow-lg shadow-marca-primario/20">
                <Icon name="fact_check" fill />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Encuestas 5S</p>
                <h2 className="text-2xl font-black text-slate-950">Iniciar sesión</h2>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="nombreUsuario">Usuario</Label>
                <Input
                  id="nombreUsuario"
                  autoComplete="username"
                  value={nombreUsuario}
                  onChange={(event) => setNombreUsuario(event.target.value)}
                  placeholder="tu.usuario"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrasena">Contraseña</Label>
                <Input
                  id="contrasena"
                  type="password"
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(event) => setContrasena(event.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" icon="login" isLoading={loading}>
                Entrar
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Invitados</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-2">
              <Button as={Link} to="/q" variant="outline" className="w-full font-bold" icon="pin">
                Ingresar código de área
              </Button>
              <Button as={Link} to="/invitado" variant="ghost" className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800" icon="qr_code_scanner">
                Lista de áreas públicas
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
