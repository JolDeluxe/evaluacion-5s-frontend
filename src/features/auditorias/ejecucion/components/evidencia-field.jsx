import { useEffect, useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ImageViewer } from '@/components/ui/image-viewer';
import { auditoriasApi } from '@/features/auditorias/ejecucion/api/auditorias-api';
import { setAuditUploadActive } from '@/features/auditorias/ejecucion/utils/auditoria-runtime-status';
import { procesarImagen } from '@/utils/procesar-imagen';

const MAX_EVIDENCIAS = 3;

async function subirACloudinary(file, firma) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', firma.apiKey);
  formData.append('timestamp', firma.timestamp);
  formData.append('signature', firma.signature);
  formData.append('public_id', firma.publicId);
  formData.append('folder', firma.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'No se pudo subir la evidencia.');
  return data;
}

function mapearEvidenciaCloudinary(data, file) {
  return {
    identificadorCliente: crypto.randomUUID(),
    publicIdCloudinary: data.public_id,
    assetIdCloudinary: data.asset_id ?? null,
    formato: data.format ?? null,
    tipoMime: file.type || data.resource_type || null,
    bytes: data.bytes ?? file.size ?? null,
    ancho: data.width ?? null,
    alto: data.height ?? null,
    capturadaEn: null,
    subidaEn: new Date().toISOString(),
    url: data.secure_url || data.url || '',
  };
}

export function EvidenciaField({ evidencias = [], onChange, modo, token, error, preview = false }) {
  const [colaSubidas, setColaSubidas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [viewer, setViewer] = useState(null);
  const inputRef = useRef(null);
  const activeUploadIdsRef = useRef(new Set());

  const totalActual = evidencias.length + colaSubidas.length;
  const restantes = Math.max(0, MAX_EVIDENCIAS - totalActual);
  const limiteAlcanzado = restantes === 0;

  const thumbnails = useMemo(() => evidencias.map((evidencia, index) => ({
    ...evidencia,
    src: evidencia.url || '',
    label: `Evidencia ${index + 1}`,
  })), [evidencias]);

  useEffect(() => {
    const activeUploadIds = activeUploadIdsRef.current;

    return () => {
      activeUploadIds.forEach((id) => {
        setAuditUploadActive(id, false);
      });
      activeUploadIds.clear();
    };
  }, []);

  const ejecutarSubida = async (tarea) => {
    activeUploadIdsRef.current.add(tarea.id);
    setAuditUploadActive(tarea.id, true);

    try {
      // 1. Process and compress image in frontend (webp, max 1600px, quality 0.8)
      let fileParaSubir = tarea.file;
      try {
        fileParaSubir = await procesarImagen(tarea.file);
      } catch (e) {
        // Fallback to original file on error
        fileParaSubir = tarea.file;
      }

      // Update state to uploading
      setColaSubidas((prev) =>
        prev.map((t) => (t.id === tarea.id ? { ...t, estado: 'subiendo' } : t))
      );

      // 2. Fetch upload signature
      if (preview) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const simulada = {
          identificadorCliente: crypto.randomUUID(),
          publicIdCloudinary: `preview/${crypto.randomUUID()}`,
          assetIdCloudinary: null,
          formato: fileParaSubir.name.split('.').pop() ?? 'webp',
          tipoMime: fileParaSubir.type || 'image/webp',
          bytes: fileParaSubir.size ?? null,
          ancho: null,
          alto: null,
          capturadaEn: null,
          subidaEn: new Date().toISOString(),
          url: tarea.previewUrl,
        };

        onChange((actual) => {
          const seguro = Array.isArray(actual) ? actual : [];
          if (seguro.length >= MAX_EVIDENCIAS) return seguro;
          return [...seguro, simulada];
        });

        setColaSubidas((prev) => prev.filter((t) => t.id !== tarea.id));
        return;
      }

      const firma = modo === 'invitado'
        ? await auditoriasApi.firmarEvidenciaInvitado(token, { carpeta: 'auditorias-5s' })
        : await auditoriasApi.firmarEvidencia({ carpeta: 'auditorias-5s' });

      // 3. Upload direct to Cloudinary
      const data = await subirACloudinary(fileParaSubir, firma);

      // 4. Map response to standard evidence schema
      const nuevaEvidencia = mapearEvidenciaCloudinary(data, fileParaSubir);

      // Update parent list
      onChange((actual) => {
        const seguro = Array.isArray(actual) ? actual : [];
        if (seguro.length >= MAX_EVIDENCIAS) return seguro;
        return [...seguro, nuevaEvidencia];
      });

      // Clear from queue and release resources
      setColaSubidas((prev) => {
        URL.revokeObjectURL(tarea.previewUrl);
        return prev.filter((t) => t.id !== tarea.id);
      });
    } catch (err) {
      setColaSubidas((prev) =>
        prev.map((t) => (t.id === tarea.id ? { ...t, estado: 'error', errorMsg: err?.message || 'Error de subida' } : t))
      );
    } finally {
      activeUploadIdsRef.current.delete(tarea.id);
      setAuditUploadActive(tarea.id, false);
    }
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type?.startsWith('image/'));
    event.target.value = ''; // Clean input to allow re-selection
    if (!files.length || limiteAlcanzado) return;

    const seleccionadas = files.slice(0, restantes);
    if (files.length > restantes) {
      setMensaje(`Solo se agregaron ${restantes} foto${restantes === 1 ? '' : 's'}. El límite es ${MAX_EVIDENCIAS}.`);
    } else {
      setMensaje('');
    }

    const nuevasTareas = seleccionadas.map((file) => {
      const idTemp = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      return {
        id: idTemp,
        file,
        previewUrl,
        estado: 'preparando',
        errorMsg: '',
      };
    });

    setColaSubidas((prev) => [...prev, ...nuevasTareas]);

    // Start uploads concurrently
    nuevasTareas.forEach((tarea) => {
      ejecutarSubida(tarea);
    });
  };

  const reintentar = (id) => {
    const tarea = colaSubidas.find((t) => t.id === id);
    if (!tarea) return;

    setColaSubidas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: 'preparando', errorMsg: '' } : t))
    );

    ejecutarSubida(tarea);
  };

  const quitarCola = (id) => {
    setColaSubidas((prev) => {
      const tarea = prev.find((t) => t.id === id);
      if (tarea?.previewUrl) {
        URL.revokeObjectURL(tarea.previewUrl);
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const quitar = (identificadorCliente) => {
    onChange((actual) => {
      const seguro = Array.isArray(actual) ? actual : [];
      return seguro.filter((evidencia) => evidencia.identificadorCliente !== identificadorCliente);
    });
  };

  const activarInput = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden native file input picker */}
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFiles}
        disabled={limiteAlcanzado}
      />

      {totalActual === 0 ? (
        // No evidence photos uploaded or uploading: Show minimal horizontal layout
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="add_a_photo"
              onClick={activarInput}
              className="rounded-lg h-9 text-xs font-bold border-slate-200 text-slate-700 bg-white"
            >
              Añadir foto
            </Button>
            <span className="text-xs text-slate-500 font-bold">0 / {MAX_EVIDENCIAS}</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Opcional</span>
        </div>
      ) : (
        // One or more evidence photos exist: Show inline list with inline "+" button
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.1em] text-slate-500">
            <span>Evidencia fotográfica <span className="text-[10px] lowercase font-normal italic opacity-75">(opcional)</span></span>
            <span>{totalActual} / {MAX_EVIDENCIAS}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Render completed thumbnails */}
            {thumbnails.map((evidencia) => (
              <div
                key={evidencia.identificadorCliente}
                className="group relative aspect-square w-16 h-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setViewer(evidencia)}
                  className="h-full w-full cursor-zoom-in"
                  aria-label={`Ver ${evidencia.label}`}
                >
                  <img src={evidencia.src} alt={evidencia.label} className="h-full w-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => quitar(evidencia.identificadorCliente)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white shadow hover:bg-slate-900 active:scale-95 transition"
                  aria-label={`Eliminar ${evidencia.label}`}
                >
                  <Icon name="close" size="10px" />
                </button>
              </div>
            ))}

            {/* Render uploading/pending previews */}
            {colaSubidas.map((item) => (
              <div
                key={item.id}
                className="relative aspect-square w-16 h-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm flex items-center justify-center"
              >
                <img src={item.previewUrl} alt="Preview" className="h-full w-full object-cover opacity-45" />

                {item.estado === 'preparando' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5">
                    <Icon name="progress_activity" className="animate-spin text-slate-700" size="xs" />
                    <span className="text-[8px] font-black text-slate-700 mt-1">Prep...</span>
                  </div>
                )}

                {item.estado === 'subiendo' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5">
                    <Icon name="progress_activity" className="animate-spin text-emerald-600" size="xs" />
                    <span className="text-[8px] font-black text-emerald-700 mt-1">Subiendo...</span>
                  </div>
                )}

                {item.estado === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 p-1 text-center">
                    <Icon name="error" className="text-red-500" size="xs" />
                    <button
                      type="button"
                      onClick={() => reintentar(item.id)}
                      className="text-[8px] font-black text-red-700 underline mt-0.5"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => quitarCola(item.id)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/80 text-white shadow hover:bg-slate-900 active:scale-95 transition"
                  aria-label="Cancelar subida"
                >
                  <Icon name="close" size="10px" />
                </button>
              </div>
            ))}

            {/* Render "+" placeholder button if limits not exceeded */}
            {!limiteAlcanzado && (
              <button
                type="button"
                onClick={activarInput}
                className="flex aspect-square w-16 h-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:scale-[0.96] transition"
              >
                <Icon name="add" size="sm" />
              </button>
            )}
          </div>
        </div>
      )}

      {(mensaje || error) && (
        <p className={`px-1 text-xs font-bold ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || mensaje}
        </p>
      )}

      <ImageViewer
        open={Boolean(viewer)}
        src={viewer?.src}
        title={viewer?.label}
        alt={viewer?.label}
        onClose={() => setViewer(null)}
      />
    </div>
  );
}
