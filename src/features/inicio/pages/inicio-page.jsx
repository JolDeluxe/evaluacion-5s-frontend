import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { OfflinePendingBadge } from '@/components/ui/offline-pending-badge';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { asignacionesApi } from '@/features/auditorias/shared/api/asignaciones-api';

export function InicioPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ asignadas: 0, pendientes: 0, realizadas: 0 });

  useEffect(() => {
    async function cargar() {
      try {
        const data = await asignacionesApi.listar();
        const asignadas = data.length;
        const pendientes = data.filter(a => a.estado === 'PENDIENTE').length;
        const realizadas = data.filter(a => a.estado === 'COMPLETADA').length;
        setStats({ asignadas, pendientes, realizadas });
      } catch (error) {
        console.error(error);
      }
    }
    cargar();
  }, []);

  const quickStats = [
    { label: 'Asignadas', value: stats.asignadas, icon: 'assignment' },
    { label: 'Pendientes', value: stats.pendientes, icon: 'schedule' },
    { label: 'Realizadas', value: stats.realizadas, icon: 'task_alt' },
  ];

  return (
    <section className="space-y-6">
      <OfflinePendingBadge />

      <div className="rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-2xl lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge status="resuelto" className="bg-marca-primario/10 text-marca-primario shadow-none">
              {user?.rol || 'USUARIO'}
            </Badge>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 lg:text-5xl">
              Hola, {user?.nombre || user?.nombreUsuario || 'bienvenido'}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 lg:text-base">
              Revisa tus auditorías, continúa capturas pendientes y consulta resultados publicados.
            </p>
          </div>
          <Button as={Link} to="/mis-auditorias" icon="play_arrow" className="lg:w-auto">
            Ver auditorías
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="border-white/70 bg-white/75 backdrop-blur-xl">
            <CardBody className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-marca-secundario/10 text-marca-secundario">
                <Icon name={stat.icon} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-950">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
