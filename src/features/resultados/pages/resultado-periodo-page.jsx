import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useResultadoPeriodo } from '@/features/resultados/hooks/use-resultado-periodo';
import { ResultadoPeriodoDesktop } from '@/features/resultados/views/resultado-periodo-desktop';
import { ResultadoPeriodoMobile } from '@/features/resultados/views/resultado-periodo-mobile';
import { ResultadosError, ResultadosLoading } from '@/features/resultados/components/shared/resultados-states';
import { SelectorMes } from '@/features/resultados/components/shared/selector-mes';
import { ResultadoBackLink } from '@/features/resultados/components/shared/resultado-back-link';
import { getCurrentMonthKey, normalizeMonthKey } from '@/features/resultados/utils/resultados-format';

export function ResultadoPeriodoPage() {
  const { areaId, periodo } = useParams();
  const isDesktop = useIsDesktop();
  const [searchParams, setSearchParams] = useSearchParams();
  const mes = normalizeMonthKey(searchParams.get('mes'), getCurrentMonthKey());
  const { loading, error, data } = useResultadoPeriodo(areaId, periodo, { mes });

  const View = useMemo(() => (isDesktop ? ResultadoPeriodoDesktop : ResultadoPeriodoMobile), [isDesktop]);

  const handleMonthChange = (nextMonth) => {
    setSearchParams({ mes: normalizeMonthKey(nextMonth, mes) });
  };

  return (
    <section className="space-y-4">
      <div className="relative flex w-full items-center justify-center md:justify-between">
        <ResultadoBackLink
          fallbackRoute={`/resultados/areas/${areaId}?mes=${mes}`}
          defaultLabel="Volver a Área"
          className="absolute left-0 md:static"
        />
        <SelectorMes value={mes} onChange={handleMonthChange} />
      </div>

      {loading ? (
        <ResultadosLoading />
      ) : error ? (
        <ResultadosError message={error} />
      ) : data ? (
        <View data={data} areaId={areaId} mes={mes} />
      ) : null}
    </section>
  );
}
