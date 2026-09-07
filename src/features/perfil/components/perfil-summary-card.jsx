import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { formatFechaLarga } from '@/utils/format';

const ROLES_MAP = {
  SUPER_ADMIN: 'Super Administrador',
  ADMINISTRADOR: 'Administrador',
  AUDITOR: 'Auditor',
};

export function PerfilSummaryCard({ user }) {
  if (!user) return null;

  const initial = (user.nombre || user.nombreUsuario || 'U').charAt(0).toUpperCase();
  const rolLabel = ROLES_MAP[user.rol] || user.rol || 'Usuario';
  const miembroDesde = formatFechaLarga(user.creadoEn);


  return (
    <Card className="border border-white/70 bg-white/80 shadow-xl backdrop-blur-xl rounded-2xl overflow-hidden">
      <CardBody className="flex flex-col items-center gap-5 p-6 w-full sm:flex-row sm:items-start sm:gap-6">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl border-2 border-white bg-gradient-to-br from-marca-primario to-marca-secundario text-3xl sm:text-4xl font-black text-white shadow-lg">
            {initial}
          </div>
          <span
            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
              user.activo !== false ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
            title={user.activo !== false ? 'Cuenta Activa' : 'Cuenta Inactiva'}
          />
        </div>

        <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left min-w-0 space-y-2 w-full">
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 truncate leading-tight">
              {user.nombre || user.nombreUsuario}
            </h2>
            <p className="text-sm font-medium text-slate-500 truncate mt-0.5">
              @{user.nombreUsuario}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <Badge
              variant="brand"
              className="bg-marca-primario/10 text-marca-primario border-marca-primario/20 font-bold px-3 py-1 text-xs"
            >
              {rolLabel}
            </Badge>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                user.activo !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  user.activo !== false ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {user.activo !== false ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 mt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 min-w-0">
              <Icon name="mail" size="xs" className="text-slate-400 shrink-0" />
              <span className="truncate">{user.correo || 'Sin correo registrado'}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 min-w-0">
              <Icon name="call" size="xs" className="text-slate-400 shrink-0" />
              <span className="truncate">{user.telefonoE164 || 'Sin teléfono registrado'}</span>
            </div>
          </div>

          {miembroDesde && (
            <p className="text-[11px] font-medium text-slate-400 pt-1 flex items-center gap-1">
              <Icon name="calendar_today" size="xs" className="text-slate-400" />
              Miembro desde: {miembroDesde}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
