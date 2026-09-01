import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CargaMensualModal } from '@/features/administracion/asignaciones/components/carga-mensual-modal';

export function CargaMensual({ auditores, anio, mes }) {
  const [showModal, setShowModal] = useState(false);

  if (!auditores.length) return null;

  const conCarga = auditores
    .filter((a) => a.areasAsignadas > 0)
    .sort((a, b) => b.areasAsignadas - a.areasAsignadas || a.nombre.localeCompare(b.nombre, 'es-MX'));

  const sinCarga = auditores.filter((a) => a.areasAsignadas === 0);

  const totalConCarga = conCarga.length;
  const totalSinCarga = sinCarga.length;

  const top5 = conCarga.slice(0, 5);
  const tieneMas = auditores.length > 5;

  const textoConCarga = `${totalConCarga} ${totalConCarga === 1 ? 'con asignaciones' : 'con asignaciones'}`;
  const textoSinCarga = `${totalSinCarga} sin asignaciones`;

  return (
    <>
      <Card className="overflow-hidden border-app-border bg-white shadow-sm">
        <CardBody className="p-4">
          {/* Encabezado */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Carga del mes</p>
            <p className="text-xs font-semibold text-slate-500">
              <span className="font-bold text-slate-700">{textoConCarga}</span>
              {totalSinCarga > 0 && <span className="ml-1 text-slate-400">· {textoSinCarga}</span>}
            </p>
          </div>

          {/* Top 5 Auditores */}
          {top5.length > 0 ? (
            <div className="divide-y divide-app-border rounded-xl border border-app-border bg-slate-50/50">
              {top5.map((auditor) => (
                <div key={auditor.id} className="flex items-center justify-between px-3.5 py-2.5 transition hover:bg-white">
                  <p className="truncate text-xs md:text-sm font-bold text-slate-900" title={auditor.nombre}>
                    {auditor.nombre}
                  </p>
                  <span className="ml-3 shrink-0 rounded-md bg-marca-secundario/10 px-2.5 py-0.5 text-xs font-bold text-marca-secundario">
                    {auditor.areasAsignadas} {auditor.areasAsignadas === 1 ? 'área' : 'áreas'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-3 text-center text-xs font-semibold text-slate-500">Ningún auditor tiene áreas asignadas este mes.</p>
          )}

          {/* Ver todos */}
          {tieneMas && (
            <div className="mt-3 flex justify-end">
              <Button type="button" variant="ghost" size="sm" icon="groups" onClick={() => setShowModal(true)}>
                Ver todos los auditores ({auditores.length})
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {showModal && (
        <CargaMensualModal
          auditores={auditores}
          anio={anio}
          mes={mes}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}