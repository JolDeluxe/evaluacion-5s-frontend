import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AUDIT_EXECUTION_ROLES } from '@/config/navigation-config';

export function MisAuditoriasPage() {
  const { user } = useAuth();
  const canExecuteAudit = AUDIT_EXECUTION_ROLES.includes(user?.rol);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Auditorías</p>
        <h1 className="text-3xl font-black text-slate-950">
          {canExecuteAudit ? 'Mis auditorías' : 'Supervisión de auditorías'}
        </h1>
      </div>

      <Card className="border-dashed border-slate-300 bg-white/70 backdrop-blur-xl">
        <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-marca-primario/10 text-marca-primario">
            <Icon name="assignment" size="lg" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Sin auditorías cargadas en la vista</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Esta pantalla ya está lista para recibir la lista de asignaciones desde el backend.
            </p>
          </div>
          {canExecuteAudit ? (
            <Button as={Link} to="/auditorias/demo/realizar" variant="outline" icon="smartphone">
              Ver shell móvil
            </Button>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-white/70 px-4 py-3 text-sm font-bold text-slate-600">
              SUPER_ADMIN puede consultar y supervisar, pero no ejecutar capturas.
            </p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
