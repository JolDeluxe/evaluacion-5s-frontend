import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { obtenerResumenEstructura } from '@/features/administracion/formularios/helpers/estructura-formulario-helpers';

function formatearFecha(fecha) {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function FormularioCard({ formulario }) {
  const resumen = obtenerResumenEstructura(formulario.actual);

  return (
    <Card className="border-white/70 bg-white/75 shadow-xl shadow-slate-950/5 backdrop-blur-2xl">
      <CardBody className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-acento">{formulario.alcance}</p>
            <h2 className="mt-1 text-xl font-black leading-tight text-slate-950">{formulario.nombre}</h2>
            {formulario.descripcion && <p className="mt-1.5 line-clamp-2 text-xs font-semibold text-slate-600">{formulario.descripcion}</p>}
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase ${formulario.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
            {formulario.activo ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50/90 p-3 text-center border border-slate-100">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estructura</p>
            <p className="text-sm font-black text-slate-900">{resumen.totalPreguntas} preguntas · {resumen.totalSecciones} secciones</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actualizado</p>
            <p className="text-sm font-black text-slate-900">{formatearFecha(formulario.actual?.actualizadoEn || formulario.actualizadoEn)}</p>
          </div>
        </div>

        <Button as={Link} to={`/admin/formularios/${formulario.id}`} className="w-full" icon="arrow_forward">
          Ver detalles
        </Button>
      </CardBody>
    </Card>
  );
}
