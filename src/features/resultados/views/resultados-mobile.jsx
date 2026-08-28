import { ResultadoAreaCard } from '@/features/resultados/components/area/resultado-area-card';
import { EstadoMesCard } from '@/features/resultados/components/general/estado-mes-card';
import { GanadoresMes } from '@/features/resultados/components/general/ganadores-mes';
import { PeoresDelMes } from '@/features/resultados/components/general/peores-del-mes';
import { TopIncidencias } from '@/features/resultados/components/general/top-incidencias';
import { ResultadosEmpty } from '@/features/resultados/components/shared/resultados-states';

import { mapAreasConPosicion } from '@/features/resultados/utils/posicion-areas';

export function ResultadosMobile({ vista, data, mes }) {
  if (!data?.areas?.length) {
    return <ResultadosEmpty />;
  }

  const areasConPosicion = mapAreasConPosicion(data.areas);

  const estadoGeneral = data?.estadoRango ?? data?.estadoMes;
  const tipoRango = data?.rango?.tipo || 'mes';
  const titulosMap = {
    mes: { ganadores: 'Ganadores del mes', peores: 'Peores del mes' },
    trimestre: { ganadores: 'Ganadores del trimestre', peores: 'Peores del trimestre' },
    semestre: { ganadores: 'Ganadores del semestre', peores: 'Peores del semestre' },
    anio: { ganadores: 'Ganadores del año', peores: 'Peores del año' },
  };
  const titulos = titulosMap[tipoRango] || titulosMap.mes;

  return (
    <div className="space-y-4">
      {vista === 'general' ? (
        <>
          {/* 1. RESULTADO GENERAL */}
          <EstadoMesCard data={data} />

          {/* 2. GANADORES */}
          <GanadoresMes
            ganadoresPorTipo={data.ganadoresPorTipo}
            mostrarResultado={estadoGeneral?.mostrarResultado}
            mensaje={data.mensajeGanadores}
            titulo={titulos.ganadores}
          />

          {/* 3. PEORES */}
          <PeoresDelMes
            peoresPorTipo={data.peoresPorTipo}
            mostrarResultado={estadoGeneral?.mostrarResultado}
            mensaje={data.mensajePeores}
            titulo={titulos.peores}
          />

          {/* 4. TABLA DE ÁREAS (tarjetas en móvil) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 px-1">
              Tabla de áreas
            </h3>
            {areasConPosicion.map((item) => (
              <ResultadoAreaCard key={item.area.id} item={item} mes={mes} rango={data.rango} />
            ))}
          </div>

          {/* 5. PREGUNTAS CON MAYOR INCIDENCIA */}
          <TopIncidencias incidenciasPorTipo={data.incidenciasPorTipo} />
        </>
      ) : (
        data.areas.map((item) => (
          <ResultadoAreaCard key={item.area.id} item={item} mes={mes} />
        ))
      )}
    </div>
  );
}
