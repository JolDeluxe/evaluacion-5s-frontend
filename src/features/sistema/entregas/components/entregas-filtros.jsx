import { cn } from '@/utils/cn';
import { CanalIcon } from './canal-badge';
import { getCanalConfig } from '../utils/canal-config';

const CANALES = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'CORREO', etiqueta: 'Correo' },
  { valor: 'PUSH', etiqueta: 'Push' },
  { valor: 'WHATSAPP', etiqueta: 'WhatsApp' },
];

const ESTADOS = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'ENVIADA', etiqueta: 'Enviadas' },
  { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
  { valor: 'FALLIDA', etiqueta: 'Fallidas' },
  { valor: 'CANCELADA', etiqueta: 'Canceladas' },
];

export function EntregasFiltros({ filtros, onCambiarFiltros, cargando }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-white/80 backdrop-blur-xl">
      {/* Canales (Tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border',
                esTodos
                  ? activo
                    ? 'bg-slate-900 text-white shadow-sm border-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent'
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

      {/* Estados (Select / Pills) */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 shrink-0">
          Estado:
        </span>
        <select
          value={filtros.estado || ''}
          disabled={cargando}
          onChange={(e) => onCambiarFiltros({ estado: e.target.value })}
          className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        >
          {ESTADOS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}