import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function NotificacionesPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Centro</p>
        <h1 className="text-3xl font-black text-slate-950">Notificaciones</h1>
      </div>
      <Card className="border-white/70 bg-white/80 shadow-xl backdrop-blur-2xl rounded-2xl">
        <CardBody className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-marca-primario/10 text-marca-primario border border-marca-primario/20 shadow-inner">
            <Icon name="notifications" size="md" className="text-marca-primario" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-950">Sin novedades pendientes</h3>
            <p className="text-xs font-medium text-slate-600">Estás al día con las notificaciones de auditorías y asignaciones.</p>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
