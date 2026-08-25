import { useParams } from 'react-router';
import { RealizarAuditoriaPage } from '@/features/auditorias/pages/realizar-auditoria-page';

export function InvitadoAuditoriaPage() {
  const { token } = useParams();
  return <RealizarAuditoriaPage modo="invitado" token={token} />;
}
