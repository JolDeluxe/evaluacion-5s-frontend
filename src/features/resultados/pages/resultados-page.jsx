import { useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';

import { ROLES } from '@/config/navigation-config';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useResultadosGeneral } from '@/features/resultados/hooks/use-resultados-general';
import { useListadoResultadosAreas } from '@/features/resultados/hooks/use-listado-resultados-areas';
import { ResultadosDesktop } from '@/features/resultados/views/resultados-desktop';
import { ResultadosMobile } from '@/features/resultados/views/resultados-mobile';
import { ResultadosHeader } from '@/features/resultados/components/shared/resultados-header';
import { ResultadosError, ResultadosLoading } from '@/features/resultados/components/shared/resultados-states';
import { getCurrentMonthKey, normalizeMonthKey } from '@/features/resultados/utils/resultados-format';

const adminRoles = [ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN];

export function ResultadosPage() {
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const navigate = useNavigate();
  const { anio, mes: mesRuta } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const canViewGeneral = adminRoles.includes(user?.rol);
  const activeView = location.pathname.includes('/resultados/general') ? 'general' : 'areas';
  const fallbackMonth = getCurrentMonthKey();

  const tipo = searchParams.get('tipo') || 'mes';
  const mes = normalizeMonthKey(searchParams.get('mes'), fallbackMonth);
  const anioQuery = searchParams.get('anio');
  const trimestreQuery = searchParams.get('trimestre');
  const semestreQuery = searchParams.get('semestre');

  useEffect(() => {
    if (anio && mesRuta) {
      const legacyMonth = `${anio}-${String(mesRuta).padStart(2, '0')}`;
      navigate(`/resultados/${canViewGeneral ? 'general' : 'areas'}?mes=${normalizeMonthKey(legacyMonth)}`, { replace: true });
      return;
    }

    if (activeView === 'areas' && searchParams.get('mes') !== mes) {
      const next = new URLSearchParams(searchParams);
      next.set('mes', mes);
      setSearchParams(next, { replace: true });
    }
  }, [anio, canViewGeneral, mes, mesRuta, navigate, searchParams, setSearchParams, activeView]);

  const targetRoute = canViewGeneral ? 'general' : 'areas';
  const redirectTo = location.pathname === '/resultados'
    ? `/resultados/${targetRoute}?mes=${mes}`
    : (!canViewGeneral && activeView === 'general' ? `/resultados/areas?mes=${mes}` : null);

  const shouldLoadGeneral = activeView === 'general' && canViewGeneral && !redirectTo;
  const shouldLoadAreas = activeView !== 'general' && !redirectTo;
  const generalState = useResultadosGeneral({
    tipo,
    mes,
    anio: anioQuery,
    trimestre: trimestreQuery,
    semestre: semestreQuery,
    enabled: shouldLoadGeneral,
  });
  const areasState = useListadoResultadosAreas({ mes, enabled: shouldLoadAreas });
  const state = activeView === 'general' && canViewGeneral ? generalState : areasState;

  const View = useMemo(() => (isDesktop ? ResultadosDesktop : ResultadosMobile), [isDesktop]);

  const handleMonthChange = (nextMonth) => {
    const next = normalizeMonthKey(nextMonth, mes);
    setSearchParams({ mes: next });
  };

  const handleRangoChange = (newParams) => {
    const params = new URLSearchParams();
    Object.entries(newParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params.set(k, String(v));
      }
    });
    setSearchParams(params);
  };

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <section className="space-y-5">
      <ResultadosHeader
        mes={mes}
        onMesChange={handleMonthChange}
        activeView={activeView}
        canViewGeneral={canViewGeneral}
        rangoParams={{ tipo, mes, anio: anioQuery, trimestre: trimestreQuery, semestre: semestreQuery }}
        onRangoChange={handleRangoChange}
        searchParamsStr={searchParams.toString()}
        data={state.data}
      />

      {state.loading ? (
        <ResultadosLoading />
      ) : state.error ? (
        <ResultadosError message={state.error} />
      ) : (
        <View vista={activeView} data={state.data} mes={mes} canViewGeneral={canViewGeneral} />
      )}
    </section>
  );
}
