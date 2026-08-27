import { Button } from '@/components/ui/button';
import { formatMonthLabel } from '@/features/resultados/utils/resultados-format';

function shiftMonth(monthKey, offset) {
  const [year, month] = monthKey.split('-').map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
}

export function SelectorMes({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="icon"
        size="icon"
        icon="chevron_left"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Mes anterior"
      />

      <label className="min-w-0">
        <span className="sr-only">Mes</span>
        <input
          type="month"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 rounded-lg border border-app-border bg-white px-3 text-sm font-black text-slate-800 shadow-sm outline-none transition focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20"
          aria-label={formatMonthLabel(value)}
        />
      </label>

      <Button
        type="button"
        variant="icon"
        size="icon"
        icon="chevron_right"
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label="Mes siguiente"
      />
    </div>
  );
}
