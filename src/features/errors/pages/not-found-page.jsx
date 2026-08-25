import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-app-surface p-5">
      <Card className="max-w-md bg-white/80 text-center backdrop-blur-xl">
        <CardBody className="space-y-4 p-6">
          <p className="text-6xl font-black text-marca-primario">404</p>
          <h1 className="text-2xl font-black text-slate-950">Ruta no encontrada</h1>
          <Button as={Link} to="/inicio" variant="outline">Volver al inicio</Button>
        </CardBody>
      </Card>
    </main>
  );
}
