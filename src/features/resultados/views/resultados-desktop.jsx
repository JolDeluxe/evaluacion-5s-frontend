import { ResultadoAreaRow } from '@/features/resultados/components/area/resultado-area-row';
import { EstadoMesCard } from '@/features/resultados/components/general/estado-mes-card';
import { GanadoresMes } from '@/features/resultados/components/general/ganadores-mes';
import { PeoresDelMes } from '@/features/resultados/components/general/peores-del-mes';
import { TablaResultadosAreas } from '@/features/resultados/components/general/tabla-resultados-areas';
import { TopIncidencias } from '@/features/resultados/components/general/top-incidencias';
import { ResultadosEmpty } from '@/features/resultados/components/shared/resultados-states';
import { Card } from '@/components/ui/card';

export function ResultadosDesktop({ vista, data, mes }) {
  if (!data?.areas?.length) {
    return <ResultadosEmpty />;
  }

  if (vista === 'general') {
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

        {/* 4. TABLA DE ÁREAS */}
        <TablaResultadosAreas areas={data.areas} rango={data.rango} mes={mes} estadoMes={data.estadoMes} />

        {/* 5. PREGUNTAS CON MAYOR INCIDENCIA */}
        <TopIncidencias incidenciasPorTipo={data.incidenciasPorTipo} />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-app-border bg-app-surface-muted/70 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-5 py-3">Área</th>
              <th className="px-5 py-3 text-center">Periodo 1</th>
              <th className="px-5 py-3 text-center">Periodo 2</th>
              <th className="px-5 py-3 text-center">Resultado mensual</th>
              <th className="px-5 py-3 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {data.areas.map((item) => (
              <ResultadoAreaRow key={item.area.id} item={item} mes={mes} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
