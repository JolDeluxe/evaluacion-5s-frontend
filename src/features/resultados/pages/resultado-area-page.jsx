import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useResultadoArea } from '@/features/resultados/hooks/use-resultado-area';
import { ResultadoAreaDesktop } from '@/features/resultados/views/resultado-area-desktop';
import { ResultadoAreaMobile } from '@/features/resultados/views/resultado-area-mobile';
import { ResultadosError, ResultadosLoading } from '@/features/resultados/components/shared/resultados-states';
import { SelectorMes } from '@/features/resultados/components/shared/selector-mes';
import { ResultadoBackLink } from '@/features/resultados/components/shared/resultado-back-link';
import { getCurrentMonthKey, normalizeMonthKey } from '@/features/resultados/utils/resultados-format';

export function ResultadoAreaPage() {
  const { areaId } = useParams();
  const isDesktop = useIsDesktop();
  const [searchParams, setSearchParams] = useSearchParams();
  const mes = normalizeMonthKey(searchParams.get('mes'), getCurrentMonthKey());
  const { loading, error, data } = useResultadoArea(areaId, { mes });

  const View = useMemo(() => (isDesktop ? ResultadoAreaDesktop : ResultadoAreaMobile), [isDesktop]);

  const handleMonthChange = (nextMonth) => {
    setSearchParams({ mes: normalizeMonthKey(nextMonth, mes) });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
        <div>
          <ResultadoBackLink
            fallbackRoute={`/resultados/areas?mes=${mes}`}
            defaultLabel="Volver a Áreas"
          />
        </div>
        <div className="w-full md:w-auto">
          <SelectorMes value={mes} onChange={handleMonthChange} />
        </div>
      </div>

      {loading ? (
        <ResultadosLoading />
      ) : error ? (
        <ResultadosError message={error} />
      ) : data ? (
        <View data={data} mes={mes} />
      ) : null}
    </section>
  );
}
