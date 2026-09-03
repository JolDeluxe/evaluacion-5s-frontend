import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';

export function ResultadoBackLink({ fallbackRoute, defaultLabel, className = '' }) {
  const location = useLocation();
  const backTo = location.state?.from || fallbackRoute;
  const rawLabel = location.state?.fromLabel ? `Volver a ${location.state.fromLabel}` : defaultLabel;

  return (
    <Button
      as={Link}
      to={backTo}
      variant="ghost"
      size="sm"
      icon="arrow_back"
      className={`text-slate-600 hover:text-slate-900 -ml-2 text-xs font-bold ${className}`}
    >
      {rawLabel}
    </Button>
  );
}
