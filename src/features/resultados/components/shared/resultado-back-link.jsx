import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

export function ResultadoBackLink({ fallbackRoute, defaultLabel, useHistoryBack = false, className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const backTo = location.state?.from || fallbackRoute;
  const rawLabel = location.state?.fromLabel ? `Volver a ${location.state.fromLabel}` : defaultLabel;

  if (useHistoryBack) {
    return (
      <Button
        variant="ghost"
        size="sm"
        icon="arrow_back"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate(backTo);
          }
        }}
        className={`text-slate-600 hover:text-slate-900 -ml-2 text-xs font-bold ${className}`}
      >
        {rawLabel}
      </Button>
    );
  }

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
