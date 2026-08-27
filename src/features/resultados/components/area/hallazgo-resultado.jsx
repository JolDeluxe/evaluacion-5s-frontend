import { Card, CardBody } from '@/components/ui/card';
import { EvidenciaResultado } from '@/features/resultados/components/area/evidencia-resultado';

export function HallazgoResultado({ hallazgo, onOpenImage }) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-marca-acento">
              {hallazgo.seccion.nombre}
            </p>
            <h3 className="mt-1 text-sm font-black leading-5 text-slate-900">
              {hallazgo.pregunta.texto}
            </h3>
          </div>
          <span className="inline-flex w-fit rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
            Respuesta NO
          </span>
        </div>

        <div className="rounded-lg border border-amber-100 bg-amber-50/45 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
            Hallazgo
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
            {hallazgo.hallazgo || 'Hallazgo sin descripción registrada.'}
          </p>
        </div>

        {hallazgo.evidencias?.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              Evidencias
            </p>
            <div className="flex flex-wrap gap-2">
              {hallazgo.evidencias.map((evidencia) => (
                <EvidenciaResultado
                  key={evidencia.id}
                  evidencia={evidencia}
                  onOpen={onOpenImage}
                />
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
