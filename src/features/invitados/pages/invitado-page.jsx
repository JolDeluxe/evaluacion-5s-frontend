import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function InvitadoPage() {
  const { token } = useParams();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-app-surface p-5">
      <Card className="w-full max-w-lg bg-white/80 backdrop-blur-xl">
        <CardBody className="space-y-5 p-6 text-center">
          <Icon name="link" size="xl" className="mx-auto text-marca-primario" />
          <div>
            <h1 className="text-2xl font-black text-slate-950">Acceso invitado</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enlace listo para validar token y permisos temporales.
            </p>
          </div>
          <Button as={Link} to={`/invitado/${token}/auditoria`} icon="arrow_forward">
            Continuar
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
