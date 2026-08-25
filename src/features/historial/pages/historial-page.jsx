import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function HistorialPage() {
  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Auditorías</p>
        <h1 className="text-3xl font-black text-slate-950">Historial</h1>
      </div>
      <Card className="bg-white/75 backdrop-blur-xl">
        <CardBody className="flex items-center gap-4">
          <Icon name="history" className="text-marca-primario" />
          <p className="text-sm text-slate-600">Consulta histórica preparada para auditorías completadas.</p>
        </CardBody>
      </Card>
    </section>
  );
}
