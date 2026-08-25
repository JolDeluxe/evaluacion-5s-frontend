import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export function ResumenAuditoria({ secciones, respuestas, onGoToQuestion, onSubmit, isSubmitting, error }) {
  const totalHallazgos = Object.values(respuestas).filter((respuesta) => respuesta.hallazgo?.trim()).length;
  const totalEvidencias = Object.values(respuestas).reduce((total, respuesta) => total + (respuesta.evidencias?.length ?? 0), 0);

  return (
    <section className="space-y-5 rounded-[2rem] border border-white/75 bg-white/75 p-5 shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">Revision</p>
        <h1 className="mt-2 text-3xl font-black leading-none text-slate-950">Revisar auditoria</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Confirma que todas las secciones esten completas antes de enviar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white/70 p-4 text-center shadow-inner shadow-slate-950/5">
          <p className="text-2xl font-black text-slate-950">{totalHallazgos}</p>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Hallazgos</p>
        </div>
        <div className="rounded-3xl bg-white/70 p-4 text-center shadow-inner shadow-slate-950/5">
          <p className="text-2xl font-black text-slate-950">{totalEvidencias}</p>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Evidencias</p>
        </div>
      </div>

      <div className="space-y-2">
        {secciones.map((seccion) => {
          const contestadas = seccion.criterios.filter((criterio) => respuestas[criterio.id]?.opcionFormularioIds?.length).length;
          return (
            <button
              type="button"
              key={seccion.id}
              onClick={() => seccion.criterios[0] && onGoToQuestion(seccion.criterios[0].id)}
              className="flex w-full items-center justify-between gap-3 rounded-3xl border border-white/70 bg-white/65 px-4 py-3 text-left shadow-sm shadow-slate-950/5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-slate-800">{seccion.titulo?.etiqueta ?? 'Evaluacion'}</span>
                <span className="text-xs font-bold text-slate-500">{contestadas}/{seccion.criterios.length}</span>
              </span>
              <Icon name={contestadas === seccion.criterios.length ? 'check_circle' : 'error'} className={contestadas === seccion.criterios.length ? 'text-emerald-600' : 'text-amber-600'} />
            </button>
          );
        })}
      </div>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

      <Button type="button" size="lg" icon="send" className="min-h-14 w-full rounded-2xl" isLoading={isSubmitting} onClick={onSubmit}>
        Enviar auditoria
      </Button>
    </section>
  );
}
