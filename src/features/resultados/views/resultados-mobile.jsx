import { ResultadoAreaCard } from '@/features/resultados/components/area/resultado-area-card';
import { EstadoMesCard } from '@/features/resultados/components/general/estado-mes-card';
import { GanadoresMes } from '@/features/resultados/components/general/ganadores-mes';
import { TopIncidencias } from '@/features/resultados/components/general/top-incidencias';
import { ResultadosEmpty } from '@/features/resultados/components/shared/resultados-states';

export function ResultadosMobile({ vista, data, mes }) {
  if (!data?.areas?.length) {
    return <ResultadosEmpty />;
  }

  return (
    <div className="space-y-4">
      {vista === 'general' ? (
        <>
          {/* 1. RESULTADO GENERAL */}
          <EstadoMesCard data={data} />

          {/* 2. GANADORES DEL MES */}
          <GanadoresMes
            ganadoresPorTipo={data.ganadoresPorTipo}
            mostrarResultado={data.estadoMes?.mostrarResultado}
            mensaje={data.mensajeGanadores}
          />

          {/* 3. TABLA DE ÁREAS (tarjetas en móvil) */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 px-1">
              Tabla de áreas
            </h3>
            {data.areas.map((item) => (
              <ResultadoAreaCard key={item.area.id} item={item} mes={mes} />
            ))}
          </div>

          {/* 4. PREGUNTAS CON MAYOR INCIDENCIA */}
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
