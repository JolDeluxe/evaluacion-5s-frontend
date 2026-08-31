import { useLocation, useParams } from 'react-router';
import { RealizarAuditoriaPage } from '@/features/auditorias/ejecucion/pages/realizar-auditoria-page';

export function InvitadoAuditoriaPage() {
  const { token } = useParams();
  const location = useLocation();
  return <RealizarAuditoriaPage modo="invitado" token={token} nombreInvitado={location.state?.nombreInvitado} />;
}
