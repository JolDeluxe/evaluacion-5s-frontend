import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { formatFechaLarga, formatFechaHora } from '@/utils/format';

const ROLES_MAP = {
  SUPER_ADMIN: 'Super Administrador',
  ADMINISTRADOR: 'Administrador',
  AUDITOR: 'Auditor',
};

function InfoBlock({ label, value, icon, readOnly = false }) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50/70 border border-slate-100 relative group transition-colors hover:bg-slate-50 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {readOnly && (
          <span title="Campo de solo lectura">
            <Icon
              name="lock"
              size="xs"
              className="text-slate-300 opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5 min-w-0">
        {icon && <Icon name={icon} size="xs" className="text-slate-400 shrink-0" />}
        <span className="text-sm text-slate-900 font-semibold truncate">
          {value || 'No registrado'}
        </span>
      </div>
    </div>
  );
}

export function PerfilInfoCard({ user }) {
  if (!user) return null;

  const rolLabel = ROLES_MAP[user.rol] || user.rol || 'Usuario';
  const ultimoLogin = formatFechaHora(user.ultimoInicioSesionEn);
  const cambioPass = formatFechaHora(user.contrasenaCambiadaEn);
  const fechaMiembro = formatFechaLarga(user.creadoEn);

  return (
    <div className="space-y-8">
      {/* Sección 1: Datos de Contacto */}
      <div>
        <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Icon name="badge" size="sm" className="text-marca-primario" />
          Información de la Cuenta y Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoBlock label="Nombre Completo" value={user.nombre} icon="person" />
          <InfoBlock
            label="Nombre de Usuario (Login)"
            value={`@${user.nombreUsuario}`}
            icon="alternate_email"
            readOnly
          />
          <InfoBlock label="Correo Electrónico" value={user.correo} icon="mail" />
          <InfoBlock label="Teléfono de Contacto" value={user.telefonoE164} icon="call" />
          {fechaMiembro && (
            <div className="md:col-span-2">
              <InfoBlock
                label="Miembro desde"
                value={fechaMiembro}
                icon="calendar_today"
                readOnly
              />
            </div>
          )}
        </div>
      </div>


      {/* Sección 2: Seguridad y Roles */}
      <div>
        <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-wide">
          <Icon name="shield" size="sm" className="text-marca-primario" />
          Seguridad y Nivel de Acceso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50/70 border border-slate-100 relative group transition-colors hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Rol en Sistema
              </span>
              <Icon name="lock" size="xs" className="text-slate-300 opacity-60" />
            </div>
            <div className="mt-1">
              <Badge
                variant="brand"
                className="bg-marca-primario/10 text-marca-primario border-marca-primario/20 font-bold text-xs"
              >
                {rolLabel}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-slate-50/70 border border-slate-100 relative group transition-colors hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Estado de la Cuenta
              </span>
            </div>
            <div className="mt-1">
              <Badge
                status={user.activo !== false ? 'resuelto' : 'cancelada'}
                className="text-xs font-bold"
              >
                {user.activo !== false ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              </Badge>
            </div>
          </div>

          <InfoBlock
            label="Último Inicio de Sesión"
            value={ultimoLogin || 'No registrado'}
            icon="login"
            readOnly
          />

          <InfoBlock
            label="Último Cambio de Contraseña"
            value={cambioPass || 'No registrado'}
            icon="password"
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
