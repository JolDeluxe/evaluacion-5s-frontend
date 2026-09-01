import { Button } from '@/components/ui/button';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatMonthLabel(value) {
  if (!value) return '';
  const [yearStr, monthStr] = String(value).split('-');
  const m = Number(monthStr);
  if (Number.isNaN(m) || m < 1 || m > 12) return value;
  return `${MESES[m - 1]} ${yearStr}`;
}


function shiftMonthKey(monthKey, offset) {
  const [year, month] = monthKey.split('-').map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
}

export function SelectorMesNavegacion({
  anio,
  mes,
  onChange,
  monthKey,
  className,
}) {
  const currentKey = monthKey ?? `${anio}-${String(mes).padStart(2, '0')}`;

  const handleShift = (offset) => {
    const nextKey = shiftMonthKey(currentKey, offset);
    const [y, m] = nextKey.split('-').map(Number);
    onChange({ anio: y, mes: m, monthKey: nextKey });
  };

  const handleMonthInputChange = (event) => {
    const val = event.target.value;
    if (!val) return;
    const [y, m] = val.split('-').map(Number);
    onChange({ anio: y, mes: m, monthKey: val });
  };

  return (
    <div className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-2 w-full ${className || ''}`}>
      <Button
        type="button"
        variant="icon"
        size="icon"
        icon="chevron_left"
        onClick={() => handleShift(-1)}
        aria-label="Mes anterior"
        className="h-9 w-9 shrink-0"
      />

      <label className="w-full min-w-0 text-center flex items-center justify-center">
        <span className="sr-only">Seleccionar mes</span>
        <input
          type="month"
          value={currentKey}
          onChange={handleMonthInputChange}
          className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-center text-xs md:text-sm font-black text-slate-800 shadow-sm outline-none transition focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20 cursor-pointer"
          aria-label={formatMonthLabel(currentKey)}
        />
      </label>

      <Button
        type="button"
        variant="icon"
        size="icon"
        icon="chevron_right"
        onClick={() => handleShift(1)}
        aria-label="Mes siguiente"
        className="h-9 w-9 shrink-0"
      />
    </div>
  );
}