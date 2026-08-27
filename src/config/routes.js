import { generatePath } from 'react-router';

export const ROUTES = {
  inicio: '/inicio',
  misAuditorias: '/mis-auditorias',
  historial: '/historial',
  notificaciones: '/notificaciones',
  perfil: '/perfil',

  // Admin
  admin: '/admin',
  asignaciones: '/admin/asignaciones',
  asignacionesMes: (anio, mes) => generatePath('/admin/asignaciones/:anio/:mes', { anio, mes }),
  
  formularios: '/admin/formularios',
  formulario: (id) => generatePath('/admin/formularios/:id', { id }),
  formularioEditar: (id) => generatePath('/admin/formularios/:id/editar', { id }),
  
  areas: '/admin/areas',
  area: (id) => generatePath('/admin/areas/:id', { id }),
  
  usuarios: '/admin/usuarios',

  // Resultados
  resultados: '/resultados',
  resultadosMes: (anio, mes) => generatePath('/resultados/:anio/:mes', { anio, mes }),
};
