import { Link, useNavigate, useParams, useSearchParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { useResultadosArea } from '@/features/resultados/hooks/use-resultados-area';
import { ResumenArea } from '@/features/resultados/components/area/resumen-area';
import { ResultadoPeriodoCard } from '@/features/resultados/components/area/resultado-periodo-card';
import { ResultadosError, ResultadosLoading } from '@/features/resultados/components/shared/resultados-states';
import { SelectorMes } from '@/features/resultados/components/shared/selector-mes';
import { getCurrentMonthKey, normalizeMonthKey } from '@/features/resultados/utils/resultados-format';

export function ResultadoAreaPage() {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mes = normalizeMonthKey(searchParams.get('mes'), getCurrentMonthKey());
  const { loading, error, data } = useResultadosArea(areaId, { mes });

  const handleMonthChange = (nextMonth) => {
    setSearchParams({ mes: normalizeMonthKey(nextMonth, mes) });
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          type="button"
          variant="soft"
          size="sm"
          icon="arrow_back"
          onClick={() => navigate(`/resultados/areas?mes=${mes}`)}
        >
          Áreas
        </Button>
        <SelectorMes value={mes} onChange={handleMonthChange} />
      </div>

      {loading ? (
        <ResultadosLoading />
      ) : error ? (
        <ResultadosError message={error} />
      ) : data ? (
        <>
          <ResumenArea data={data} />
          <div className="grid gap-3 md:grid-cols-2">
            {data.periodos.map((periodo) => (
              <ResultadoPeriodoCard
                key={periodo.periodo}
                areaId={data.area.id}
                mes={mes}
                periodo={periodo}
              />
            ))}
          </div>
          <Button
            as={Link}
            to={`/resultados/areas?mes=${mes}`}
            variant="outline"
            size="sm"
            icon="list"
            className="md:hidden"
          >
            Volver a áreas
          </Button>
        </>
      ) : null}
    </section>
  );
}
