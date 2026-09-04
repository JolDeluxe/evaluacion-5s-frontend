import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function ForbiddenPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-app-surface p-5 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-marca-primario/10 blur-3xl" />
      <Card className="relative z-10 w-full max-w-md border-white/70 bg-white/80 text-center shadow-2xl backdrop-blur-2xl rounded-3xl">
        <CardBody className="space-y-4 p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/60 shadow-inner">
            <Icon name="lock" size="xl" className="text-rose-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">Sin permiso</h1>
          <p className="text-sm font-medium text-slate-600">Tu rol no tiene acceso a esta sección.</p>
          <Button as={Link} to="/inicio" variant="outline" className="w-full rounded-xl border-white/60 bg-white/70 shadow-sm backdrop-blur-md">
            Volver al inicio
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
