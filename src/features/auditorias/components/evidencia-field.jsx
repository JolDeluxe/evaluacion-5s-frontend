import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { auditoriasApi } from '@/features/auditorias/api/auditorias-api';

async function subirACloudinary(file, firma) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', firma.apiKey);
  formData.append('timestamp', firma.timestamp);
  formData.append('signature', firma.signature);
  formData.append('public_id', firma.publicId);
  formData.append('folder', firma.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/auto/upload`, {
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
    tipo: file.type?.startsWith('image/') ? 'FOTO' : 'ARCHIVO',
    publicIdCloudinary: data.public_id,
    assetIdCloudinary: data.asset_id ?? null,
    formato: data.format ?? null,
    tipoMime: file.type || data.resource_type || null,
    bytes: data.bytes ?? file.size ?? null,
    ancho: data.width ?? null,
    alto: data.height ?? null,
    capturadaEn: null,
    subidaEn: new Date().toISOString(),
  };
}

export function EvidenciaField({ evidencias = [], onChange, modo, token, error, preview = false }) {
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (preview) {
      onChange([...evidencias, {
        identificadorCliente: crypto.randomUUID(),
        tipo: file.type?.startsWith('image/') ? 'FOTO' : 'ARCHIVO',
        publicIdCloudinary: `preview/${crypto.randomUUID()}`,
        assetIdCloudinary: null,
        formato: file.name.split('.').pop() ?? null,
        tipoMime: file.type || null,
        bytes: file.size ?? null,
        ancho: null,
        alto: null,
        capturadaEn: null,
        subidaEn: new Date().toISOString(),
      }]);
      setMensaje('Evidencia simulada para vista previa.');
      return;
    }

    setSubiendo(true);
    setMensaje('');
    try {
      const firma = modo === 'invitado'
        ? await auditoriasApi.firmarEvidenciaInvitado(token, { carpeta: 'auditorias-5s' })
        : await auditoriasApi.firmarEvidencia({ carpeta: 'auditorias-5s' });
      const subida = await subirACloudinary(file, firma);
      onChange([...evidencias, mapearEvidenciaCloudinary(subida, file)]);
      setMensaje('Evidencia agregada.');
    } catch (err) {
      setMensaje(err?.message || 'No se pudo subir la evidencia. No se guardo ningun archivo falso.');
    } finally {
      setSubiendo(false);
    }
  };

  const quitar = (publicIdCloudinary) => {
    onChange(evidencias.filter((evidencia) => evidencia.publicIdCloudinary !== publicIdCloudinary));
  };

  return (
    <div className="space-y-3 rounded-3xl border border-dashed border-slate-300/80 bg-white/55 p-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Evidencia requerida</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
          {preview
            ? 'En vista previa la evidencia se conserva solo en memoria.'
            : 'Agrega una fotografía o archivo. La subida se firma en backend y se guarda en Cloudinary.'}
        </p>
      </div>

      <label className="block">
        <input
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="sr-only"
          onChange={handleFile}
          disabled={subiendo}
        />
        <span className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 text-sm font-black uppercase tracking-[0.08em] text-marca-primario shadow-sm shadow-slate-950/5">
          <Icon name={subiendo ? 'progress_activity' : 'add_a_photo'} className={subiendo ? 'animate-spin' : ''} />
          {subiendo ? 'Subiendo...' : 'Agregar evidencia'}
        </span>
      </label>

      {evidencias.length > 0 && (
        <div className="space-y-2">
          {evidencias.map((evidencia) => (
            <div key={evidencia.publicIdCloudinary} className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-800">
              <span className="min-w-0 truncate">{evidencia.publicIdCloudinary}</span>
              <Button type="button" variant="ghost" size="sm" icon="close" onClick={() => quitar(evidencia.publicIdCloudinary)}>
                Quitar
              </Button>
            </div>
          ))}
        </div>
      )}

      {(mensaje || error) && (
        <p className={`px-1 text-xs font-bold ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || mensaje}
        </p>
      )}
    </div>
  );
}
