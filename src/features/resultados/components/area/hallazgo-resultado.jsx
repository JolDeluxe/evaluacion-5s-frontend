import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { EvidenciaResultado } from '@/features/resultados/components/area/evidencia-resultado';
import { ImageViewer } from '@/components/ui/image-viewer';

export function HallazgoResultado({ hallazgo }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const evidencias = hallazgo.evidencias ?? [];

  const handleOpenImage = (index) => {
    setActiveImageIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <Card className="border-app-border bg-white shadow-sm">
      <CardBody className="p-4 md:p-5 space-y-3.5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
              {hallazgo.seccion.nombre}
            </p>
            <h3 className="mt-0.5 text-sm font-black text-slate-900 leading-snug">
              {hallazgo.pregunta.texto}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 w-fit text-xs font-semibold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            <span>Respuesta: NO</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            Hallazgo
          </p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-800">
            {hallazgo.hallazgo || 'Hallazgo sin descripción registrada.'}
          </p>
        </div>

        {evidencias.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Evidencias ({evidencias.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {evidencias.map((evidencia, idx) => (
                <EvidenciaResultado
                  key={evidencia.id || idx}
                  evidencia={evidencia}
                  index={idx}
                  onOpen={handleOpenImage}
                />
              ))}
            </div>
          </div>
        )}
      </CardBody>

      <ImageViewer
        open={isViewerOpen}
        images={evidencias}
        activeIndex={activeImageIndex}
        onIndexChange={setActiveImageIndex}
        onClose={() => setIsViewerOpen(false)}
      />
    </Card>
  );
}
