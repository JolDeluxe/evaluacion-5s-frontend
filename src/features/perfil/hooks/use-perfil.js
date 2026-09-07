import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { perfilApi } from '../api/perfil-api';

export const usePerfil = () => {
  const { user, refreshSession, syncAuthenticatedUser } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchPerfil = useCallback(async () => {
    setError(null);
    if (refreshSession) {
      await refreshSession({ silent: true });
    }
  }, [refreshSession]);

  const actualizarPerfil = useCallback(async (datos) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await perfilApi.actualizarPerfil(datos);
      if (refreshSession) {
        await refreshSession({ silent: true });
      }

      setSuccess({
        message: response?.datos?.mensaje || response?.mensaje || 'Perfil actualizado correctamente',
      });
      return true;
    } catch (err) {
      setError({
        message: err.message || 'Error al actualizar perfil',
        status: err.status,
        detalles: err.detalles,
      });
      return false;
    } finally {
      setUpdating(false);
    }
  }, [refreshSession]);

  const cambiarContrasena = useCallback(async (datos) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      const response = await perfilApi.cambiarContrasena(datos);
      const updatedUser = response?.datos?.usuario ?? response?.usuario;
      if (updatedUser) {
        syncAuthenticatedUser(updatedUser);
      } else if (refreshSession) {
        await refreshSession({ silent: true });
      }
      setSuccess({
        message: response?.datos?.mensaje || response?.mensaje || 'Contraseña actualizada',
      });
      return true;
    } catch (err) {
      setError({
        message: err.message || 'Error al cambiar la contraseña',
        status: err.status,
        detalles: err.detalles,
      });
      return false;
    } finally {
      setUpdating(false);
    }
  }, [refreshSession, syncAuthenticatedUser]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  return {
    user,
    updating,
    error,
    success,
    fetchPerfil,
    actualizarPerfil,
    cambiarContrasena,
    clearError,
    clearSuccess,
  };
};
