import { useState, useEffect } from 'react';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

export function PerfilPasswordForm({
  onSave,
  onCancel,
  updating,
  error,
  clearError,
}) {
  const [passwordData, setPasswordData] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmarContrasena: '',
  });

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (error?.message) {
      const msg = error.message.toLowerCase();
      if (msg.includes('contrasena actual') || msg.includes('contraseña actual')) {
        setFormErrors((prev) => ({ ...prev, contrasenaActual: error.message }));
        if (clearError) clearError();
      } else if (msg.includes('nueva') || msg.includes('obvia') || msg.includes('caracteres')) {
        setFormErrors((prev) => ({ ...prev, contrasenaNueva: error.message }));
        if (clearError) clearError();
      }
    }
  }, [error, clearError]);

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.contrasenaActual) {
      errors.contrasenaActual = 'Debes ingresar tu contraseña actual';
    }

    if (!passwordData.contrasenaNueva) {
      errors.contrasenaNueva = 'La nueva contraseña es obligatoria';
    } else if (passwordData.contrasenaNueva.length < 6) {
      errors.contrasenaNueva = 'La nueva contraseña debe tener al menos 6 caracteres';
    } else if (passwordData.contrasenaNueva.length > 128) {
      errors.contrasenaNueva = 'La contraseña no debe exceder 128 caracteres';
    }

    if (!passwordData.confirmarContrasena) {
      errors.confirmarContrasena = 'Confirma tu nueva contraseña';
    } else if (passwordData.contrasenaNueva !== passwordData.confirmarContrasena) {
      errors.confirmarContrasena = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  const handleChange = (field, value) => {
    // Evitar espacios al inicio o final
    const finalValue = value.replace(/\s/g, '');
    setPasswordData((prev) => ({ ...prev, [field]: finalValue }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSave({
      contrasenaActual: passwordData.contrasenaActual,
      contrasenaNueva: passwordData.contrasenaNueva,
    });
  };

  const isSaveDisabled =
    updating ||
    !passwordData.contrasenaActual ||
    !passwordData.contrasenaNueva ||
    !passwordData.confirmarContrasena;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerta de error general */}
      {error && !formErrors.contrasenaActual && !formErrors.contrasenaNueva && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <Icon name="error" className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-extrabold text-red-900 text-sm">No se pudo actualizar la contraseña</h4>
            <p className="text-xs text-red-700 mt-1 font-medium">{error.message}</p>
            {clearError && (
              <button
                type="button"
                onClick={clearError}
                className="text-[10px] text-red-600 hover:text-red-800 mt-2 font-bold uppercase tracking-widest transition-colors"
              >
                Descartar mensaje
              </button>
            )}
          </div>
        </div>
      )}

      {/* Banner informativo de seguridad */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 text-sm text-amber-900 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 shadow-sm">
        <div className="p-2.5 bg-amber-100/70 text-amber-700 rounded-xl shrink-0">
          <Icon name="security" size="md" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-amber-950 text-sm">Protocolo de Seguridad</h4>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Al actualizar tu contraseña, podrás visualizarla temporalmente desde la sección de Seguridad de tu Perfil.
          </p>
          <p className="text-xs text-amber-900 font-bold mt-1">
            Usa una contraseña exclusiva para Encuestas 5S. No reutilices contraseñas personales.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Contraseña actual */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contrasenaActual" error={Boolean(formErrors.contrasenaActual)}>
            Contraseña Actual <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="contrasenaActual"
              type={showActual ? 'text' : 'password'}
              value={passwordData.contrasenaActual}
              onChange={(e) => handleChange('contrasenaActual', e.target.value)}
              error={Boolean(formErrors.contrasenaActual)}
              helperText={formErrors.contrasenaActual}
              disabled={updating}
              placeholder="Ingresa tu contraseña vigente"
              className="pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowActual(!showActual)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
              title={showActual ? 'Ocultar contraseña' : 'Ver contraseña'}
              aria-label={showActual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'}
            >
              <Icon name={showActual ? 'visibility_off' : 'visibility'} size="sm" />
            </button>
          </div>
        </div>

        {/* Nueva y Confirmar en 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nueva contraseña */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contrasenaNueva" error={Boolean(formErrors.contrasenaNueva)}>
              Nueva Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="contrasenaNueva"
                type={showNueva ? 'text' : 'password'}
                value={passwordData.contrasenaNueva}
                onChange={(e) => handleChange('contrasenaNueva', e.target.value)}
                error={Boolean(formErrors.contrasenaNueva)}
                helperText={formErrors.contrasenaNueva}
                disabled={updating}
                placeholder="Mínimo 6 caracteres"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNueva(!showNueva)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showNueva ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showNueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña'}
              >
                <Icon name={showNueva ? 'visibility_off' : 'visibility'} size="sm" />
              </button>
            </div>
          </div>

          {/* Confirmar nueva contraseña */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmarContrasena" error={Boolean(formErrors.confirmarContrasena)}>
              Confirmar Nueva Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmarContrasena"
                type={showConfirm ? 'text' : 'password'}
                value={passwordData.confirmarContrasena}
                onChange={(e) => handleChange('confirmarContrasena', e.target.value)}
                error={Boolean(formErrors.confirmarContrasena)}
                helperText={formErrors.confirmarContrasena}
                disabled={updating}
                placeholder="Repite tu nueva contraseña"
                className="pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showConfirm ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showConfirm ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
              >
                <Icon name={showConfirm ? 'visibility_off' : 'visibility'} size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-slate-100">
        <Button
          type="button"
          onClick={onCancel}
          variant="cancelar"
          size="sm"
          disabled={updating}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="guardar"
          size="sm"
          icon="lock_reset"
          isLoading={updating}
          disabled={isSaveDisabled}
        >
          Actualizar Contraseña
        </Button>
      </div>
    </form>
  );
}
