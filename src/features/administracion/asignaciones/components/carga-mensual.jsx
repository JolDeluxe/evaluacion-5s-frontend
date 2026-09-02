import { Card, CardBody } from '@/components/ui/card';
import { cn } from '@/utils/cn';

export function CargaMensual({ auditores }) {
  if (!auditores.length) return null;

  const ordenados = [...auditores].sort((a, b) => (
    b.areasAsignadas - a.areasAsignadas || a.nombre.localeCompare(b.nombre, 'es-MX')
  ));

  const totalConCarga = auditores.filter((a) => a.areasAsignadas > 0).length;
  const totalSinCarga = auditores.filter((a) => a.areasAsignadas === 0).length;

  return (
    <Card className="overflow-hidden border-app-border bg-white shadow-sm">
      <CardBody className="p-3.5 sm:p-4">
        {/* Header simple */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            Carga de Auditoría ({auditores.length})
          </p>
          <div className="flex items-center gap-3 text-xs font-black">
            <span className="text-emerald-700">{totalConCarga} asignados</span>
            <span className="text-amber-600">{totalSinCarga} sin asignación</span>
          </div>
        </div>

        {/* Grid de todos los auditores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {ordenados.map((auditor) => {
            const initial = auditor.nombre ? auditor.nombre.charAt(0).toUpperCase() : 'U';
            const tieneCarga = auditor.areasAsignadas > 0;

            return (
              <div
                key={auditor.id}
                className={cn(
                  'flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 transition-all',
                  tieneCarga
                    ? 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                    : 'border-amber-200/60 bg-amber-50/40 hover:bg-amber-50/80',
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black',
                      tieneCarga
                        ? 'bg-marca-secundario/15 text-marca-secundario'
                        : 'bg-amber-100 text-amber-700',
                    )}
                  >
                    {initial}
                  </span>
                  <p className="truncate text-xs font-black text-slate-800" title={auditor.nombre}>
                    {auditor.nombre}
                  </p>
                </div>

                {tieneCarga ? (
                  <span className="shrink-0 rounded-lg bg-marca-secundario/10 px-2 py-0.5 text-[11px] font-black text-marca-secundario">
                    {auditor.areasAsignadas} {auditor.areasAsignadas === 1 ? 'área' : 'áreas'}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-lg bg-amber-100/80 px-2 py-0.5 text-[11px] font-black text-amber-700">
                    Sin asignación
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}