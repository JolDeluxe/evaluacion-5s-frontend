import { describe, expect, test } from 'bun:test';

import { ROLES } from '../../../config/navigation-config';
import {
  canAccessGeneralResults,
  canViewRestrictedResultSections,
  getResultadosDefaultPath,
} from './resultados-permissions';

describe('permisos de resultados generales', () => {
  test.each([
    ROLES.SUPER_ADMIN,
    ROLES.ADMINISTRADOR,
    ROLES.AUDITOR,
  ])('%s puede consultar el resultado general', (role) => {
    expect(canAccessGeneralResults(role)).toBe(true);
  });

  test('AUDITOR no puede ver los bloques restringidos', () => {
    expect(canViewRestrictedResultSections(ROLES.AUDITOR)).toBe(false);
  });

  test.each([
    ROLES.SUPER_ADMIN,
    ROLES.ADMINISTRADOR,
  ])('%s puede ver los bloques restringidos', (role) => {
    expect(canViewRestrictedResultSections(role)).toBe(true);
  });

  test('un rol desconocido no obtiene acceso', () => {
    expect(canAccessGeneralResults('ROL_DESCONOCIDO')).toBe(false);
    expect(canViewRestrictedResultSections('ROL_DESCONOCIDO')).toBe(false);
  });
});

describe('navegación inicial de resultados', () => {
  test('AUDITOR entra a Áreas por defecto', () => {
    expect(getResultadosDefaultPath(ROLES.AUDITOR)).toBe('/resultados/areas');
  });

  test.each([
    ROLES.SUPER_ADMIN,
    ROLES.ADMINISTRADOR,
  ])('%s entra a General por defecto', (role) => {
    expect(getResultadosDefaultPath(role)).toBe('/resultados/general');
  });

  test('preserva query params relevantes al entrar al módulo', () => {
    expect(getResultadosDefaultPath(ROLES.AUDITOR, '?mes=2026-08')).toBe('/resultados/areas?mes=2026-08');
    expect(getResultadosDefaultPath(ROLES.ADMINISTRADOR, '?mes=2026-08')).toBe('/resultados/general?mes=2026-08');
  });
});
