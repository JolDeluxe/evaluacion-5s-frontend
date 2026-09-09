import { useState, useEffect } from 'react';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { isValidUsername, normalizeUsernameInput } from '@/utils/username';

export function PerfilGeneralForm({
  user,
  onSave,
  onCancel,
  updating,
  error,
  clearError,
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    nombreUsuario: '',
    correo: '',
    telefonoE164: '',
  });

  const [initialData, setInitialData] = useState({
    nombre: '',
    nombreUsuario: '',
    correo: '',
    telefonoE164: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      const data = {
        nombre: user.nombre || '',
        nombreUsuario: user.nombreUsuario || '',
        correo: user.correo || '',
        telefonoE164: user.telefonoE164 || '',
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [user]);

  useEffect(() => {
    if (error?.message) {
      const msg = error.message.toLowerCase();
      let handled = false;

      if (msg.includes('correo')) {
        setFormErrors((prev) => ({ ...prev, correo: error.message }));
        handled = true;
      }

      if (msg.includes('nombre')) {
        setFormErrors((prev) => ({ ...prev, nombre: error.message }));
        handled = true;
      }

      if (msg.includes('usuario')) {
        setFormErrors((prev) => ({ ...prev, nombreUsuario: error.message }));
        handled = true;
      }

      if (msg.includes('teléfono') || msg.includes('telefono')) {
        setFormErrors((prev) => ({ ...prev, telefonoE164: error.message }));
        handled = true;
      }

      if (handled && clearError) {
        clearError();
      }
    }
  }, [error, clearError]);

  const validateForm = () => {
    const errors = {};

    const nombreTrimmed = formData.nombre?.trim() || '';
    if (!nombreTrimmed) {
      errors.nombre = 'El nombre completo es obligatorio';
    } else if (nombreTrimmed.length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (nombreTrimmed.length > 160) {
      errors.nombre = 'El nombre no debe exceder 160 caracteres';
    }

    const nombreUsuarioTrimmed = formData.nombreUsuario?.trim() || '';
    if (!nombreUsuarioTrimmed) {
      errors.nombreUsuario = 'El nombre de usuario es obligatorio';
    } else if (!isValidUsername(nombreUsuarioTrimmed)) {
      errors.nombreUsuario = 'Usa solo letras minúsculas, sin espacios, números ni símbolos';
    }

    const correoTrimmed = formData.correo?.trim() || '';
    if (correoTrimmed) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoTrimmed)) {
        errors.correo = 'Formato de correo electrónico inválido';
      } else if (correoTrimmed.length > 180) {
        errors.correo = 'El correo no debe exceder 180 caracteres';
      }
    }

    const telTrimmed = formData.telefonoE164?.trim() || '';
    if (telTrimmed && telTrimmed.length > 24) {
      errors.telefonoE164 = 'El teléfono no debe exceder 24 caracteres';
    }

    return errors;
  };

  const handleChange = (field, value) => {
    let finalValue = value;

    if (field === 'telefonoE164') {
      // Permitir dígitos, espacios, guiones, paréntesis y '+'
      finalValue = value.replace(/[^\d+()\s-]/g, '');
      if (finalValue.length > 24) finalValue = finalValue.substring(0, 24);
    } else if (field === 'correo') {
      finalValue = value.replace(/\s/g, '');
      if (finalValue.length > 180) finalValue = finalValue.substring(0, 180);
    } else if (field === 'nombre') {
      if (finalValue.length > 160) finalValue = finalValue.substring(0, 160);
    } else if (field === 'nombreUsuario') {
      finalValue = normalizeUsernameInput(value);
    }

    setFormData((prev) => ({ ...prev, [field]: finalValue }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSave({
      nombre: formData.nombre.trim(),
      nombreUsuario: formData.nombreUsuario.trim(),
      correo: formData.correo?.trim() || null,
      telefonoE164: formData.telefonoE164?.trim() || null,
    });
  };

  const isDataUnchanged =
    formData.nombre?.trim() === (initialData.nombre || '').trim() &&
    formData.nombreUsuario?.trim() === (initialData.nombreUsuario || '').trim() &&
    formData.correo?.trim() === (initialData.correo || '').trim() &&
    formData.telefonoE164?.trim() === (initialData.telefonoE164 || '').trim();

  const isMissingRequiredFields = !formData.nombre?.trim() || !formData.nombreUsuario?.trim();
  const isSaveDisabled = updating || isMissingRequiredFields || isDataUnchanged;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerta de error no capturado en campos individuales */}
      {error && !formErrors.correo && !formErrors.nombre && !formErrors.telefonoE164 && (
        <div className="p-4 bg-red-50 border-l-4 border-estado-rechazado rounded-r-xl flex items-center justify-between text-estado-rechazado text-sm font-bold shadow-sm">
          <div className="flex items-center gap-3">
            <Icon name="error" size="sm" />
            <span>{error.message}</span>
          </div>
          {clearError && (
            <button
              type="button"
              onClick={clearError}
              className="text-red-500 hover:text-red-700 transition-colors p-1"
              title="Descartar mensaje"
            >
              <Icon name="close" size="xs" />
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre completo */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="nombre" error={Boolean(formErrors.nombre)}>
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <span
              className={`text-[10px] font-bold tracking-wider ${
                formData.nombre.length > 160 ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {formData.nombre.length}/160
            </span>
          </div>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            error={Boolean(formErrors.nombre)}
            helperText={formErrors.nombre}
            disabled={updating}
            placeholder="Ej. Juan Pérez"
            maxLength={160}
          />
        </div>

        {/* Nombre de usuario */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="nombreUsuario" error={Boolean(formErrors.nombreUsuario)}>
              Nombre de Usuario
            </Label>
            <span
              className={`text-[10px] font-bold tracking-wider ${
                formData.nombreUsuario.length > 80 ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {formData.nombreUsuario.length}/80
            </span>
          </div>
          <Input
            id="nombreUsuario"
            value={formData.nombreUsuario}
            onChange={(e) => handleChange('nombreUsuario', e.target.value)}
            error={Boolean(formErrors.nombreUsuario)}
            helperText={formErrors.nombreUsuario || 'Solo letras minúsculas, sin espacios, números ni símbolos.'}
            disabled={updating}
            placeholder="juanperez"
            maxLength={80}
            autoComplete="username"
          />
        </div>

        {/* Teléfono */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="telefonoE164" error={Boolean(formErrors.telefonoE164)}>
              Teléfono de Contacto <span className="text-slate-400 font-normal italic">(Opcional)</span>
            </Label>
            <span
              className={`text-[10px] font-bold tracking-wider ${
                formData.telefonoE164.length > 24 ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {formData.telefonoE164.length}/24
            </span>
          </div>
          <Input
            id="telefonoE164"
            type="tel"
            value={formData.telefonoE164}
            onChange={(e) => handleChange('telefonoE164', e.target.value)}
            error={Boolean(formErrors.telefonoE164)}
            helperText={formErrors.telefonoE164}
            disabled={updating}
            placeholder="Ej. +52 477 123 4567"
            maxLength={24}
          />
        </div>

        {/* Correo */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="correo" error={Boolean(formErrors.correo)}>
              Correo Electrónico <span className="text-slate-400 font-normal italic">(Opcional)</span>
            </Label>
            <span
              className={`text-[10px] font-bold tracking-wider ${
                formData.correo.length > 180 ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {formData.correo.length}/180
            </span>
          </div>
          <Input
            id="correo"
            type="email"
            value={formData.correo}
            onChange={(e) => handleChange('correo', e.target.value)}
            error={Boolean(formErrors.correo)}
            helperText={formErrors.correo}
            disabled={updating}
            placeholder="ejemplo@cuadra.com.mx"
            maxLength={180}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
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
          icon="save"
          isLoading={updating}
          disabled={isSaveDisabled}
        >
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
