import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { ImageViewer } from '@/components/ui/image-viewer';
import { ResultadoBadge } from '@/features/resultados/components/shared/resultado-badge';
import { ResultadosEmpty, ResultadosError, ResultadosLoading } from '@/features/resultados/components/shared/resultados-states';
import { HallazgoResultado } from '@/features/resultados/components/area/hallazgo-resultado';
import { useResultadoPeriodo } from '@/features/resultados/hooks/use-resultado-periodo';
import { formatPeriodLabel, getCurrentMonthKey, normalizeMonthKey } from '@/features/resultados/utils/resultados-format';

export function ResultadoPeriodoPage() {
  const { areaId, periodo } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [image, setImage] = useState(null);
  const mes = normalizeMonthKey(searchParams.get('mes'), getCurrentMonthKey());
  const { loading, error, data } = useResultadoPeriodo(areaId, periodo, { mes });

  return (
    <section className="space-y-5">
      <Button
        type="button"
        variant="soft"
        size="sm"
        icon="arrow_back"
        onClick={() => navigate(`/resultados/areas/${areaId}?mes=${mes}`)}
      >
        Área
      </Button>

      {loading ? (
        <ResultadosLoading />
      ) : error ? (
        <ResultadosError message={error} />
      ) : data ? (
        <>
          <Card className="border-slate-900 bg-slate-950 text-white">
            <CardBody className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                    {data.mes.etiqueta}
                  </p>
                  <h1 className="mt-1 text-2xl font-black uppercase leading-tight text-white">
                    {data.area.nombre}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {formatPeriodLabel(data.periodo)}
                  </p>
                </div>
                <ResultadoBadge
                  value={data.resultado.porcentaje}
                  emptyLabel="Pendiente"
                  className="border-white/15 bg-white/10 px-4 py-2 text-lg text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Puntos</p>
                  <p className="mt-1 text-sm font-black text-white">
                    {data.resultado.puntosObtenidos === null
                      ? '-'
                      : `${data.resultado.puntosObtenidos} / ${data.resultado.puntosPosibles}`}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Hallazgos</p>
                  <p className="mt-1 text-sm font-black text-white">{data.resultado.hallazgos}</p>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">Imágenes</p>
                  <p className="mt-1 text-sm font-black text-white">{data.resultado.imagenes}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {!data.resultado.completado ? (
            <ResultadosEmpty title={`${formatPeriodLabel(data.periodo)} pendiente`} description="Este periodo todavía no tiene resultado registrado." />
          ) : data.hallazgos.length === 0 ? (
            <ResultadosEmpty title="Sin hallazgos" description="La auditoría no registró respuestas NO en este periodo." />
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-500">
                Hallazgos
              </h2>
              {data.hallazgos.map((hallazgo) => (
                <HallazgoResultado
                  key={hallazgo.id}
                  hallazgo={hallazgo}
                  onOpenImage={setImage}
                />
              ))}
            </div>
          )}
        </>
      ) : null}

      <ImageViewer
        open={Boolean(image)}
        src={image?.url}
        title={image ? 'Evidencia del hallazgo' : undefined}
        onClose={() => setImage(null)}
      />
    </section>
  );
}
