import { Link, useLocation } from 'react-router';
import { Card, CardBody } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/utils/cn';
import { getAdminNavigationByRole, getSystemNavigationByRole } from '@/config/navigation-config';

const copy = {
  administracion: ['Administración', 'Herramientas de negocio para operar auditorías 5S.'],
  asignaciones: ['Asignaciones', 'Administración de auditores, áreas y vencimientos.'],
  ciclos: ['Ciclos de auditoría', 'Planeación mensual, publicación y cierre de cortes.'],
  formularios: ['Formularios', 'Constructor y control de versiones de formatos 5S.'],
  formularioDetalle: ['Detalle de formulario', 'Edición de versión, bloques, reglas y publicación.'],
  areas: ['Áreas', 'Catálogo administrativo/operativo. El QR vive dentro del detalle del área.'],
  areaDetalle: ['Detalle de área', 'Configuración, responsables, aprobadores y QR del área.'],
  usuarios: ['Usuarios', 'Alta, roles, estado y asignación de áreas.'],
  resultados: ['Resultados', 'Consulta ejecutiva de auditorías recibidas y publicadas.'],
  sistema: ['Sistema', 'Operación técnica y monitoreo exclusivo de plataforma.'],
  sistemaSesiones: ['Sesiones', 'Sesiones activas y revocación controlada.'],
  sistemaEntregas: ['Entregas', 'Seguimiento técnico de entregas de notificaciones.'],
  registros: ['Registro de actividad', 'Auditoría técnica de cambios relevantes del sistema.'],
};

function SecondaryNavigation({ items, title }) {
  const location = useLocation();

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const isActive = location.pathname === item.route || location.pathname.startsWith(`${item.route}/`);
          return (
            <Link
              key={item.id}
              to={item.route}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-4 shadow-sm transition',
                isActive
                  ? 'border-marca-acento/30 bg-marca-acento text-white shadow-marca-primario/15'
                  : 'border-white/70 bg-white/75 text-slate-700 backdrop-blur-xl hover:bg-white',
              )}
            >
              <span className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                isActive ? 'bg-white/20 text-white' : 'bg-marca-primario/10 text-marca-primario',
              )}
              >
                <Icon name={item.icon} />
              </span>
              <span className="min-w-0 text-sm font-black">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdministracionPlaceholderPage({ type = 'administracion', section = 'admin' }) {
  const { user } = useAuth();
  const [title, description] = copy[type] || copy.administracion;
  const isSystemSection = section === 'system';
  const navItems = section === 'system'
    ? getSystemNavigationByRole(user?.rol)
    : getAdminNavigationByRole(user?.rol);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
          {isSystemSection ? 'Sistema' : 'Administración'}
        </p>
        <h1 className="text-3xl font-black text-slate-950">{title}</h1>
      </div>

      <Card className="border-white/70 bg-white/75 backdrop-blur-xl">
        <CardBody className="flex items-start gap-4 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-marca-primario/10 text-marca-primario">
            <Icon name={isSystemSection ? 'settings' : 'admin_panel_settings'} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Shell listo</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </CardBody>
      </Card>

      <SecondaryNavigation
        items={navItems}
        title={isSystemSection ? 'Herramientas de sistema' : 'Herramientas administrativas'}
      />
    </section>
  );
}
