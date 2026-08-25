import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function NotificacionesPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Centro</p>
        <h1 className="text-3xl font-black text-slate-950">Notificaciones</h1>
      </div>
      <Card className="bg-white/75 backdrop-blur-xl">
        <CardBody className="flex items-center gap-4">
          <Icon name="notifications" className="text-marca-primario" />
          <p className="text-sm text-slate-600">Lista lista para conectarse a las notificaciones del backend.</p>
        </CardBody>
      </Card>
    </section>
  );
}
