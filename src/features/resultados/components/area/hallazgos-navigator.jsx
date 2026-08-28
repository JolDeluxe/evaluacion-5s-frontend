import { Button } from '@/components/ui/button';

export function HallazgosNavigator({ total, current, onChange }) {
  if (total <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-app-border bg-white px-3.5 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          Hallazgos
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-700">
          {current + 1} de {total}
        </span>
      </div>

      {total > 1 && (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="soft"
            size="sm"
            icon="chevron_left"
            onClick={() => onChange((current - 1 + total) % total)}
            aria-label="Hallazgo anterior"
          />
          <Button
            type="button"
            variant="soft"
            size="sm"
            icon="chevron_right"
            onClick={() => onChange((current + 1) % total)}
            aria-label="Hallazgo siguiente"
          />
        </div>
      )}
    </div>
  );
}
