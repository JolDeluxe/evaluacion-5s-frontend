import { useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';

const normalizar = (valor) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function AreaMultiSelect({ areas = [], value = [], onChange, labelId }) {
  const [open, setOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef(null);
  const seleccionadasSet = useMemo(() => new Set(value.map(String)), [value]);
  const areasOrdenadas = useMemo(
    () => [...areas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [areas],
  );
  const seleccionadas = useMemo(
    () => areasOrdenadas.filter((area) => seleccionadasSet.has(String(area.id))),
    [areasOrdenadas, seleccionadasSet],
  );
  const areasFiltradas = useMemo(() => {
    const texto = normalizar(busqueda.trim());
    if (!texto) return areasOrdenadas;
    return areasOrdenadas.filter((area) => normalizar(area.nombre).includes(texto));
  }, [areasOrdenadas, busqueda]);

  const toggleArea = (areaId) => {
    const id = String(areaId);
    if (seleccionadasSet.has(id)) {
      onChange(value.filter((actual) => String(actual) !== id));
      return;
    }
    onChange([...value.map(String), id]);
  };

  const quitarArea = (areaId) => {
    const id = String(areaId);
    onChange(value.filter((actual) => String(actual) !== id));
  };

  return (
    <div className="relative space-y-2">
      {open && (
        <div className="absolute bottom-full left-0 right-0 z-[120] mb-2 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <Icon name="search" size="18px" />
            </span>
            <input
              ref={inputRef}
              type="search"
              aria-label="Buscar área"
              value={busqueda}
              placeholder="Buscar área..."
              onChange={(event) => setBusqueda(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-semibold text-slate-900 outline-none focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20"
            />
          </div>
          <div className="mt-2 max-h-[min(16rem,38vh)] overflow-y-auto pr-1">
            {areasFiltradas.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs font-bold text-slate-400">Sin áreas con esa búsqueda.</p>
            ) : (
              <div className="space-y-1">
                {areasFiltradas.map((area) => {
                  const checked = seleccionadasSet.has(String(area.id));
                  return (
                    <label
                      key={area.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50',
                        checked && 'bg-marca-secundario/10 text-slate-950',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleArea(area.id)}
                        className="rounded text-marca-primario focus:ring-marca-primario/30"
                      />
                      <span>{area.nombre}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {seleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {seleccionadas.map((area) => (
            <button
              key={area.id}
              type="button"
              onClick={() => quitarArea(area.id)}
              className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800"
            >
              <span className="truncate">{area.nombre}</span>
              <Icon name="close" size="14px" className="shrink-0 text-slate-500" />
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-labelledby={labelId}
        aria-expanded={open}
        onClick={() => {
          setOpen((actual) => !actual);
          window.setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-marca-secundario/30"
      >
        <span>{seleccionadas.length ? `Seleccionadas: ${seleccionadas.length}` : 'Seleccionar áreas'}</span>
        <Icon name={open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size="20px" className="shrink-0 text-slate-400" />
      </button>
    </div>
  );
}
