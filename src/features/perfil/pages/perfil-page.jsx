import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function PerfilPage() {
  const { user } = useAuth();

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Cuenta</p>
        <h1 className="text-3xl font-black text-slate-950">Perfil</h1>
      </div>
      <Card className="bg-white/75 backdrop-blur-xl">
        <CardBody className="space-y-3">
          <p className="text-xl font-black text-slate-950">{user?.nombre || user?.nombreUsuario || 'Usuario'}</p>
          <p className="text-sm text-slate-600">{user?.correo || 'Sin correo registrado'}</p>
          <Badge status="resuelto" className="bg-marca-primario/10 text-marca-primario shadow-none">
            {user?.rol}
          </Badge>
        </CardBody>
      </Card>
    </section>
  );
}
