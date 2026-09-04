import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export function MisPendientesAuditor({ misPendientesResumen }) {
  const total = misPendientesResumen?.total ?? 0;
  const grupos = misPendientesResumen?.grupos ?? [];

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-0">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <p className="text-[10px] font-black uppercase tracking-wider text-marca-acento">Auditoría personal</p>
        <h2 className="text-lg font-black text-slate-950 uppercase">Mis auditorías pendientes</h2>
      </div>

      <CardBody className="p-3.5 sm:p-5 space-y-4">
        {total === 0 ? (
          <div className="py-6 text-center space-y-1 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-black text-slate-800">¡Todo al día!</p>
            <p className="text-xs font-medium text-slate-500">No tienes auditorías pendientes.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-4.5 rounded-xl border border-amber-200/80 bg-amber-50/50">
            <div className="space-y-2 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-slate-950">{total}</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 uppercase">
                  {total === 1 ? 'auditoría pendiente' : 'auditorías pendientes'}
                </span>
              </div>

              {grupos.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
                  {grupos.map((g) => {
                    const esAtrasada = g.estadoSemantico === 'ATRASADA';
                    return (
                      <span
                        key={`${g.anio}-${g.mesNombre}-${g.periodo}`}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-black shadow-2xs ${
                          esAtrasada
                            ? 'border-rose-200 bg-rose-50/90 text-rose-800'
                            : 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
                        }`}
                      >
                        <span>
                          {g.conteo} · {g.mesNombre} P{g.periodo} · {esAtrasada ? 'ATRASADAS' : 'ACTIVAS'}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              as={Link}
              to="/mis-auditorias"
              variant="default"
              size="sm"
              icon="arrow_forward"
              className="w-full sm:w-auto shrink-0 justify-center"
            >
              Ir a mis auditorías
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
