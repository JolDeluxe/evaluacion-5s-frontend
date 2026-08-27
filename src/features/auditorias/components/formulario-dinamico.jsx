import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { QrAuditoria } from '@/features/auditorias/components/qr-auditoria';
import { CompactCriterio5S } from '@/features/auditorias/components/compact-criterio-5s';
import { ResumenAuditoria } from '@/features/auditorias/components/resumen-auditoria';
import {
  agruparSecciones,
  crearRespuestaInicial,
  evaluarReglas,
  obtenerBloques,
  obtenerCriterios,
} from '@/features/auditorias/components/formulario-dinamico.helpers';
import { auditoriasApi } from '@/features/auditorias/api/auditorias-api';
import { markAuditDraftDirty, markAuditDraftSaved } from '@/features/auditorias/utils/auditoria-runtime-status';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function describirPeriodo(ciclo) {
  const mes = Number(ciclo?.mes);
  const nombreMes = mes >= 1 && mes <= 12 ? MESES[mes - 1] : null;
  const corte = Number(ciclo?.numeroCorte);
  const periodo = corte === 1
    ? 'Primer periodo'
    : corte === 2
      ? 'Segundo periodo'
      : corte > 0
        ? `Periodo ${corte}`
        : null;

  if (nombreMes && periodo) return `${nombreMes} · ${periodo}`;
  if (nombreMes) return nombreMes;
  if (periodo) return periodo;

  const nombre = ciclo?.nombre ?? '';
  const match = nombre.match(/P(\d+)\s+(\d{1,2})\/(\d{4})/i);
  if (match) {
    const parsedMes = Number(match[2]);
    const parsedCorte = Number(match[1]);
    const parsedNombreMes = parsedMes >= 1 && parsedMes <= 12 ? MESES[parsedMes - 1] : null;
    const parsedPeriodo = parsedCorte === 1 ? 'Primer periodo' : parsedCorte === 2 ? 'Segundo periodo' : `Periodo ${parsedCorte}`;
    if (parsedNombreMes) return `${parsedNombreMes} · ${parsedPeriodo}`;
  }

  return nombre || 'Evaluación 5S';
}

function limpiarEvidenciaParaEnvio(evidencia) {
  return {
    identificadorCliente: evidencia.identificadorCliente,
    publicIdCloudinary: evidencia.publicIdCloudinary,
    assetIdCloudinary: evidencia.assetIdCloudinary ?? null,
    formato: evidencia.formato ?? null,
    tipoMime: evidencia.tipoMime ?? null,
    bytes: evidencia.bytes ?? null,
    ancho: evidencia.ancho ?? null,
    alto: evidencia.alto ?? null,
    capturadaEn: evidencia.capturadaEn ?? null,
    subidaEn: evidencia.subidaEn ?? null,
  };
}

function AuditoriaHeader({ contexto, respondidas, total, onExit, savedAt }) {
  const porcentaje = total > 0 ? Math.round((respondidas / total) * 100) : 0;

  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-white/60 bg-app-surface/92 px-4 pb-3 pt-4 shadow-sm backdrop-blur-2xl">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[1.65rem] border border-white/70 bg-white/78 p-4 shadow-lg shadow-slate-950/5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-marca-acento">
                {describirPeriodo(contexto.ciclo)}
              </p>
              <h1 className="mt-1 truncate text-xl font-black leading-tight text-slate-950">
                {contexto.area?.nombre ?? 'Auditoría 5S'}
              </h1>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon="close"
              onClick={onExit}
              className="shrink-0 rounded-xl hover:translate-y-0 hover:shadow-none"
            >
              Salir
            </Button>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm font-black text-slate-800">
              <span>{respondidas} / {total} respondidas</span>
              <span>{porcentaje}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
            {savedAt && (
              <p className="mt-2 text-[11px] font-bold text-slate-500">
                Progreso guardado automáticamente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftNotice({ onClear }) {
  return (
    <div className="rounded-2xl border border-marca-secundario/20 bg-white/80 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-marca-primario">Continuamos donde te quedaste</p>
          <p className="text-xs font-semibold text-slate-500">Tu avance se guarda en este dispositivo mientras capturas.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClear} className="shrink-0 hover:translate-y-0 hover:shadow-none">
          Reiniciar
        </Button>
      </div>
    </div>
  );
}

export function FormularioDinamico({ contexto, modo = 'autenticado', token, currentUser, nombreInvitado, preview = false, onExit }) {
  const navigate = useNavigate();
  const [fase, setFase] = useState(!preview && contexto.area?.verificacionQrActiva ? 'qr' : 'captura');
  const [respuestas, setRespuestas] = useState({});
  const [errores, setErrores] = useState({});
  const [verificacionArea, setVerificacionArea] = useState(null);
  const [envioError, setEnvioError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [envioCreado, setEnvioCreado] = useState(null);
  const [identificadorCliente, setIdentificadorCliente] = useState(uuid);
  const [feedbackIncompleto, setFeedbackIncompleto] = useState(null);
  const [draftHydrated, setDraftHydrated] = useState(preview);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState(null);

  const bloques = useMemo(() => obtenerBloques(contexto.versionFormulario), [contexto.versionFormulario]);
  const secciones = useMemo(() => agruparSecciones(bloques), [bloques]);
  const criterios = useMemo(() => obtenerCriterios(secciones), [secciones]);
  const reglas = contexto.versionFormulario?.reglas ?? [];
  const draftKey = useMemo(() => {
    const auditoriaId = modo === 'invitado'
      ? contexto.invitacion?.id ?? contexto.asignacion?.id ?? 'invitado'
      : contexto.asignacion?.id ?? contexto.objetivo?.id ?? contexto.area?.id;
    const versionId = contexto.versionFormulario?.id ?? 'version';
    return `encuestas-5s:auditoria-draft:${modo}:${auditoriaId}:${versionId}`;
  }, [contexto.area?.id, contexto.asignacion?.id, contexto.invitacion?.id, contexto.objetivo?.id, contexto.versionFormulario?.id, modo]);

  const totalPreguntas = criterios.length;
  const respondidas = useMemo(() => criterios.filter((criterio) => respuestas[criterio.id]?.opcionFormularioIds?.length > 0).length, [criterios, respuestas]);
  const positivas = useMemo(() => criterios.filter((criterio) => respuestas[criterio.id]?.cumple === true).length, [criterios, respuestas]);
  const totalHallazgos = useMemo(() => Object.values(respuestas).filter((respuesta) => respuesta.hallazgo?.trim()).length, [respuestas]);

  // Scroll to top instantly when phase changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [fase]);

  useEffect(() => {
    if (preview || !draftKey || !criterios.length) return;

    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft?.versionFormularioId === contexto.versionFormulario?.id) {
          setRespuestas(draft.respuestas ?? {});
          setVerificacionArea(draft.verificacionArea ?? null);
          setIdentificadorCliente(draft.identificadorCliente || uuid());
          if (draft.fase && draft.fase !== 'enviado') setFase(draft.fase);
          setDraftRestored(Boolean(Object.keys(draft.respuestas ?? {}).length));
          setDraftSavedAt(draft.updatedAt ?? null);
        }
      }
    } catch {
      localStorage.removeItem(draftKey);
    } finally {
      setDraftHydrated(true);
    }
  }, [contexto.versionFormulario?.id, criterios.length, draftKey, preview]);

  useEffect(() => {
    if (preview || !draftHydrated || !draftKey || fase === 'enviado') return undefined;

    const draftRevision = markAuditDraftDirty();

    const timeoutId = window.setTimeout(() => {
      try {
        const updatedAt = new Date().toISOString();
        localStorage.setItem(draftKey, JSON.stringify({
          versionFormularioId: contexto.versionFormulario?.id,
          identificadorCliente,
          respuestas,
          verificacionArea,
          fase,
          updatedAt,
        }));
        markAuditDraftSaved(draftRevision, Date.now());
        setDraftSavedAt(updatedAt);
      } catch {
        // Si localStorage falla, la auditoría sigue funcionando en memoria.
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [contexto.versionFormulario?.id, draftHydrated, draftKey, fase, identificadorCliente, preview, respuestas, verificacionArea]);

  const limpiarDraft = () => {
    try {
      localStorage.removeItem(draftKey);
      markAuditDraftSaved();
    } catch {
      // noop
    }
    setRespuestas({});
    setErrores({});
    setVerificacionArea(null);
    setIdentificadorCliente(uuid());
    setDraftRestored(false);
    setDraftSavedAt(null);
    setFase(!preview && contexto.area?.verificacionQrActiva ? 'qr' : 'captura');
  };

  const actualizarRespuesta = (bloqueId, cambios) => {
    setRespuestas((prev) => {
      const criterio = criterios.find((item) => item.id === bloqueId);
      const actual = prev[bloqueId] ?? crearRespuestaInicial(criterio);
      const nuevosCambios = {};
      for (const [key, val] of Object.entries(cambios)) {
        nuevosCambios[key] = typeof val === 'function' ? val(actual[key]) : val;
      }
      return {
        ...prev,
        [bloqueId]: { ...actual, ...nuevosCambios },
      };
    });
    setErrores((prev) => {
      if (!prev[bloqueId]) return prev;
      const { [bloqueId]: _omitido, ...resto } = prev;
      return resto;
    });
    setFeedbackIncompleto(null);
  };

  const seleccionarOpcion = (criterioId, opcion) => {
    actualizarRespuesta(criterioId, {
      opcionFormularioIds: [opcion.id],
      cumple: opcion.valor === 'SI' || Number(opcion.valorPuntaje ?? 0) > 0,
    });
  };

  const validarTodo = () => {
    const nuevosErrores = {};
    let primeraFaltanteId = null;

    criterios.forEach((criterio) => {
      const respuesta = respuestas[criterio.id] ?? crearRespuestaInicial(criterio);
      const aplicadas = evaluarReglas(reglas, respuesta);
      let errorCrit = null;

      if (!respuesta.opcionFormularioIds?.length) {
        errorCrit = { missing: true };
      } else if (aplicadas.exigeHallazgo && !respuesta.hallazgo?.trim()) {
        errorCrit = { hallazgo: 'Describe el hallazgo.' };
      }

      if (errorCrit) {
        nuevosErrores[criterio.id] = errorCrit;
        if (!primeraFaltanteId) primeraFaltanteId = criterio.id;
      }
    });

    if (primeraFaltanteId) {
      nuevosErrores[primeraFaltanteId].scrollRequest = Date.now();
    }

    setErrores(nuevosErrores);
    return { isValid: Object.keys(nuevosErrores).length === 0, faltantes: Object.keys(nuevosErrores).length };
  };

  const handleIntentarFinalizar = () => {
    const { isValid, faltantes } = validarTodo();
    if (isValid) {
      setFeedbackIncompleto(null);
      setFase('revision');
    } else {
      setFeedbackIncompleto(`Te falta${faltantes > 1 ? 'n' : ''} ${faltantes} respuesta${faltantes > 1 ? 's' : ''}`);
    }
  };

  const enviar = async () => {
    // Double check just in case, before sending
    const { isValid } = validarTodo();
    if (!isValid) return;

    setIsSubmitting(true);
    setEnvioError('');

    try {
      if (preview) {
        setEnvioCreado({ id: 'preview' });
        setFase('enviado');
        return;
      }

      const payload = {
        identificadorCliente,
        asignacionAuditoriaId: modo === 'invitado' ? (contexto.asignacion?.id ?? null) : contexto.asignacion?.id,
        nombreAuditorSnapshot: currentUser?.nombre ?? nombreInvitado ?? contexto.nombreAuditor ?? 'Auditor',
        finalizadoEn: new Date().toISOString(),
        codigoVerificacion: verificacionArea?.codigoQr || verificacionArea?.codigoVerificacion || contexto.area?.codigoVerificacion || '',
        respuestas: criterios.map((item) => {
          const respuesta = respuestas[item.id] ?? crearRespuestaInicial(item);
          return {
            preguntaFormularioId: item.preguntaFormularioId ?? item.id,
            cumple: respuesta.cumple === true,
            hallazgo: respuesta.hallazgo?.trim() || null,
            fotos: (respuesta.evidencias ?? []).map(limpiarEvidenciaParaEnvio),
          };
        }),
      };

      const response = modo === 'invitado'
        ? await auditoriasApi.enviarAuditoriaInvitado(token, payload)
        : await auditoriasApi.enviarAuditoria(payload);

      try {
        localStorage.removeItem(draftKey);
        markAuditDraftSaved();
      } catch {
        // noop
      }
      setEnvioCreado(response?.envio ?? response);
      setFase('enviado');
    } catch (err) {
      const details = Array.isArray(err?.detalles)
        ? ' ' + err.detalles.map((d) => `${d.path ? (Array.isArray(d.path) ? d.path.join('.') : d.path) : ''}: ${d.message || d.mensaje}`).join(', ')
        : '';
      setEnvioError((err?.message || 'No se pudo enviar.') + details);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultadosFinales = () => {
    if (envioCreado && envioCreado.id !== 'preview') {
      const pct = envioCreado.porcentaje !== undefined ? Math.round(Number(envioCreado.porcentaje)) : 0;
      const obt = envioCreado.puntajeObtenido !== undefined ? Math.round(Number(envioCreado.puntajeObtenido)) : 0;
      const pos = envioCreado.puntajePosible !== undefined ? Math.round(Number(envioCreado.puntajePosible)) : 0;
      return { porcentaje: pct, obtenidos: obt, posibles: pos, folio: envioCreado.id };
    }
    // Fallback/Preview
    const total = totalPreguntas;
    const obt = positivas;
    const pct = total > 0 ? Math.round((obt / total) * 100) : 0;
    return { porcentaje: pct, obtenidos: obt, posibles: total, folio: 'Vista Previa' };
  };

  if (!contexto.versionFormulario || !criterios.length) {
    return (
      <section className="rounded-2xl border border-white/75 bg-white/75 p-6 text-center shadow-xl backdrop-blur-xl">
        <h1 className="text-xl font-black text-slate-950">No se pudo cargar correctamente.</h1>
        <p className="mt-2 text-sm text-slate-600">La versión no contiene criterios respondibles.</p>
      </section>
    );
  }

  if (fase === 'qr') {
    return (
      <QrAuditoria
        area={contexto.area}
        onVerify={(codigoQr) => { setVerificacionArea({ codigoQr, verificado: true }); setFase('captura'); }}
        onSkip={(datos) => { setVerificacionArea({ ...datos, codigoQr: datos?.codigoQr || contexto.area?.codigoVerificacion || '', verificado: false }); setFase('captura'); }}
      />
    );
  }

  if (fase === 'enviado') {
    const { porcentaje, obtenidos, posibles, folio } = getResultadosFinales();

    return (
      <div className="mx-auto w-full max-w-2xl pt-8 pb-12 px-4 space-y-6">
        <header className="pb-4 border-b border-app-border">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-marca-acento">Auditoría</p>
          <h1 className="text-3xl font-black text-slate-950">Completada</h1>
        </header>

        <section className="rounded-3xl border border-emerald-200/70 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-2xl space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon name="check" size="xl" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Resultado Oficial</p>
            <p className="text-6xl font-black text-slate-950">{porcentaje}%</p>
            <p className="text-sm font-bold text-slate-600">{obtenidos} / {posibles} puntos</p>
          </div>

          <div className="rounded-2xl bg-slate-50 py-3 px-4 inline-block">
            <p className="text-xs font-bold text-slate-500">Folio de registro</p>
            <p className="text-sm font-black text-slate-800">{folio}</p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full rounded-2xl min-h-[3.5rem] text-base font-black"
              onClick={onExit}
            >
              Volver al inicio
            </Button>
            {modo !== 'invitado' && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full rounded-2xl min-h-[3.5rem] text-base font-bold"
                onClick={() => {
                  const anio = contexto.ciclo?.anio;
                  const mes = contexto.ciclo?.mes;
                  navigate(anio && mes ? `/resultados/${anio}/${mes}` : '/resultados');
                }}
              >
                Ver resultados
              </Button>
            )}
          </div>
        </section>
      </div>
    );
  }

  if (fase === 'revision') {
    return (
      <div className="relative min-h-dvh bg-app-surface">
        <AuditoriaHeader
          contexto={contexto}
          respondidas={respondidas}
          total={totalPreguntas}
          onExit={onExit}
          savedAt={draftSavedAt}
        />
        <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pb-12 pt-4">
          <ResumenAuditoria
            criterios={criterios}
            respuestas={respuestas}
            onSubmit={enviar}
            onBackToCapture={() => setFase('captura')}
            isSubmitting={isSubmitting}
            error={envioError}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-app-surface">
      <AuditoriaHeader
        contexto={contexto}
        respondidas={respondidas}
        total={totalPreguntas}
        onExit={onExit}
        savedAt={draftSavedAt}
      />

      <main className="mx-auto w-full max-w-2xl space-y-8 px-0 pb-12 pt-4">
        {draftRestored && <DraftNotice onClear={limpiarDraft} />}

        {envioError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {envioError}
          </div>
        )}

        {secciones.map((seccion) => (
          <section key={seccion.id} id={`seccion-${seccion.id}`} className="scroll-mt-36 space-y-4">
            <header>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {seccion.titulo?.etiqueta ?? 'Evaluación'}
              </h2>
              {seccion.titulo?.descripcion && (
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{seccion.titulo.descripcion}</p>
              )}
            </header>

            <div className="space-y-4">
              {seccion.criterios.map((criterio) => {
                const respuesta = respuestas[criterio.id] ?? crearRespuestaInicial(criterio);
                const reglasAplicadas = evaluarReglas(reglas, respuesta);
                return (
                  <CompactCriterio5S
                    key={criterio.id}
                    criterio={criterio}
                    respuesta={respuesta}
                    reglasAplicadas={reglasAplicadas}
                    errores={errores[criterio.id]}
                    modo={modo}
                    token={token}
                    preview={preview}
                    onSelectOption={(opcion) => seleccionarOpcion(criterio.id, opcion)}
                    onChangeHallazgo={(hallazgo) => actualizarRespuesta(criterio.id, { hallazgo })}
                    onChangeEvidencias={(evidencias) => actualizarRespuesta(criterio.id, { evidencias })}
                  />
                );
              })}
            </div>
          </section>
        ))}

        <div className="flex flex-col items-center border-t border-slate-200 pt-6 text-center">
          <p className="mb-4 text-sm font-black text-slate-700">
            {respondidas} de {totalPreguntas} respondidas
          </p>

          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full rounded-2xl min-h-[3.5rem] text-base font-black"
            onClick={handleIntentarFinalizar}
            icon="send"
          >
            Finalizar auditoría
          </Button>

          {feedbackIncompleto && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
              {feedbackIncompleto}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
