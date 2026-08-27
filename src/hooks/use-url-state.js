/**
 * use-url-state.js
 *
 * Hook utilitario para manejar el estado navegable de filtros/paginacion en URL.
 *
 * Principios:
 * - Los valores por defecto NO se escriben en la URL (URL limpia).
 * - Cada cambio de filtro resetea la pagina a 1.
 * - La busqueda usa replace (no push) para no llenar el historial.
 * - Los valores del enum backend (MAYUSCULAS) se mapean a minusculas en URL.
 */

import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router';

function readParams(searchParams, defaults) {
  const result = {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    const raw = searchParams.get(key);
    result[key] = raw !== null ? raw : defaultValue;
  }
  return result;
}

function buildParams(current, updates, defaults) {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(updates)) {
    const isDefault = value === defaults[key];
    const isEmpty = value === null || value === undefined || value === '';
    if (isDefault || (isEmpty && (defaults[key] === '' || defaults[key] === undefined))) {
      next.delete(key);
    } else if (isEmpty) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  }
  return next;
}

/**
 * Hook principal.
 *
 * @param {Record<string, string>} defaults  - Valores por defecto (no se escriben en URL).
 * @param {string} [pageKey='pagina']        - Clave que representa la pagina.
 */
export function useUrlState(defaults, pageKey = 'pagina') {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = readParams(searchParams, defaults);

  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const setParam = useCallback((key, value, opts = {}) => {
    const { replace = false, resetPage = true } = opts;
    setSearchParams((prev) => {
      const updates = { [key]: value };
      if (resetPage && key !== pageKey && pageKey in defaultsRef.current) {
        updates[pageKey] = defaultsRef.current[pageKey];
      }
      return buildParams(prev, updates, defaultsRef.current);
    }, { replace });
  }, [setSearchParams, pageKey]);

  const setParams = useCallback((updates, opts = {}) => {
    const { replace = false, resetPage = true } = opts;
    setSearchParams((prev) => {
      const all = { ...updates };
      const changingFilters = Object.keys(updates).some((k) => k !== pageKey);
      if (resetPage && changingFilters && pageKey in defaultsRef.current) {
        if (!(pageKey in updates)) {
          all[pageKey] = defaultsRef.current[pageKey];
        }
      }
      return buildParams(prev, all, defaultsRef.current);
    }, { replace });
  }, [setSearchParams, pageKey]);

  const setSearch = useCallback((key, value) => {
    setSearchParams((prev) => {
      const updates = {
        [key]: value,
        ...(pageKey in defaultsRef.current ? { [pageKey]: defaultsRef.current[pageKey] } : {}),
      };
      return buildParams(prev, updates, defaultsRef.current);
    }, { replace: true });
  }, [setSearchParams, pageKey]);

  return { params, setParam, setParams, setSearch };
}

// ---------------------------------------------------------------------------
// Helpers de validacion y mapping
// ---------------------------------------------------------------------------

export function parsePageParam(raw, fallback = '1') {
  const n = parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : parseInt(fallback, 10);
}

export function parseMonthParam(raw, fallback) {
  const n = parseInt(raw, 10);
  const fb = fallback ?? new Date().getMonth() + 1;
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : fb;
}

export function parseYearParam(raw, fallback) {
  const n = parseInt(raw, 10);
  const fb = fallback ?? new Date().getFullYear();
  return Number.isInteger(n) && n >= 2020 && n <= 2100 ? n : fb;
}
