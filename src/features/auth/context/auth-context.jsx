import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '@/features/auth/api/auth-api';
import { AuthContext } from '@/features/auth/context/auth-context-value';
import { ApiError } from '@/lib/api/api-client';

function normalizeUser(response) {
  if (response?.datos?.usuario) return response.datos.usuario;
  if (response?.datos) return response.datos;
  return response?.data?.user || response?.user || response?.data || response || null;
}

export function AuthProvider({ children }) {
  const refreshPromiseRef = useRef(null);
  const [state, setState] = useState({
    status: 'loading',
    user: null,
    error: null,
  });

  const refreshSession = useCallback(async ({ silent = false } = {}) => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;
    if (!silent) setState((current) => ({ ...current, status: 'loading', error: null }));

    refreshPromiseRef.current = (async () => {
      try {
        const response = await authApi.me();
        const user = normalizeUser(response);
        setState({ status: user ? 'authenticated' : 'noAuth', user, error: null });
        return user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setState({ status: 'noAuth', user: null, error: null });
          return null;
        }

        setState((current) => ({
          status: 'unknown',
          user: current.user,
          error,
        }));
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (state.status !== 'unknown') return undefined;

    const handleOnline = () => {
      refreshSession({ silent: false });
    };

    window.addEventListener('online', handleOnline, { once: true });
    return () => window.removeEventListener('online', handleOnline);
  }, [refreshSession, state.status]);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const user = normalizeUser(response);
    setState({ status: 'authenticated', user, error: null });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setState({ status: 'noAuth', user: null, error: null });
    }
  }, []);

  const goToLoginManually = useCallback(() => {
    setState({ status: 'noAuth', user: null, error: null });
  }, []);

  const value = useMemo(() => ({
    ...state,
    isAuthenticated: state.status === 'authenticated' && Boolean(state.user),
    login,
    logout,
    goToLoginManually,
    refreshSession,
  }), [goToLoginManually, login, logout, refreshSession, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
