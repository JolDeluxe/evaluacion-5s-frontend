import { useMemo, useState } from 'react';
import { Criterio5S } from '@/features/auditorias/components/criterio-5s';
import { NavegacionAuditoria } from '@/features/auditorias/components/navegacion-auditoria';
import { ProgresoAuditoria } from '@/features/auditorias/components/progreso-auditoria';
import { QrAuditoria } from '@/features/auditorias/components/qr-auditoria';
import { ResumenAuditoria } from '@/features/auditorias/components/resumen-auditoria';
import { SeccionFormulario } from '@/features/auditorias/components/seccion-formulario';
import {
  agruparSecciones,
  crearRespuestaInicial,
  evaluarReglas,
  obtenerBloques,
  obtenerCriterios,
} from '@/features/auditorias/components/formulario-dinamico.helpers';
import { auditoriasApi } from '@/features/auditorias/api/auditorias-api';

function uuid() {
  return crypto.randomUUID();
}

function validarRespuesta(respuesta, reglasAplicadas) {
  const errores = {};
  if (!respuesta?.opcionFormularioIds?.length) errores.opcion = 'Selecciona una opcion para continuar.';
  if (reglasAplicadas.exigeHallazgo && !respuesta?.hallazgo?.trim()) errores.hallazgo = 'Describe el hallazgo.';
  if (reglasAplicadas.exigeEvidencia && !respuesta?.evidencias?.length) errores.evidencia = 'Agrega al menos una evidencia.';
  return errores;
}

export function FormularioDinamico({ contexto, modo = 'autenticado', token, currentUser, preview = false }) {
  const [fase, setFase] = useState(!preview && contexto.area?.verificacionQrActiva ? 'qr' : 'seccion');
  const [seccionIndex, setSeccionIndex] = useState(0);
  const [criterioIndex, setCriterioIndex] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [errores, setErrores] = useState({});
  const [verificacionArea, setVerificacionArea] = useState(null);
  const [envioError, setEnvioError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [envioCreado, setEnvioCreado] = useState(null);
  const [identificadorCliente] = useState(uuid);

  const bloques = useMemo(() => obtenerBloques(contexto.versionFormulario), [contexto.versionFormulario]);
  const secciones = useMemo(() => agruparSecciones(bloques), [bloques]);
  const criterios = useMemo(() => obtenerCriterios(secciones), [secciones]);
  const reglas = contexto.versionFormulario?.reglas ?? [];
  const criterio = criterios[criterioIndex];
  const seccionActual = secciones[seccionIndex];
  const respuestaActual = criterio ? (respuestas[criterio.id] ?? crearRespuestaInicial(criterio)) : null;
  const reglasAplicadas = criterio ? evaluarReglas(reglas, respuestaActual) : { exigeHallazgo: false, exigeEvidencia: false, reglas: [] };

  const actualizarRespuesta = (bloqueId, cambios) => {
    setRespuestas((actuales) => {
      const bloque = criterios.find((item) => item.id === bloqueId);
      const previa = actuales[bloqueId] ?? crearRespuestaInicial(bloque);
      return { ...actuales, [bloqueId]: { ...previa, ...cambios } };
    });
    setErrores({});
  };

  const irAIndiceCriterio = (nuevoIndice) => {
    const destino = criterios[nuevoIndice];
    const nuevaSeccionIndex = secciones.findIndex((seccion) => seccion.id === destino?.seccionId);
    setCriterioIndex(nuevoIndice);
    if (nuevaSeccionIndex >= 0) setSeccionIndex(nuevaSeccionIndex);
    setFase('criterio');
  };

  const verificarQr = async (codigo) => {
    const response = modo === 'invitado'
      ? await auditoriasApi.verificarQrInvitado(token, { codigo, objetivoAuditoriaId: contexto.objetivo?.id })
      : await auditoriasApi.verificarQrAsignacion(contexto.asignacion?.id, { codigo });

    if (response?.estado !== 'VERIFICADA' && response?.estado !== 'NO_REQUERIDA') {
      throw new Error('El QR no corresponde al area.');
    }

    setVerificacionArea({ codigoQr: codigo });
    setFase('seccion');
  };

  const continuarSinQr = ({ codigoQr, motivoSinVerificacion }) => {
    setVerificacionArea({ codigoQr, continuarSinVerificacion: true, motivoSinVerificacion });
    setFase('seccion');
  };

  const comenzarSeccion = () => {
    const primerCriterio = seccionActual?.criterios?.[0];
    const indice = criterios.findIndex((item) => item.id === primerCriterio?.id);
    irAIndiceCriterio(Math.max(indice, 0));
  };

  const volver = () => {
    if (fase === 'seccion') {
      if (seccionIndex === 0) return;
      setSeccionIndex(seccionIndex - 1);
      return;
    }
    if (criterioIndex === 0) {
      setFase('seccion');
      return;
    }
    const anterior = criterios[criterioIndex - 1];
    const seccionAnterior = secciones.findIndex((seccion) => seccion.id === anterior.seccionId);
    if (seccionAnterior !== seccionIndex) {
      setSeccionIndex(seccionAnterior);
      setFase('seccion');
      return;
    }
    irAIndiceCriterio(criterioIndex - 1);
  };

  const siguiente = () => {
    const erroresActuales = validarRespuesta(respuestaActual, reglasAplicadas);
    if (Object.keys(erroresActuales).length) {
      setErrores(erroresActuales);
      return;
    }

    if (criterioIndex >= criterios.length - 1) {
      setFase('resumen');
      return;
    }

    const siguienteCriterio = criterios[criterioIndex + 1];
    const siguienteSeccionIndex = secciones.findIndex((seccion) => seccion.id === siguienteCriterio.seccionId);
    if (siguienteSeccionIndex !== seccionIndex) {
      setSeccionIndex(siguienteSeccionIndex);
      setFase('seccion');
      return;
    }
    irAIndiceCriterio(criterioIndex + 1);
  };

  const seleccionarOpcion = (opcion) => {
    actualizarRespuesta(criterio.id, { opcionFormularioIds: [opcion.id] });
  };

  const enviar = async () => {
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
        objetivoAuditoriaId: contexto.objetivo?.id,
        asignacionAuditoriaId: modo === 'invitado' ? (contexto.asignacion?.id ?? null) : contexto.asignacion?.id,
        nombreAuditorSnapshot: currentUser?.nombre ?? contexto.nombreAuditor ?? 'Auditor',
        finalizadoEn: new Date().toISOString(),
        verificacionArea: verificacionArea ?? undefined,
        respuestas: criterios.map((item) => {
          const respuesta = respuestas[item.id] ?? crearRespuestaInicial(item);
          return {
            bloqueFormularioId: item.id,
            valorTexto: respuesta.valorTexto ?? null,
            valorNumero: respuesta.valorNumero ?? null,
            valorBooleano: respuesta.valorBooleano ?? null,
            valorFecha: respuesta.valorFecha ?? null,
            opcionFormularioIds: respuesta.opcionFormularioIds ?? [],
            hallazgo: respuesta.hallazgo?.trim() || null,
            evidencias: respuesta.evidencias ?? [],
          };
        }),
      };

      const response = modo === 'invitado'
        ? await auditoriasApi.enviarAuditoriaInvitado(token, payload)
        : await auditoriasApi.enviarAuditoria(payload);
      setEnvioCreado(response?.envio ?? response);
      setFase('enviado');
    } catch (err) {
      setEnvioError(err?.message || 'No se pudo enviar. Tus respuestas siguen en memoria para reintentar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!contexto.versionFormulario || !criterios.length) {
    return (
      <section className="rounded-[2rem] border border-white/75 bg-white/75 p-6 text-center shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
        <h1 className="text-xl font-black text-slate-950">No se pudo cargar correctamente esta evaluacion.</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">La version no contiene criterios respondibles.</p>
      </section>
    );
  }

  if (fase === 'qr') {
    return <QrAuditoria area={contexto.area} onVerify={verificarQr} onSkip={continuarSinQr} />;
  }

  if (fase === 'enviado') {
    return (
      <section className="space-y-4 rounded-[2rem] border border-emerald-200/70 bg-white/75 p-6 text-center shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          ✓
        </div>
        <h1 className="text-2xl font-black text-slate-950">Auditoria enviada</h1>
        <p className="text-sm font-semibold leading-6 text-slate-600">
          {preview
            ? 'Vista previa completada. No se creo ningun envio real.'
            : `El backend calculo el resultado oficial. Folio interno: ${envioCreado?.id ?? 'recibido'}.`}
        </p>
      </section>
    );
  }

  if (fase === 'resumen') {
    return (
      <ResumenAuditoria
        secciones={secciones}
        respuestas={respuestas}
        isSubmitting={isSubmitting}
        error={envioError}
        onGoToQuestion={(bloqueId) => {
          const indice = criterios.findIndex((item) => item.id === bloqueId);
          if (indice >= 0) irAIndiceCriterio(indice);
        }}
        onSubmit={enviar}
      />
    );
  }

  if (fase === 'seccion') {
    return (
      <SeccionFormulario
        seccion={seccionActual}
        indice={seccionIndex}
        totalSecciones={secciones.length}
        onStart={comenzarSeccion}
      />
    );
  }

  return (
    <>
      <div className="space-y-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <ProgresoAuditoria actual={criterioIndex + 1} total={criterios.length} seccion={criterio.seccionTitulo} />
        <Criterio5S
          criterio={criterio}
          respuesta={respuestaActual}
          reglasAplicadas={reglasAplicadas}
          errores={errores}
          modo={modo}
          token={token}
          preview={preview}
          onSelectOption={seleccionarOpcion}
          onChangeHallazgo={(hallazgo) => actualizarRespuesta(criterio.id, { hallazgo })}
          onChangeEvidencias={(evidencias) => actualizarRespuesta(criterio.id, { evidencias })}
        />
      </div>
      <NavegacionAuditoria
        siguienteLabel={criterioIndex >= criterios.length - 1 ? 'Revisar' : 'Siguiente'}
        onBack={volver}
        onNext={siguiente}
      />
    </>
  );
}
