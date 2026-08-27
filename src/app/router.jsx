import { createBrowserRouter, Navigate } from 'react-router';
import { AppRouteShell } from '@/app/app-route-shell';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { RequireAuth, RequireRole, RedirectIfAuthenticated } from '@/app/route-guards';
import { AUDIT_EXECUTION_ROLES, AUDIT_VIEW_ROLES, BUSINESS_ADMIN_ROLES, ROLES, SYSTEM_ROLES } from '@/config/navigation-config';
import { LoginPage } from '@/features/auth/pages/login-page';
import { InicioPage } from '@/features/inicio/pages/inicio-page';
import { MisAuditoriasPage } from '@/features/asignaciones/pages/mis-auditorias-page';
import { HistorialAuditoriasPage } from '@/features/asignaciones/pages/historial-auditorias-page';
import { AuditoriaDetallePage } from '@/features/auditorias/pages/auditoria-detalle-page';
import { RealizarAuditoriaPage } from '@/features/auditorias/pages/realizar-auditoria-page';
import { AdminPlaceholderPage } from '@/features/admin/pages/admin-placeholder-page';
import { AsignacionesPage } from '@/features/admin/pages/asignaciones-page';
import { AreasPage } from '@/features/areas/pages/areas-page';
import { UsuariosPage } from '@/features/usuarios/pages/usuarios-page';
import { ResultadosPage } from '@/features/resultados/pages/resultados-page';
import { ResultadoAreaPage } from '@/features/resultados/pages/resultado-area-page';
import { ResultadoPeriodoPage } from '@/features/resultados/pages/resultado-periodo-page';
import { NotificacionesPage } from '@/features/notificaciones/pages/notificaciones-page';
import { PerfilPage } from '@/features/perfil/pages/perfil-page';
import { HistorialPage } from '@/features/historial/pages/historial-page';
import { FormulariosPage } from '@/features/formularios/pages/formularios-page';
import { FormularioDetailPage } from '@/features/formularios/pages/formulario-detail-page';
import { FormularioEditorPage } from '@/features/formularios/pages/formulario-editor-page';
import { InvitadoPage } from '@/features/invitados/pages/invitado-page';
import { InvitadoAuditoriaPage } from '@/features/invitados/pages/invitado-auditoria-page';
import { InvitadoAccesoPage } from '@/features/invitados/pages/invitado-acceso-page';
import { ForbiddenPage } from '@/features/errors/pages/forbidden-page';
import { NotFoundPage } from '@/features/errors/pages/not-found-page';

const adminChildren = [
  { index: true, element: <AdminPlaceholderPage type="administracion" section="admin" /> },
  { path: 'asignaciones', element: <AsignacionesPage /> },
  { path: 'asignaciones/:anio/:mes', element: <AsignacionesPage /> },
  { path: 'asignaciones/mensual', element: <Navigate to="/admin/asignaciones" replace /> },
  { path: 'ciclos', element: <AdminPlaceholderPage type="ciclos" section="admin" /> },
  { path: 'formularios', element: <FormulariosPage /> },
  { path: 'formularios/:formularioId', element: <FormularioDetailPage /> },
  { path: 'formularios/:formularioId/editar', element: <FormularioEditorPage /> },
  { path: 'formularios/:formularioId/versiones/:versionId/editar', element: <FormularioEditorPage /> },
  { path: 'areas', element: <AreasPage /> },
  { path: 'areas/:id', element: <AdminPlaceholderPage type="areaDetalle" section="admin" /> },
  { path: 'usuarios', element: <UsuariosPage /> },
  { path: 'resultados', element: <Navigate to="/resultados" replace /> },
  { path: 'aprobaciones', element: <Navigate to="/admin" replace /> },
  { path: 'notificaciones', element: <Navigate to="/admin" replace /> },
  {
    path: 'registros',
    element: <RequireRole roles={SYSTEM_ROLES} />,
    children: [{ index: true, element: <Navigate to="/sistema/registros" replace /> }],
  },
];

export const router = createBrowserRouter([
  {
    element: <AppRouteShell />,
    children: [
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  { path: '/invitado/:token', element: <InvitadoPage /> },
  { path: '/invitado/:token/auditoria', element: <InvitadoAuditoriaPage /> },
  { path: '/invitado', element: <InvitadoAccesoPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/inicio" replace /> },
          { path: '/inicio', element: <InicioPage /> },
          {
            path: '/mis-auditorias',
            element: <RequireRole roles={AUDIT_VIEW_ROLES} />,
            children: [
              { index: true, element: <MisAuditoriasPage /> },
              { path: 'historial', element: <HistorialAuditoriasPage /> },
            ],
          },
          { path: '/auditorias/:id', element: <RequireRole roles={AUDIT_VIEW_ROLES} />, children: [{ index: true, element: <AuditoriaDetallePage /> }] },
          { path: '/auditorias/:id/realizar', element: <RequireRole roles={AUDIT_EXECUTION_ROLES} />, children: [{ index: true, element: <RealizarAuditoriaPage /> }] },
          { path: '/historial', element: <HistorialPage /> },
          {
            path: '/aprobaciones',
            element: <RequireRole roles={BUSINESS_ADMIN_ROLES} />,
            children: [{ index: true, element: <Navigate to="/admin" replace /> }],
          },
          { 
            path: '/resultados', 
            element: <RequireRole roles={[ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.AUDITOR]} />, 
            children: [
              { index: true, element: <ResultadosPage /> },
              { path: 'general', element: <ResultadosPage /> },
              { path: 'areas', element: <ResultadosPage /> },
              { path: 'areas/:areaId', element: <ResultadoAreaPage /> },
              { path: 'areas/:areaId/periodo/:periodo', element: <ResultadoPeriodoPage /> },
              { path: ':anio/:mes', element: <ResultadosPage /> }
            ] 
          },
          { path: '/notificaciones', element: <NotificacionesPage /> },
          { path: '/perfil', element: <PerfilPage /> },
          {
            path: '/admin',
            element: <RequireRole roles={[ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR]} />,
            children: adminChildren,
          },
          {
            path: '/sistema',
            element: <RequireRole roles={[ROLES.SUPER_ADMIN]} />,
            children: [
              { index: true, element: <AdminPlaceholderPage type="sistema" section="system" /> },
              { path: 'sesiones', element: <AdminPlaceholderPage type="sistemaSesiones" section="system" /> },
              { path: 'entregas', element: <AdminPlaceholderPage type="sistemaEntregas" section="system" /> },
              { path: 'registros', element: <AdminPlaceholderPage type="registros" section="system" /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
