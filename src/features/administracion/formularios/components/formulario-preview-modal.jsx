import { Modal, ModalBody, ModalHeader } from '@/components/ui/modal';
import { Icon } from '@/components/ui/icon';
import { ordenarPorOrden } from '@/features/administracion/formularios/helpers/estructura-formulario-helpers';

export function FormularioPreviewModal({ formulario, revision, title = 'Vista previa', onClose }) {
  if (!revision) return null;

  let numeroPregunta = 0;
  const secciones = ordenarPorOrden(revision.secciones ?? []);
  const nombreFormulario = formulario?.nombre ?? revision.formulario?.nombre ?? 'Formulario';

  return (
    <Modal isOpen onClose={onClose} size="xl">
      <ModalHeader onClose={onClose}>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-marca-acento">{title}</p>
          <h2 className="text-xl font-black text-slate-950">{nombreFormulario}</h2>
          <p className="mt-0.5 text-xs font-bold text-slate-500">
            {revision.totalPreguntas} preguntas · {revision.totalSecciones} secciones
          </p>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-5 p-4 md:p-6">
        {secciones.map((seccion, seccionIndex) => (
          <section
            key={seccion.claveEstable ?? seccion.id}
            className="rounded-2xl border border-app-border bg-slate-50/70 p-4 md:p-5"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-marca-acento">
                Sección {seccionIndex + 1}
              </p>
              <h3 className="mt-0.5 text-lg font-black text-slate-950">{seccion.nombre}</h3>
              {seccion.objetivo && (
                <p className="mt-1.5 text-xs font-semibold leading-relaxed text-slate-600">
                  <span className="font-black text-slate-800">Objetivo: </span>
                  {seccion.objetivo}
                </p>
              )}
            </div>

            <ol className="mt-4 space-y-2.5">
              {ordenarPorOrden(seccion.preguntas ?? []).map((pregunta) => {
                numeroPregunta += 1;
                return (
                  <li
                    key={pregunta.claveEstable ?? pregunta.id}
                    className="flex items-start gap-3 rounded-xl border border-app-border bg-white p-3 shadow-sm"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marca-primario/10 text-xs font-black text-marca-primario">
                      {numeroPregunta}
                    </span>
                    <p className="whitespace-pre-line text-xs md:text-sm font-medium leading-relaxed text-slate-800 pt-0.5">
                      {pregunta.texto}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        {!secciones.length && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-800">
            <Icon name="info" />
            Este formulario todavía no tiene secciones.
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
