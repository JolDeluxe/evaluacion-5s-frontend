import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export function NotFoundPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-app-surface p-5 overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-marca-primario/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-marca-acento/10 blur-3xl" />
      <Card className="relative z-10 w-full max-w-md border-white/70 bg-white/80 text-center shadow-2xl backdrop-blur-2xl rounded-3xl">
        <CardBody className="space-y-4 p-8">
          <p className="text-6xl font-black tracking-tight text-marca-primario drop-shadow-sm">404</p>
          <h1 className="text-2xl font-black text-slate-950">Página no encontrada</h1>
          <p className="text-sm font-medium text-slate-600">La ruta que intentas visitar no existe o fue movida.</p>
          <Button as={Link} to="/inicio" variant="outline" className="w-full rounded-xl border-white/60 bg-white/70 shadow-sm backdrop-blur-md">
            Volver al inicio
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
