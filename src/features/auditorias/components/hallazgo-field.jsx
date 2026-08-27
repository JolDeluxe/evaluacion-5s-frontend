import { Label } from '@/components/form/label';

export function HallazgoField({ value, onChange, error }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="hallazgo-auditoria" error={Boolean(error)}>
        Hallazgo detectado
      </Label>
      <textarea
        id="hallazgo-auditoria"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-none rounded-3xl border border-slate-200/80 bg-white/75 px-4 py-3 text-base md:text-sm font-semibold leading-6 text-slate-800 outline-none shadow-inner shadow-slate-950/5 transition focus:border-marca-secundario/60 focus:ring-4 focus:ring-marca-secundario/10"
        placeholder="Describe lo encontrado en el área"
      />
      {error && <p className="px-1 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
