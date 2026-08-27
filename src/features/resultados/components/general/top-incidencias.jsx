import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercentTrunc } from '@/utils/format';

function IncidenciasList({ title, items = [] }) {
  return (
    <div className="flex-1 rounded-lg border border-app-border bg-white p-4">
      <h4 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 mb-3">
        {title}
      </h4>

      {items.length === 0 ? (
        <p className="py-6 text-center text-xs font-semibold text-slate-400">
          No hay incidencias registradas en esta categoría.
        </p>
      ) : (
        <div className="divide-y divide-app-border">
          {items.map((item) => {
            const preguntaTexto = String(item.pregunta || '').replace(/^se evalúa:\s*/i, '');
            return (
              <div key={item.preguntaId} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-600">
                    {item.seccion}
                  </span>
                  <p className="mt-0.5 text-xs font-bold leading-5 text-slate-800">
                    {preguntaTexto}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-500">
                    {item.areasAfectadas} de {item.areasEvaluadas} áreas
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-500/80"
                        style={{ width: `${Math.min(Number(item.porcentajeAreas ?? 0), 100)}%` }}
                      />
                    </div>
                    <span className="font-black text-slate-900 min-w-[42px] text-right">
                      {formatPercentTrunc(item.porcentajeAreas)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TopIncidencias({ incidenciasPorTipo = {} }) {
  const adminItems = incidenciasPorTipo?.administrativo ?? [];
  const operItems = incidenciasPorTipo?.operativo ?? [];

  return (
    <Card className="border-app-border bg-white shadow-sm">
      <CardHeader className="py-3 border-b border-app-border">
        <CardTitle className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          Preguntas con mayor incidencia
        </CardTitle>
      </CardHeader>
      <CardBody className="p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <IncidenciasList title="ADMINISTRATIVO" items={adminItems} />
          <IncidenciasList title="OPERATIVO" items={operItems} />
        </div>
      </CardBody>
    </Card>
  );
}
