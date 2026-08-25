import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function ForbiddenPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-app-surface p-5">
      <Card className="max-w-md bg-white/80 text-center backdrop-blur-xl">
        <CardBody className="space-y-4 p-6">
          <Icon name="lock" size="xl" className="mx-auto text-rose-600" />
          <h1 className="text-2xl font-black text-slate-950">Sin permiso</h1>
          <p className="text-sm text-slate-600">Tu rol no tiene acceso a esta sección.</p>
          <Button as={Link} to="/inicio" variant="outline">Volver al inicio</Button>
        </CardBody>
      </Card>
    </main>
  );
}
