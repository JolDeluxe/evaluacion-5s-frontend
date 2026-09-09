import {
  BUSINESS_ADMIN_ROLES,
  RESULTS_ROLES,
  ROLES,
} from '../../../config/navigation-config';

export function canAccessGeneralResults(role) {
  return RESULTS_ROLES.includes(role);
}

export function canViewRestrictedResultSections(role) {
  return BUSINESS_ADMIN_ROLES.includes(role);
}

export function getResultadosDefaultPath(role, search = '') {
  const query = search || '';
  const target = role === ROLES.AUDITOR ? '/resultados/areas' : '/resultados/general';
  return `${target}${query}`;
}
