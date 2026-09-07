import { useEffect } from 'react';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { usePerfil } from '../hooks/use-perfil';
import { PerfilDesktop } from '../views/perfil-desktop';
import { PerfilMobile } from '../views/perfil-mobile';
import { notify } from '@/components/notification/adaptive-notify';

export function PerfilPage() {
  const isDesktop = useIsDesktop();
  const {
    user,
    updating,
    error,
    success,
    fetchPerfil,
    actualizarPerfil,
    cambiarContrasena,
    clearError,
    clearSuccess,
  } = usePerfil();

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  useEffect(() => {
    if (success?.message) {
      notify.success(success.message);
      const timer = setTimeout(() => clearSuccess?.(), 4000);
      return () => clearTimeout(timer);
    }
  }, [success, clearSuccess]);

  useEffect(() => {
    if (error?.message) {
      const msg = error.message.toLowerCase();
      // Silenciamos los errores que ya son manejados inline por los formularios
      const isHandledInline =
        msg.includes('contraseña') ||
        msg.includes('contrasena') ||
        msg.includes('correo') ||
        msg.includes('nombre') ||
        msg.includes('teléfono') ||
        msg.includes('telefono');

      if (!isHandledInline) {
        notify.error(error.message);
      }
    }
  }, [error]);

  const viewProps = {
    user,
    updating,
    error,
    onUpdate: actualizarPerfil,
    onChangePassword: cambiarContrasena,
    clearError,
  };

  return (
    <div className="max-w-4xl mx-auto">
      {isDesktop ? (
        <PerfilDesktop {...viewProps} />
      ) : (
        <PerfilMobile {...viewProps} />
      )}
    </div>
  );
}
