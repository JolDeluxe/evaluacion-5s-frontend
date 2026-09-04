import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function ResumenTarjetasMes({ resumen, esAdmin, etiquetaMesControl }) {
  if (!resumen) return null;

  const statsAdmin = [
    { label: 'Asignadas', value: resumen.asignadas, icon: 'assignment', color: 'text-blue-600 bg-blue-50' },
    { label: 'Pendientes', value: resumen.pendientes, icon: 'schedule', color: 'text-amber-600 bg-amber-50' },
    { label: 'Realizadas', value: resumen.realizadas, icon: 'task_alt', color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Sin auditor', value: resumen.sinAuditor, icon: 'person_off', color: 'text-rose-600 bg-rose-50' },
  ];

  const statsAuditor = [
    { label: 'Asignadas', value: resumen.asignadas, icon: 'assignment', color: 'text-blue-600 bg-blue-50' },
    { label: 'Pendientes', value: resumen.pendientes, icon: 'schedule', color: 'text-amber-600 bg-amber-50' },
    { label: 'Realizadas', value: resumen.realizadas, icon: 'task_alt', color: 'text-emerald-600 bg-emerald-50' },
  ];

  const stats = esAdmin ? statsAdmin : statsAuditor;
  const gridColsClass = esAdmin ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3';

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Auditorías de {etiquetaMesControl}
        </h2>

        {esAdmin && (
          <Button
            as={Link}
            to="/admin/asignaciones"
            variant="outline"
            size="sm"
            icon="tune"
            className="self-start sm:self-auto shrink-0"
          >
            Gestionar asignaciones
          </Button>
        )}
      </div>

      <div className={`grid gap-3.5 ${gridColsClass}`}>
        {stats.map((stat) => (
          <Card key={stat.label} className="border-slate-200/80 bg-white shadow-sm">
            <CardBody className="p-4 flex items-center gap-3.5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${stat.color}`}>
                <Icon name={stat.icon} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-slate-950 leading-tight">{stat.value}</p>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate">{stat.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
