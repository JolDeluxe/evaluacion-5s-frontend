import { Link, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AUDIT_EXECUTION_ROLES } from '@/config/navigation-config';

export function AuditoriaDetallePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const canExecuteAudit = AUDIT_EXECUTION_ROLES.includes(user?.rol);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Auditoría</p>
        <h1 className="text-3xl font-black text-slate-950">Detalle de auditoría</h1>
      </div>

      <Card className="bg-white/75 backdrop-blur-xl">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            <Icon name="fact_check" className="text-marca-primario" />
            <p className="text-sm font-semibold text-slate-700">Identificador: {id}</p>
          </div>
          <p className="text-sm leading-6 text-slate-600">
            Shell listo para mostrar área, ciclo, estado y evidencias relacionadas.
          </p>
          {canExecuteAudit ? (
            <Button as={Link} to={`/auditorias/${id}/realizar`} icon="edit_square">
              Realizar auditoría
            </Button>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
              Este rol puede consultar el detalle, pero no ejecutar ni finalizar auditorías.
            </p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
