import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';

export function QrAuditoria({ area, onVerify, onSkip }) {
  const [codigo, setCodigo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verificar = async () => {
    setLoading(true);
    setError('');
    try {
      await onVerify(codigo);
    } catch (err) {
      setError(err?.message || 'El QR no pudo verificarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5 rounded-[2rem] border border-white/75 bg-white/75 p-5 shadow-2xl shadow-slate-950/8 backdrop-blur-2xl">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-marca-acento">Verificacion de area</p>
        <h1 className="mt-2 text-3xl font-black leading-none text-slate-950">{area?.nombre ?? 'Area'}</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Escanea o pega el contenido del QR del area antes de iniciar la evaluacion.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="codigoQrAuditoria">Codigo QR</Label>
        <Input
          id="codigoQrAuditoria"
          value={codigo}
          onChange={(event) => setCodigo(event.target.value)}
          placeholder="Contenido del QR"
        />
      </div>

      {error && (
        <div className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-bold text-amber-900">{error}</p>
          <div className="space-y-2">
            <Label htmlFor="motivoQr">Motivo para continuar sin verificacion</Label>
            <Input
              id="motivoQr"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              placeholder="Describe el motivo"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            icon="warning"
            disabled={!motivo.trim()}
            onClick={() => onSkip({ codigoQr: codigo.trim() || undefined, motivoSinVerificacion: motivo.trim() })}
          >
            Continuar con motivo
          </Button>
        </div>
      )}

      <Button type="button" size="lg" icon="qr_code_scanner" className="min-h-14 w-full rounded-2xl" isLoading={loading} disabled={!codigo.trim()} onClick={verificar}>
        Verificar QR
      </Button>
    </section>
  );
}
