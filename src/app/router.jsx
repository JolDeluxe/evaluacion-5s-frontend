import { createBrowserRouter, Navigate } from 'react-router';
import { AppRouteShell } from '@/app/app-route-shell';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { RequireAuth, RequireRole, RedirectIfAuthenticated } from '@/app/route-guards';
import { AUDIT_EXECUTION_ROLES, AUDIT_VIEW_ROLES, BUSINESS_ADMIN_ROLES, ROLES, SYSTEM_ROLES } from '@/config/navigation-config';
import { LoginPage } from '@/features/auth/pages/login-page';
import { InicioPage } from '@/features/inicio/pages/inicio-page';
import { MisAuditoriasPage } from '@/features/auditorias/por-realizar/pages/mis-auditorias-page';
import { HistorialAuditoriasPage } from '@/features/auditorias/historial/pages/historial-auditorias-page';
import { AuditoriaDetallePage } from '@/features/auditorias/ejecucion/pages/auditoria-detalle-page';
import { RealizarAuditoriaPage } from '@/features/auditorias/ejecucion/pages/realizar-auditoria-page';
import { AdministracionPlaceholderPage } from '@/features/administracion/pages/administracion-placeholder-page';
import { AsignacionesPage } from '@/features/administracion/asignaciones/pages/asignaciones-page';
import { AreasPage } from '@/features/administracion/areas/pages/areas-page';
import { UsuariosPage } from '@/features/administracion/usuarios/pages/usuarios-page';
import { ResultadosPage } from '@/features/resultados/pages/resultados-page';
import { ResultadoAreaPage } from '@/features/resultados/pages/resultado-area-page';
import { ResultadoPeriodoPage } from '@/features/resultados/pages/resultado-periodo-page';
import { NotificacionesPage } from '@/features/notificaciones/pages/notificaciones-page';
import { PerfilPage } from '@/features/perfil/pages/perfil-page';
import { FormulariosPage } from '@/features/administracion/formularios/pages/formularios-page';
import { FormularioDetailPage } from '@/features/administracion/formularios/pages/formulario-detail-page';
import { FormularioEditorPage } from '@/features/administracion/formularios/pages/formulario-editor-page';
import { InvitadoPage } from '@/features/invitados/pages/invitado-page';
import { InvitadoAuditoriaPage } from '@/features/invitados/pages/invitado-auditoria-page';
import { InvitadoAccesoPage } from '@/features/invitados/pages/invitado-acceso-page';
import { ForbiddenPage } from '@/features/errors/pages/forbidden-page';
import { NotFoundPage } from '@/features/errors/pages/not-found-page';

import { AdministracionLayoutPage } from '@/features/administracion/pages/administracion-layout-page';

const adminChildren = [
  { index: true, element: <Navigate to="/admin/asignaciones" replace /> },
  { path: 'asignaciones', element: <AsignacionesPage /> },
  { path: 'asignaciones/:anio/:mes', element: <AsignacionesPage /> },
  { path: 'asignaciones/mensual', element: <Navigate to="/admin/asignaciones" replace /> },
  { path: 'ciclos', element: <Navigate to="/admin/asignaciones" replace /> },
  { path: 'formularios', element: <FormulariosPage /> },
  { path: 'formularios/:formularioId', element: <FormularioDetailPage /> },
  { path: 'formularios/:formularioId/editar', element: <FormularioEditorPage /> },
  { path: 'formularios/:formularioId/versiones/:versionId/editar', element: <FormularioEditorPage /> },
  { path: 'areas', element: <AreasPage /> },
  { path: 'areas/:id', element: <AdministracionPlaceholderPage type="areaDetalle" section="admin" /> },
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
          { path: '/historial', element: <Navigate to="/mis-auditorias/historial" replace /> },
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
              { path: 'areas/:areaId/periodos/:periodo', element: <ResultadoPeriodoPage /> },
              { path: 'areas/:areaId/periodo/:periodo', element: <ResultadoPeriodoPage /> },
              { path: ':anio/:mes', element: <ResultadosPage /> }
            ] 
          },
          { path: '/notificaciones', element: <NotificacionesPage /> },
          { path: '/perfil', element: <PerfilPage /> },
          {
            path: '/admin',
            element: <RequireRole roles={[ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR]} />,
            children: [
              {
                element: <AdministracionLayoutPage />,
                children: adminChildren,
              },
            ],
          },
          {
            path: '/sistema',
            element: <RequireRole roles={[ROLES.SUPER_ADMIN]} />,
            children: [
              { index: true, element: <AdministracionPlaceholderPage type="sistema" section="system" /> },
              { path: 'sesiones', element: <AdministracionPlaceholderPage type="sistemaSesiones" section="system" /> },
              { path: 'entregas', element: <AdministracionPlaceholderPage type="sistemaEntregas" section="system" /> },
              { path: 'registros', element: <AdministracionPlaceholderPage type="registros" section="system" /> },
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
