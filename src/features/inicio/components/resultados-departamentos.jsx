import { Link } from 'react-router';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

const formatPct = (value) => {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)}%`;
};

export function ResultadosDepartamentos({ departamentosCargo = [] }) {
  if (!departamentosCargo || departamentosCargo.length === 0) {
    return null;
  }

  const mesAnteriorEtiqueta = departamentosCargo[0]?.mesAnterior?.etiqueta ?? 'Mes Anterior';
  const mesActualEtiqueta = departamentosCargo[0]?.mesActual?.etiqueta ?? 'Mes Actual';

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-0">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">Responsabilidad</p>
        <h2 className="text-base font-black text-slate-950 uppercase">Departamentos a tu cargo</h2>
      </div>

      <CardBody className="p-4 sm:p-5">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Columna Mes Anterior */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {mesAnteriorEtiqueta}
              </span>
            </div>

            <div className="space-y-2">
              {departamentosCargo.map((dep) => {
                const m = dep.mesAnterior;
                const tieneResultado = m && m.porcentaje !== null;
                return (
                  <div
                    key={`prev-${dep.areaId}`}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      tieneResultado
                        ? 'border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/90'
                        : 'border-slate-100 bg-slate-50/40'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className={`text-xs font-black uppercase truncate ${tieneResultado ? 'text-slate-900' : 'text-slate-400'}`}>
                        {dep.nombre}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-black ${tieneResultado ? 'text-slate-950' : 'text-slate-400'}`}>
                        {formatPct(m?.porcentaje)}
                      </span>

                      {tieneResultado ? (
                        <Link
                          to={`/resultados/areas/${dep.areaId}?mes=${m.clave}`}
                          state={{ from: '/inicio', fromLabel: 'Inicio' }}
                          className="text-slate-400 hover:text-slate-900 transition p-0.5"
                          title={`Ver resultado de ${dep.nombre} (${m.etiqueta})`}
                        >
                          <Icon name="chevron_right" />
                        </Link>
                      ) : (
                        <span className="w-5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Mes Actual */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {mesActualEtiqueta}
              </span>
            </div>

            <div className="space-y-2">
              {departamentosCargo.map((dep) => {
                const m = dep.mesActual;
                const tieneResultado = m && m.porcentaje !== null;
                return (
                  <div
                    key={`curr-${dep.areaId}`}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      tieneResultado
                        ? 'border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/90'
                        : 'border-slate-100 bg-slate-50/40 opacity-70'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <p className={`text-xs font-black uppercase truncate ${tieneResultado ? 'text-slate-900' : 'text-slate-400'}`}>
                        {dep.nombre}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-black ${tieneResultado ? 'text-slate-950' : 'text-slate-400'}`}>
                        {formatPct(m?.porcentaje)}
                      </span>

                      {tieneResultado ? (
                        <Link
                          to={`/resultados/areas/${dep.areaId}?mes=${m.clave}`}
                          state={{ from: '/inicio', fromLabel: 'Inicio' }}
                          className="text-slate-400 hover:text-slate-900 transition p-0.5"
                          title={`Ver resultado de ${dep.nombre} (${m.etiqueta})`}
                        >
                          <Icon name="chevron_right" />
                        </Link>
                      ) : (
                        <span className="w-5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
