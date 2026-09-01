// src/features/administracion/formularios/components/editor-formulario.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Icon } from '@/components/ui/icon';
import { formulariosApi } from '@/features/administracion/formularios/api/formularios-api';
import { crearClaveEstable } from '@/features/administracion/formularios/helpers/estructura-formulario-helpers';

export function EditorFormulario({ formularioId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Formulario general
  const [formMeta, setFormMeta] = useState({
    nombre: '',
    descripcion: '',
    alcance: '',
    activo: true,
  });

  // Estructura (secciones y preguntas)
  const [secciones, setSecciones] = useState([]);

  useEffect(() => {
    async function cargarFormulario() {
      try {
        setLoading(true);
        const { formulario } = await formulariosApi.obtener(formularioId);
        setFormMeta({
          nombre: formulario.nombre,
          descripcion: formulario.descripcion ?? '',
          alcance: formulario.alcance,
          activo: formulario.activo,
        });

        // Mapear secciones y preguntas con ordenes estables
        const mappedSecciones = (formulario.actual?.secciones ?? []).map((sec, secIdx) => ({
          id: sec.id,
          claveEstable: sec.claveEstable ?? crearClaveEstable(),
          nombre: sec.nombre,
          objetivo: sec.objetivo ?? '',
          orden: secIdx,
          preguntas: (sec.preguntas ?? []).map((p, pIdx) => ({
            id: p.id,
            claveEstable: p.claveEstable ?? crearClaveEstable(),
            texto: p.texto,
            orden: pIdx,
            requiereHallazgo: p.requiereHallazgo ?? true,
          })),
        }));
        setSecciones(mappedSecciones);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el formulario.');
      } finally {
        setLoading(false);
      }
    }

    cargarFormulario();
  }, [formularioId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formMeta.nombre.trim()) {
      setError('El nombre del formulario es requerido.');
      return;
    }
    if (secciones.length === 0) {
      setError('Debes agregar al menos una sección.');
      return;
    }
    for (let i = 0; i < secciones.length; i++) {
      if (!secciones[i].nombre.trim()) {
        setError(`El nombre de la sección ${i + 1} es requerido.`);
        return;
      }
      if (secciones[i].preguntas.length === 0) {
        setError(`La sección ${i + 1} ("${secciones[i].nombre}") debe tener al menos una pregunta.`);
        return;
      }
      for (let j = 0; j < secciones[i].preguntas.length; j++) {
        if (!secciones[i].preguntas[j].texto.trim()) {
          setError(`La pregunta ${j + 1} en la sección "${secciones[i].nombre}" no puede estar vacía.`);
          return;
        }
      }
    }

    try {
      setSaving(true);
      setError(null);

      // 1. Actualizar metadata del formulario (nombre, descripcion, activo)
      await formulariosApi.actualizar(formularioId, {
        nombre: formMeta.nombre.trim(),
        descripcion: formMeta.descripcion.trim() || null,
        activo: formMeta.activo,
      });

      // 2. Guardar estructura (secciones y preguntas) en /formularios/:id/estructura
      const estructuraPayload = {
        secciones: secciones.map((sec, secIdx) => ({
          claveEstable: sec.claveEstable,
          nombre: sec.nombre.trim(),
          objetivo: sec.objetivo.trim() || null,
          orden: secIdx,
          preguntas: sec.preguntas.map((p, pIdx) => ({
            claveEstable: p.claveEstable,
            texto: p.texto.trim(),
            orden: pIdx,
            requiereHallazgo: p.requiereHallazgo !== false,
          })),
        })),
      };

      const resEstructura = await formulariosApi.guardarEstructura(formularioId, estructuraPayload);
      const mensajeFeedback = resEstructura?.mensaje || 'Cambios guardados correctamente.';
      navigate(`/admin/formularios/${formularioId}`, { state: { feedback: mensajeFeedback } });
    } catch (err) {
      setError(err.message || 'Error al guardar cambios.');
    } finally {
      setSaving(false);
    }
  };

  // Acciones de Sección
  const agregarSeccion = () => {
    setSecciones([
      ...secciones,
      {
        claveEstable: crearClaveEstable(),
        nombre: '',
        objetivo: '',
        orden: secciones.length,
        preguntas: [],
      },
    ]);
  };

  const eliminarSeccion = (secIdx) => {
    setSecciones(secciones.filter((_, idx) => idx !== secIdx));
  };

  const moverSeccion = (secIdx, direccion) => {
    const targetIdx = secIdx + direccion;
    if (targetIdx < 0 || targetIdx >= secciones.length) return;
    const copia = [...secciones];
    const temp = copia[secIdx];
    copia[secIdx] = copia[targetIdx];
    copia[targetIdx] = temp;
    setSecciones(copia);
  };

  // Acciones de Pregunta
  const agregarPregunta = (secIdx) => {
    const copia = [...secciones];
    copia[secIdx].preguntas.push({
      claveEstable: crearClaveEstable(),
      texto: '',
      orden: copia[secIdx].preguntas.length,
      requiereHallazgo: true,
    });
    setSecciones(copia);
  };

  const eliminarPregunta = (secIdx, preIdx) => {
    const copia = [...secciones];
    copia[secIdx].preguntas = copia[secIdx].preguntas.filter((_, idx) => idx !== preIdx);
    setSecciones(copia);
  };

  const moverPregunta = (secIdx, preIdx, direccion) => {
    const targetIdx = preIdx + direccion;
    if (targetIdx < 0 || targetIdx >= secciones[secIdx].preguntas.length) return;
    const copia = [...secciones];
    const targetPreguntas = copia[secIdx].preguntas;
    const temp = targetPreguntas[preIdx];
    targetPreguntas[preIdx] = targetPreguntas[targetIdx];
    targetPreguntas[targetIdx] = temp;
    setSecciones(copia);
  };

  const cambiarTextoPregunta = (secIdx, preIdx, valor) => {
    const copia = [...secciones];
    copia[secIdx].preguntas[preIdx].texto = valor;
    setSecciones(copia);
  };

  const cambiarPregunta = (secIdx, preIdx, campo, valor) => {
    const copia = [...secciones];
    copia[secIdx].preguntas[preIdx][campo] = valor;
    setSecciones(copia);
  };

  const cambiarMetaSeccion = (secIdx, campo, valor) => {
    const copia = [...secciones];
    copia[secIdx][campo] = valor;
    setSecciones(copia);
  };

  if (loading) return <Spinner />;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate(`/admin/formularios/${formularioId}`)}
          className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Volver al formulario
        </button>

        <h1 className="mt-4 text-3xl font-black text-slate-950">
          Editar Formulario
        </h1>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Información general */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-slate-950">Información General</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Nombre</Label>
              <Input
                value={formMeta.nombre}
                required
                onChange={(e) => setFormMeta({ ...formMeta, nombre: e.target.value })}
              />
            </div>
            <div>
              <Label>Alcance / Tipo (Solo Lectura)</Label>
              <Input
                value={formMeta.alcance}
                disabled
              />
            </div>
          </div>

          <div>
            <Label>Descripción</Label>
            <Input
              multiline
              value={formMeta.descripcion}
              onChange={(e) => setFormMeta({ ...formMeta, descripcion: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formMeta.activo}
              onChange={(e) => setFormMeta({ ...formMeta, activo: e.target.checked })}
              className="rounded text-marca-primario focus:ring-marca-primario/30"
            />
            Formulario activo
          </label>
        </div>

        {/* Estructura de Secciones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-950">Estructura</h2>
            <Button type="button" variant="outline" icon="add" onClick={agregarSeccion}>
              Agregar sección
            </Button>
          </div>

          {secciones.map((seccion, secIdx) => (
            <div key={seccion.claveEstable} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-marca-acento">
                  Sección {secIdx + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={secIdx === 0}
                    onClick={() => moverSeccion(secIdx, -1)}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                  >
                    <Icon name="arrow_upward" size="18px" />
                  </button>
                  <button
                    type="button"
                    disabled={secIdx === secciones.length - 1}
                    onClick={() => moverSeccion(secIdx, 1)}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-40"
                  >
                    <Icon name="arrow_downward" size="18px" />
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarSeccion(secIdx)}
                    className="p-1 hover:bg-red-50 text-red-500 rounded"
                  >
                    <Icon name="delete" size="18px" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nombre de la Sección</Label>
                  <Input
                    value={seccion.nombre}
                    required
                    placeholder="Ej: 1'S SEIRI"
                    onChange={(e) => cambiarMetaSeccion(secIdx, 'nombre', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Objetivo de la Sección</Label>
                  <Input
                    value={seccion.objetivo}
                    placeholder="Objetivo a cumplir..."
                    onChange={(e) => cambiarMetaSeccion(secIdx, 'objetivo', e.target.value)}
                  />
                </div>
              </div>

              {/* Preguntas */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Preguntas / Criterios</span>
                    <p className="text-[11px] text-slate-400">
                      Editar el texto de una pregunta existente corrige la redacción/ortografía conservando su historial. Para cambiar el criterio por otro completamente nuevo, elimina la pregunta y agrega una nueva.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => agregarPregunta(secIdx)}
                    className="flex items-center gap-1 text-xs font-black text-marca-primario hover:underline shrink-0"
                  >
                    <Icon name="add" size="14px" />
                    Nueva pregunta
                  </button>
                </div>

                <div className="space-y-2">
                  {seccion.preguntas.map((pregunta, preIdx) => (
                    <div key={pregunta.claveEstable} className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex gap-2 items-center">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marca-primario/10 text-xs font-black text-marca-primario" title="Pregunta activa">
                          {preIdx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={pregunta.texto}
                          placeholder="Redactar criterio de evaluación (corrección o ajuste de redacción)..."
                          onChange={(e) => cambiarTextoPregunta(secIdx, preIdx, e.target.value)}
                          className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={preIdx === 0}
                            onClick={() => moverPregunta(secIdx, preIdx, -1)}
                            title="Subir orden"
                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-40 text-slate-500"
                          >
                            <Icon name="keyboard_arrow_up" size="16px" />
                          </button>
                          <button
                            type="button"
                            disabled={preIdx === seccion.preguntas.length - 1}
                            onClick={() => moverPregunta(secIdx, preIdx, 1)}
                            title="Bajar orden"
                            className="p-1 hover:bg-slate-200 rounded disabled:opacity-40 text-slate-500"
                          >
                            <Icon name="keyboard_arrow_down" size="16px" />
                          </button>
                          <button
                            type="button"
                            onClick={() => eliminarPregunta(secIdx, preIdx)}
                            title="Retirar criterio del formulario"
                            className="p-1 hover:bg-red-50 text-red-500 rounded"
                          >
                            <Icon name="delete" size="16px" />
                          </button>
                        </div>
                      </div>

                      {/* Control compacto de Hallazgo al responder NO */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-2 text-xs">
                        <span className="font-bold text-slate-600">Al responder NO:</span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                            <input
                              type="radio"
                              name={`req-hallazgo-${secIdx}-${preIdx}`}
                              checked={pregunta.requiereHallazgo !== false}
                              onChange={() => cambiarPregunta(secIdx, preIdx, 'requiereHallazgo', true)}
                              className="text-marca-primario focus:ring-marca-primario/30"
                            />
                            Solicitar hallazgo <span className="text-[10px] text-slate-400">(foto opcional)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                            <input
                              type="radio"
                              name={`req-hallazgo-${secIdx}-${preIdx}`}
                              checked={pregunta.requiereHallazgo === false}
                              onChange={() => cambiarPregunta(secIdx, preIdx, 'requiereHallazgo', false)}
                              className="text-marca-primario focus:ring-marca-primario/30"
                            />
                            Solo registrar respuesta
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {seccion.preguntas.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No hay preguntas agregadas a esta sección.</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {secciones.length === 0 && (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-400 italic">
              No hay secciones. Agrega una para comenzar.
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="cancelar"
            onClick={() => navigate(`/admin/formularios/${formularioId}`)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="guardar"
            isLoading={saving}
          >
            Guardar cambios
          </Button>
        </div>
      </form>
    </section>
  );
}