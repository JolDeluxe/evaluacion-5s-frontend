export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMINISTRADOR: 'ADMINISTRADOR',
  AUDITOR: 'AUDITOR',
};

export const ACCOUNT_ROLES = Object.values(ROLES);
export const AUDIT_VIEW_ROLES = ACCOUNT_ROLES;
export const AUDIT_EXECUTION_ROLES = [ROLES.AUDITOR, ROLES.ADMINISTRADOR];
export const BUSINESS_ADMIN_ROLES = [ROLES.ADMINISTRADOR, ROLES.SUPER_ADMIN];
export const RESULTS_ROLES = ACCOUNT_ROLES;
export const SYSTEM_ROLES = [ROLES.SUPER_ADMIN];

const mobileBottomByRole = {
  [ROLES.AUDITOR]: ['inicio', 'mis-auditorias', 'resultados', 'notificaciones'],
  [ROLES.ADMINISTRADOR]: ['inicio', 'mis-auditorias', 'resultados', 'admin'],
  [ROLES.SUPER_ADMIN]: ['inicio', 'mis-auditorias', 'resultados'],
};

const mobileMoreByRole = {
  [ROLES.SUPER_ADMIN]: ['admin', 'sistema'],
};

export const NAVIGATION_CONFIG = [
  {
    id: 'inicio',
    name: 'Inicio',
    icon: 'home',
    route: '/inicio',
    allowedRoles: ACCOUNT_ROLES,
    placement: ['desktop'],
    mobilePriority: 1,
  },
  {
    id: 'mis-auditorias',
    name: 'Auditorías',
    icon: 'assignment',
    route: '/mis-auditorias',
    allowedRoles: AUDIT_VIEW_ROLES,
    placement: ['desktop'],
    mobilePriority: 2,
  },
  {
    id: 'resultados',
    name: 'Resultados',
    icon: 'monitoring',
    route: '/resultados',
    allowedRoles: RESULTS_ROLES,
    placement: ['desktop'],
    mobilePriority: 3,
  },
  {
    id: 'notificaciones',
    name: 'Notificaciones',
    icon: 'notifications',
    route: '/notificaciones',
    allowedRoles: [ROLES.AUDITOR, ROLES.ADMINISTRADOR],
    placement: ['desktop'],
    mobilePriority: 4,
  },
  {
    id: 'admin',
    name: 'Administración',
    icon: 'admin_panel_settings',
    route: '/admin',
    allowedRoles: BUSINESS_ADMIN_ROLES,
    placement: ['desktop'],
    mobilePriority: 4,
  },
  {
    id: 'sistema',
    name: 'Sistema',
    icon: 'settings',
    route: '/sistema',
    allowedRoles: SYSTEM_ROLES,
    placement: ['desktop'],
    mobilePriority: 5,
  },
  {
    id: 'perfil',
    name: 'Perfil',
    icon: 'account_circle',
    route: '/perfil',
    allowedRoles: ACCOUNT_ROLES,
    placement: ['user-menu'],
    hideInMenu: true,
  },
];

export const ADMIN_NAVIGATION = [
  {
    id: 'admin-asignaciones',
    name: 'Asignaciones',
    icon: 'assignment_ind',
    route: '/admin/asignaciones',
    allowedRoles: BUSINESS_ADMIN_ROLES,
  },
  {
    id: 'admin-ciclos',
    name: 'Ciclos',
    icon: 'event_repeat',
    route: '/admin/ciclos',
    allowedRoles: BUSINESS_ADMIN_ROLES,
  },
  {
    id: 'admin-formularios',
    name: 'Formularios',
    icon: 'dynamic_form',
    route: '/admin/formularios',
    allowedRoles: BUSINESS_ADMIN_ROLES,
  },
  {
    id: 'admin-areas',
    name: 'Áreas',
    icon: 'corporate_fare',
    route: '/admin/areas',
    allowedRoles: BUSINESS_ADMIN_ROLES,
  },
  {
    id: 'admin-usuarios',
    name: 'Usuarios',
    icon: 'group',
    route: '/admin/usuarios',
    allowedRoles: BUSINESS_ADMIN_ROLES,
  },
];

export const SYSTEM_NAVIGATION = [
  {
    id: 'sistema-sesiones',
    name: 'Sesiones',
    icon: 'devices',
    route: '/sistema/sesiones',
    allowedRoles: SYSTEM_ROLES,
  },
  {
    id: 'sistema-entregas',
    name: 'Entregas',
    icon: 'outbox',
    route: '/sistema/entregas',
    allowedRoles: SYSTEM_ROLES,
  },
  {
    id: 'sistema-registros',
    name: 'Registro técnico',
    icon: 'fact_check',
    route: '/sistema/registros',
    allowedRoles: SYSTEM_ROLES,
  },
];

export const ROUTE_META = [
  ...NAVIGATION_CONFIG,
  ...ADMIN_NAVIGATION,
  ...SYSTEM_NAVIGATION,
  { id: 'admin-resultados-redirect', name: 'Resultados', route: '/admin/resultados', allowedRoles: BUSINESS_ADMIN_ROLES },
  { id: 'admin-aprobaciones-redirect', name: 'Administración', route: '/admin/aprobaciones', allowedRoles: BUSINESS_ADMIN_ROLES },
  { id: 'admin-notificaciones-redirect', name: 'Administración', route: '/admin/notificaciones', allowedRoles: BUSINESS_ADMIN_ROLES },
  { id: 'admin-registros-redirect', name: 'Registro técnico', route: '/admin/registros', allowedRoles: SYSTEM_ROLES },
  { id: 'historial', name: 'Historial', route: '/historial', allowedRoles: ACCOUNT_ROLES },
  { id: 'aprobaciones-legacy', name: 'Administración', route: '/aprobaciones', allowedRoles: BUSINESS_ADMIN_ROLES },
  { id: 'auditoria-detalle', name: 'Detalle de auditoría', route: '/auditorias', allowedRoles: AUDIT_VIEW_ROLES },
];

export function canRoleAccess(userRole, item) {
  return Boolean(userRole && item.allowedRoles?.includes(userRole));
}

export function getHomeForRole() {
  return '/inicio';
}

export function getNavigationByRole(userRole, placement) {
  return NAVIGATION_CONFIG
    .filter((item) => canRoleAccess(userRole, item))
    .filter((item) => {
      if (placement === 'mobile-bottom') {
        const ids = mobileBottomByRole[userRole];
        return Boolean(ids?.includes(item.id));
      }
      if (placement === 'mobile-more') {
        const ids = mobileMoreByRole[userRole];
        return Boolean(ids?.includes(item.id));
      }
      return true;
    })
    .filter((item) => !item.hideInMenu)
    .filter((item) => {
      if (placement === 'mobile-bottom' || placement === 'mobile-more') return true;
      return !placement || item.placement?.includes(placement);
    })
    .sort((a, b) => (a.mobilePriority ?? 99) - (b.mobilePriority ?? 99));
}

export function getAdminNavigationByRole(userRole) {
  return ADMIN_NAVIGATION.filter((item) => canRoleAccess(userRole, item));
}

export function getSystemNavigationByRole(userRole) {
  return SYSTEM_NAVIGATION.filter((item) => canRoleAccess(userRole, item));
}

export function getRouteTitle(pathname) {
  const item = ROUTE_META
    .filter((entry) => entry.route && pathname.startsWith(entry.route))
    .sort((a, b) => b.route.length - a.route.length)[0];

  return item?.name || 'Encuestas 5S';
}
