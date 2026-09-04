import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function PerfilPage() {
  const { user } = useAuth();
  const initial = (user?.nombre || user?.nombreUsuario || 'U').charAt(0).toUpperCase();

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Cuenta</p>
        <h1 className="text-3xl font-black text-slate-950">Perfil</h1>
      </div>
      <Card className="border-white/70 bg-white/80 shadow-xl backdrop-blur-2xl rounded-2xl">
        <CardBody className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-marca-secundario text-2xl font-black text-white shadow-md">
              {initial}
            </div>
            <div className="space-y-1 min-w-0">
              <h2 className="text-xl font-black text-slate-950 truncate">{user?.nombre || user?.nombreUsuario || 'Usuario'}</h2>
              <p className="text-xs font-medium text-slate-600 truncate">{user?.correo || 'Sin correo registrado'}</p>
              <Badge status="resuelto" className="bg-marca-primario/10 text-marca-primario border border-marca-primario/20 shadow-none">
                {user?.rol}
              </Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
