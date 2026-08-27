import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { obtenerResumenEstructura } from '@/features/formularios/helpers/estructura-formulario-helpers';

export function FormularioCard({ formulario }) {
  const resumen = obtenerResumenEstructura(formulario.actual);

  return (
    <Card className="border-white/70 bg-white/75 shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
      <CardBody className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-acento">{formulario.alcance}</p>
            <h2 className="mt-1 text-xl font-black leading-tight text-slate-950">{formulario.nombre}</h2>
            {formulario.descripcion && <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-600">{formulario.descripcion}</p>}
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600">
            {formulario.activo ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-3xl bg-slate-50/80 p-3 text-center">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Preguntas</p>
            <p className="text-lg font-black text-slate-950">{resumen.totalPreguntas}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Secciones</p>
            <p className="text-lg font-black text-slate-950">{resumen.totalSecciones}</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase text-slate-500">Tipo</p>
            <p className="text-lg font-black text-slate-950">{formulario.alcance}</p>
          </div>
        </div>

        <Button as={Link} to={`/admin/formularios/${formulario.id}`} className="w-full" icon="arrow_forward">
          Abrir
        </Button>
      </CardBody>
    </Card>
  );
}
