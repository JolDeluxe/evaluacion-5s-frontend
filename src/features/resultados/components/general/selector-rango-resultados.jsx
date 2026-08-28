import { Button } from '@/components/ui/button';
import { formatMonthLabel } from '@/features/resultados/utils/resultados-format';
import { cn } from '@/utils/cn';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function SelectorRangoResultados({
  tipo = 'mes',
  mes,
  anio,
  trimestre,
  semestre,
  onChange,
}) {
  const anioNum = Number(anio || new Date().getFullYear());
  const triNum = Number(trimestre || 1);
  const semNum = Number(semestre || 1);

  const handleTipoChange = (nuevoTipo) => {
    if (nuevoTipo === tipo) return;
    const ahora = new Date();
    const currAnio = ahora.getFullYear();
    const currMes = ahora.getMonth() + 1;

    if (nuevoTipo === 'mes') {
      const nextMes = `${currAnio}-${String(currMes).padStart(2, '0')}`;
      onChange({ tipo: 'mes', mes: nextMes });
    } else if (nuevoTipo === 'trimestre') {
      const nextTri = Math.ceil(currMes / 3);
      onChange({ tipo: 'trimestre', anio: currAnio, trimestre: nextTri });
    } else if (nuevoTipo === 'semestre') {
      const nextSem = currMes <= 6 ? 1 : 2;
      onChange({ tipo: 'semestre', anio: currAnio, semestre: nextSem });
    } else if (nuevoTipo === 'anio') {
      onChange({ tipo: 'anio', anio: currAnio });
    }
  };

  const handleShift = (offset) => {
    if (tipo === 'mes') {
      const [y, m] = (mes || `${new Date().getFullYear()}-01`).split('-').map(Number);
      const dt = new Date(y, m - 1 + offset, 1);
      const nextClave = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      onChange({ tipo: 'mes', mes: nextClave });
    } else if (tipo === 'trimestre') {
      let nextTri = triNum + offset;
      let nextAnio = anioNum;
      if (nextTri > 4) {
        nextTri = 1;
        nextAnio += 1;
      } else if (nextTri < 1) {
        nextTri = 4;
        nextAnio -= 1;
      }
      onChange({ tipo: 'trimestre', anio: nextAnio, trimestre: nextTri });
    } else if (tipo === 'semestre') {
      let nextSem = semNum + offset;
      let nextAnio = anioNum;
      if (nextSem > 2) {
        nextSem = 1;
        nextAnio += 1;
      } else if (nextSem < 1) {
        nextSem = 2;
        nextAnio -= 1;
      }
      onChange({ tipo: 'semestre', anio: nextAnio, semestre: nextSem });
    } else if (tipo === 'anio') {
      onChange({ tipo: 'anio', anio: anioNum + offset });
    }
  };

  const renderEtiquetaRango = () => {
    if (tipo === 'mes') {
      return (
        <label className="min-w-0">
          <span className="sr-only">Mes</span>
          <input
            type="month"
            value={mes}
            onChange={(e) => onChange({ tipo: 'mes', mes: e.target.value })}
            className="h-9 rounded-lg border border-app-border bg-white px-3 text-xs md:text-sm font-black text-slate-800 shadow-sm outline-none transition focus:border-marca-secundario focus:ring-2 focus:ring-marca-secundario/20"
            aria-label={formatMonthLabel(mes)}
          />
        </label>
      );
    }

    let text = '';
    if (tipo === 'trimestre') text = `Trimestre ${triNum} · ${anioNum}`;
    else if (tipo === 'semestre') text = `Semestre ${semNum} · ${anioNum}`;
    else if (tipo === 'anio') text = `Año ${anioNum}`;

    return (
      <span className="h-9 inline-flex items-center rounded-lg border border-app-border bg-white px-3 text-xs md:text-sm font-black text-slate-800 shadow-sm">
        {text}
      </span>
    );
  };

  const tipos = [
    { id: 'mes', labelMobile: 'Mes', labelDesktop: 'Mes' },
    { id: 'trimestre', labelMobile: 'Trim.', labelDesktop: 'Trimestre' },
    { id: 'semestre', labelMobile: 'Sem.', labelDesktop: 'Semestre' },
    { id: 'anio', labelMobile: 'Año', labelDesktop: 'Año' },
  ];

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {/* Botones de Alcance/Tipo */}
      <div className="inline-flex rounded-lg border border-app-border bg-slate-100/80 p-0.5 shadow-sm">
        {tipos.map((t) => {
          const isActive = tipo === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTipoChange(t.id)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-black transition',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800',
              )}
            >
              <span className="sm:hidden">{t.labelMobile}</span>
              <span className="hidden sm:inline">{t.labelDesktop}</span>
            </button>
          );
        })}
      </div>

      {/* Flechas y etiqueta de rango */}
      <div className="flex items-center gap-1.5 justify-end">
        <Button
          type="button"
          variant="icon"
          size="icon"
          icon="chevron_left"
          onClick={() => handleShift(-1)}
          aria-label="Periodo anterior"
          className="h-9 w-9"
        />

        {renderEtiquetaRango()}

        <Button
          type="button"
          variant="icon"
          size="icon"
          icon="chevron_right"
          onClick={() => handleShift(1)}
          aria-label="Periodo siguiente"
          className="h-9 w-9"
        />
      </div>
    </div>
  );
}
