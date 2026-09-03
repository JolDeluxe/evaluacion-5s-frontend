import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useResultadoPeriodo } from '@/features/resultados/hooks/use-resultado-periodo';
import { ResultadoPeriodoDesktop } from '@/features/resultados/views/resultado-periodo-desktop';
import { ResultadoPeriodoMobile } from '@/features/resultados/views/resultado-periodo-mobile';
import { ResultadosError, ResultadosLoading } from '@/features/resultados/components/shared/resultados-states';
import { ResultadoBackLink } from '@/features/resultados/components/shared/resultado-back-link';
import { getCurrentMonthKey, normalizeMonthKey } from '@/features/resultados/utils/resultados-format';

export function ResultadoPeriodoPage() {
  const { areaId, periodo } = useParams();
  const isDesktop = useIsDesktop();
  const [searchParams] = useSearchParams();
  const mes = normalizeMonthKey(searchParams.get('mes'), getCurrentMonthKey());
  const { loading, error, data } = useResultadoPeriodo(areaId, periodo, { mes });

  const View = useMemo(() => (isDesktop ? ResultadoPeriodoDesktop : ResultadoPeriodoMobile), [isDesktop]);

  return (
    <section className="space-y-4">
      <div>
        <ResultadoBackLink
          fallbackRoute={`/resultados/areas/${areaId}?mes=${mes}`}
          defaultLabel="Volver a Área"
        />
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
