import { Badge } from '@/components/ui/badge';

export function InicioHeader({ user, esAdmin, etiquetaMesControl }) {
  const nombre = user?.nombre || user?.nombreUsuario || 'bienvenido';
  const rolLabel = user?.rol || 'USUARIO';

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:p-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge status="resuelto" className="bg-marca-primario/10 text-marca-primario shadow-none font-bold">
            {rolLabel}
          </Badge>
        </div>
        <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
          Hola, {nombre}.
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          {esAdmin
            ? `Estado de las auditorías de ${etiquetaMesControl || 'este mes'}.`
            : `Consulta tus auditorías y resultados de ${etiquetaMesControl || 'este mes'}.`}
        </p>
      </div>
    </div>
  );
}
