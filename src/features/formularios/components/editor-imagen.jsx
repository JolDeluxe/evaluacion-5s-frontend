import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { formulariosApi } from '@/features/formularios/api/formularios-api';
import { buildCloudinaryUrl } from '@/features/auditorias/components/formulario-dinamico.helpers';

async function subirACloudinary(file, firma) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', firma.apiKey);
  formData.append('timestamp', firma.timestamp);
  formData.append('signature', firma.signature);
  formData.append('public_id', firma.publicId);
  formData.append('folder', firma.folder);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`, { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'No se pudo subir la imagen.');
  return data;
}

export function EditorImagen({ versionId, bloque, onChange, readOnly }) {
  const [estado, setEstado] = useState('');
  const configuracion = bloque.configuracion ?? {};
  const src = buildCloudinaryUrl(configuracion);

  const cambiarArchivo = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setEstado('Subiendo imagen...');
    try {
      const firma = await formulariosApi.firmarImagen(versionId, { bloqueClaveEstable: bloque.claveEstable });
      const subida = await subirACloudinary(file, firma);
      onChange({
        configuracion: {
          publicIdCloudinary: subida.public_id,
          alt: configuracion.alt || bloque.etiqueta,
          url: subida.secure_url,
        },
      });
      setEstado('Imagen lista. Recuerda guardar cambios.');
    } catch (error) {
      setEstado(error?.message || 'No se pudo subir la imagen.');
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {src ? <img src={src} alt={configuracion.alt || bloque.etiqueta} className="aspect-video w-full object-cover" /> : (
          <div className="flex aspect-video items-center justify-center text-xs font-black uppercase tracking-[0.12em] text-slate-400">Sin imagen</div>
        )}
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Texto alternativo</Label>
          <Input
            value={configuracion.alt ?? ''}
            disabled={readOnly}
            onChange={(event) => onChange({ configuracion: { ...configuracion, alt: event.target.value } })}
          />
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <label>
              <input type="file" accept="image/*" className="sr-only" onChange={cambiarArchivo} />
              <span className="inline-flex items-center rounded-xl bg-marca-primario px-4 py-2 text-sm font-bold text-white shadow-sm">
                Cambiar imagen
              </span>
            </label>
            <Button variant="ghost" icon="delete" onClick={() => onChange({ configuracion: undefined })}>
              Quitar imagen
            </Button>
          </div>
        )}
        {estado && <p className="text-xs font-bold text-slate-500">{estado}</p>}
      </div>
    </div>
  );
}
