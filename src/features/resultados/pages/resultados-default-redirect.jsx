import { Navigate, useLocation } from 'react-router';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { getResultadosDefaultPath } from '@/features/resultados/utils/resultados-permissions';

export function ResultadosDefaultRedirect() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Navigate
      to={getResultadosDefaultPath(user?.rol, location.search)}
      replace
    />
  );
}
