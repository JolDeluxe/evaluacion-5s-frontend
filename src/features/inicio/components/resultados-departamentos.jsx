import { Link } from 'react-router';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { getResultadoColor } from '@/features/resultados/utils/resultado-colors';

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

  const tieneResultadosAnterior = departamentosCargo.some(
    (dep) => (dep.resultadoAnterior?.porcentaje ?? dep.mesAnterior?.porcentaje) !== null && (dep.resultadoAnterior?.porcentaje ?? dep.mesAnterior?.porcentaje) !== undefined,
  );

  const tieneResultadosActual = departamentosCargo.some(
    (dep) => (dep.resultadoActual?.porcentaje ?? dep.mesActual?.porcentaje) !== null && (dep.resultadoActual?.porcentaje ?? dep.mesActual?.porcentaje) !== undefined,
  );

  const ordenarPorCalificacion = (lista, selectorPorcentaje) => {
    return [...lista].sort((a, b) => {
      const valA = selectorPorcentaje(a);
      const valB = selectorPorcentaje(b);

      const aValido = valA !== null && valA !== undefined;
      const bValido = valB !== null && valB !== undefined;

      // Si uno tiene valor y el otro no, el que tiene valor sube
      if (aValido && !bValido) return -1;
      if (!aValido && bValido) return 1;

      // Si ambos tienen valor, orden descendente (mayor a menor)
      if (aValido && bValido) {
        if (valB !== valA) return valB - valA;
      }

      // Desempate alfabético por nombre de área
      const nombreA = a.nombre || a.area?.nombre || '';
      const nombreB = b.nombre || b.area?.nombre || '';
      return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
    });
  };

  const listaMesAnterior = ordenarPorCalificacion(
    departamentosCargo,
    (dep) => dep.resultadoAnterior?.porcentaje ?? dep.mesAnterior?.porcentaje,
  );

  const listaMesActual = ordenarPorCalificacion(
    departamentosCargo,
    (dep) => dep.resultadoActual?.porcentaje ?? dep.mesActual?.porcentaje,
  );

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

            {!tieneResultadosAnterior ? (
              <div className="py-10 text-center text-sm font-medium text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                No hay resultados del mes anterior.
              </div>
            ) : (
              <div className="space-y-2">
                {listaMesAnterior.map((dep) => {
                  const m = dep.resultadoAnterior ?? dep.mesAnterior;
                  const tieneResultado = m && m.porcentaje !== null && m.porcentaje !== undefined;
                  const rule = tieneResultado ? getResultadoColor(m.porcentaje) : null;
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
                        <span
                          className={`text-xs font-black ${tieneResultado ? '' : 'text-slate-400'}`}
                          style={rule ? { color: rule.textColor } : undefined}
                        >
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
            )}
          </div>

          {/* Columna Mes Actual */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {mesActualEtiqueta}
              </span>
            </div>

            {!tieneResultadosActual ? (
              <div className="py-10 text-center text-sm font-medium text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                Aún no hay resultados registrados en este mes.
              </div>
            ) : (
              <div className="space-y-2">
                {listaMesActual.map((dep) => {
                  const m = dep.resultadoActual ?? dep.mesActual;
                  const tieneResultado = m && m.porcentaje !== null && m.porcentaje !== undefined;
                  const rule = tieneResultado ? getResultadoColor(m.porcentaje) : null;
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
                        <span
                          className={`text-xs font-black ${tieneResultado ? '' : 'text-slate-400'}`}
                          style={rule ? { color: rule.textColor } : undefined}
                        >
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
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
