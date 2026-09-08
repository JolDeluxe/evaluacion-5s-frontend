import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export function EntregasResumenCards({ resumen }) {
  if (!resumen) return null;

  const { totales, actividad } = resumen;

  const items = [
    {
      titulo: 'Total Entregas',
      valor: totales.total,
      subtitulo: `${totales.canceladas} canceladas`,
      icono: 'all_inbox',
      colorIcono: 'text-slate-700 bg-slate-100',
    },
    {
      titulo: 'Enviadas',
      valor: totales.enviadas,
      subtitulo: `${actividad.enviadasUltimas24h} en las últimas 24h`,
      icono: 'check_circle',
      colorIcono: 'text-emerald-700 bg-emerald-100',
    },
    {
      titulo: 'Pendientes',
      valor: totales.pendientes + totales.procesando,
      subtitulo: totales.procesando > 0 ? `${totales.procesando} en proceso` : 'En cola de envío',
      icono: 'schedule',
      colorIcono: 'text-sky-700 bg-sky-100',
    },
    {
      titulo: 'Fallidas',
      valor: totales.fallidas,
      subtitulo: totales.fallidas > 0 ? 'Requieren revisión/reintento' : 'Sin fallos pendientes',
      icono: 'error',
      colorIcono: totales.fallidas > 0 ? 'text-rose-700 bg-rose-100' : 'text-slate-500 bg-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {items.map((item) => (
        <Card key={item.titulo} className="border-white/80 bg-white/80 shadow-sm backdrop-blur-xl">
          <CardBody className="p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 truncate block">
                {item.titulo}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {item.valor}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 truncate">
                {item.subtitulo}
              </p>
            </div>

            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.colorIcono}`}>
              <Icon name={item.icono} size="md" />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}