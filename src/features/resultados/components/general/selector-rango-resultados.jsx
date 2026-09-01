import { Button } from '@/components/ui/button';
import { SelectorMesNavegacion } from '@/components/ui/selector-mes-navegacion';
import { cn } from '@/utils/cn';

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
    if (tipo === 'trimestre') {
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

  const tipos = [
    { id: 'mes', labelMobile: 'Mes', labelDesktop: 'Mes' },
    { id: 'trimestre', labelMobile: 'Trim.', labelDesktop: 'Trimestre' },
    { id: 'semestre', labelMobile: 'Sem.', labelDesktop: 'Semestre' },
    { id: 'anio', labelMobile: 'Año', labelDesktop: 'Año' },
  ];

  let textRangoNonMes = '';
  if (tipo === 'trimestre') textRangoNonMes = `Trimestre ${triNum} · ${anioNum}`;
  else if (tipo === 'semestre') textRangoNonMes = `Semestre ${semNum} · ${anioNum}`;
  else if (tipo === 'anio') textRangoNonMes = `Año ${anioNum}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full sm:w-auto">
      {/* Botones de Alcance/Tipo */}
      <div className="grid grid-cols-4 sm:flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 shadow-sm w-full sm:w-auto">
        {tipos.map((t) => {
          const isActive = tipo === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTipoChange(t.id)}
              className={cn(
                'rounded-lg py-1 px-1 sm:px-2.5 text-center text-xs font-black transition',
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

      {/* Control temporal */}
      {tipo === 'mes' ? (
        <div className="w-full sm:w-[260px]">
          <SelectorMesNavegacion
            monthKey={mes}
            onChange={({ monthKey }) => onChange({ tipo: 'mes', mes: monthKey })}
          />
        </div>
      ) : (
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 w-full sm:w-[260px]">
          <Button
            type="button"
            variant="icon"
            size="icon"
            icon="chevron_left"
            onClick={() => handleShift(-1)}
            aria-label="Periodo anterior"
            className="h-9 w-9 shrink-0"
          />

          <div className="min-w-0 text-center flex items-center justify-center">
            <span className="h-9 w-full inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-center text-xs md:text-sm font-black text-slate-800 shadow-sm">
              {textRangoNonMes}
            </span>
          </div>

          <Button
            type="button"
            variant="icon"
            size="icon"
            icon="chevron_right"
            onClick={() => handleShift(1)}
            aria-label="Periodo siguiente"
            className="h-9 w-9 shrink-0"
          />
        </div>
      )}
    </div>
  );
}
