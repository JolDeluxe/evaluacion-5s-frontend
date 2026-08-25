import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FormularioDinamico } from '@/features/auditorias/components/formulario-dinamico';

const widths = [375, 390, 430];

export function FormularioPreviewModal({ version, onClose }) {
  const [width, setWidth] = useState(390);
  if (!version) return null;

  const contexto = {
    area: { nombre: version.formulario?.nombre ?? 'Vista previa', tipo: version.formulario?.alcance ?? '5S', verificacionQrActiva: false },
    objetivo: null,
    asignacion: null,
    ciclo: null,
    versionFormulario: version,
    nombreAuditor: 'Vista previa',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-2xl shadow-slate-950/15 backdrop-blur-2xl">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-acento">Vista previa</p>
            <h2 className="text-xl font-black text-slate-950">{version.formulario?.nombre} · V{version.numeroVersion}</h2>
          </div>
          <div className="flex items-center gap-2">
            {widths.map((item) => (
              <Button key={item} variant={width === item ? 'primario' : 'ghost'} size="sm" onClick={() => setWidth(item)}>
                {item}
              </Button>
            ))}
            <button
              type="button"
              aria-label="Cerrar vista previa"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className="mx-auto rounded-[2rem] border border-slate-300 bg-slate-900/10 p-2 shadow-2xl shadow-slate-950/25" style={{ width: width + 18 }}>
          <div className="max-h-[82vh] overflow-y-auto rounded-[1.5rem] bg-app-surface custom-scrollbar" style={{ width }}>
            <FormularioDinamico contexto={contexto} modo="preview" preview />
          </div>
        </div>
      </div>
    </div>
  );
}
