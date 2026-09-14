import { cn } from '@/utils/cn';
import { CanalIcon } from './canal-badge';
import { getCanalConfig } from '../utils/canal-config';

const CANALES = [
  { valor: '', etiqueta: 'Todos los canales' },
  { valor: 'CORREO', etiqueta: 'Correo' },
  { valor: 'PUSH', etiqueta: 'Push' },
  { valor: 'WHATSAPP', etiqueta: 'WhatsApp' },
];

export function EntregasFiltros({ filtros, onCambiarFiltros, resumen, cargando }) {
  const totales = resumen?.totales || {};
  const pendientesCount = (totales.pendientes || 0) + (totales.procesando || 0);
  const fallidasCount = totales.fallidas || 0;

  const ESTADOS = [
    { valor: '', etiqueta: 'Todos los estados' },
    {
      valor: 'PENDIENTE',
      etiqueta: 'En Cola / Próximos',
      badge: pendientesCount > 0 ? pendientesCount : null,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    },
    {
      valor: 'FALLIDA',
      etiqueta: 'Fallidas',
      badge: fallidasCount > 0 ? fallidasCount : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    { valor: 'ENVIADA', etiqueta: 'Enviadas' },
    { valor: 'CANCELADA', etiqueta: 'Canceladas' },
  ];

  return (
    <div className="flex flex-col gap-3 bg-white/70 p-3 rounded-2xl border border-white/80 backdrop-blur-xl">
      {/* Fila 1: Filtro de Estados / Vistas Rápidas */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1.5 shrink-0">
            Vista:
          </span>
          {ESTADOS.map((e) => {
            const activo = (filtros.estado || '') === e.valor;
            return (
              <button
                key={e.valor}
                type="button"
                disabled={cargando}
                onClick={() => onCambiarFiltros({ estado: e.valor })}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border',
                  activo
                    ? 'bg-slate-900 text-white shadow-sm border-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'
                )}
              >
                <span>{e.etiqueta}</span>
                {e.badge !== null && e.badge !== undefined && (
                  <span
                    className={cn(
                      'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-black border leading-none',
                      activo ? 'bg-white/20 text-white border-white/30' : e.badgeColor
                    )}
                  >
                    {e.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fila 2: Filtro por Canal */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 mr-1.5 shrink-0 hidden sm:inline">
          Canal:
        </span>
        {CANALES.map((c) => {
          const activo = filtros.canal === c.valor;
          const esTodos = !c.valor;
          const config = !esTodos ? getCanalConfig(c.valor) : null;

          return (
            <button
              key={c.valor}
              type="button"
              disabled={cargando}
              onClick={() => onCambiarFiltros({ canal: c.valor })}
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border',
                esTodos
                  ? activo
                    ? 'bg-slate-800 text-white shadow-sm border-slate-800'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                  : activo
                    ? config.filterActiveClasses
                    : config.filterInactiveClasses
              )}
            >
              {!esTodos && (
                <CanalIcon
                  canal={c.valor}
                  size="xs"
                  className={activo ? 'text-white' : config.iconClasses}
                />
              )}
              <span>{c.etiqueta}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}