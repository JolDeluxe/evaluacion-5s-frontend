import { useEffect, useRef, useState, useCallback } from 'react';
import { useUrlState, parsePageParam } from '@/hooks/use-url-state';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Table } from '@/components/ui/table';
import { TableActions } from '@/components/ui/table-actions';
import { Label } from '@/components/form/label';
import { Input } from '@/components/form/input';
import { Select } from '@/components/form/select';
import { usuariosApi } from '@/features/administracion/usuarios/api/usuarios-api';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { areasApi } from '@/features/administracion/areas/api/areas-api';
import { AreaMultiSelect } from '@/features/administracion/usuarios/components/area-multi-select';
import { ImpactoUsuarioModal } from '@/features/administracion/usuarios/components/impacto-usuario-modal';
import { AdministracionNav } from '@/features/administracion/components/administracion-nav';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';
import { cn } from '@/utils/cn';
import { obtenerCatalogoCompleto } from '@/utils/catalogo-completo';
import { formatFechaLarga } from '@/utils/format';
import { notify } from '@/components/notification/adaptive-notify';
import { useCredentialReveal } from '@/hooks/use-credential-reveal';
import { isValidUsername, normalizeUsernameInput } from '@/utils/username';


// ---------------------------------------------------------------------------
// Helpers visuales
// ---------------------------------------------------------------------------

function EstadoUsuarioIndicator({ activo, rol, esComodin, puedeSerAsignadoAuditoria, seEvalua }) {
  const isSuper = rol === 'SUPER_ADMIN';
  const isAdmin = rol === 'ADMINISTRADOR';
  const isVis = rol === 'VISUALIZADOR';
  const rolLabel = isSuper ? 'Super Admin' : isAdmin ? 'Administrador' : isVis ? 'Visualizador' : 'Auditor';

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500">
      {isVis ? (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-700 border border-slate-300">
          Visualizador
        </span>
      ) : (
        <span>{rolLabel}</span>
      )}
      <span>·</span>
      <span className={cn('inline-flex items-center gap-1 font-bold', activo ? 'text-emerald-700' : 'text-slate-500')}>
        <span className={cn('h-1.5 w-1.5 rounded-full', activo ? 'bg-emerald-500' : 'bg-slate-400')} />
        {activo ? 'Activo' : 'Inactivo'}
      </span>
      {esComodin && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700 border border-amber-200">
          Comodín
        </span>
      )}
      {puedeSerAsignadoAuditoria === false && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700 border border-rose-200">
          No asignable
        </span>
      )}
      {seEvalua && (
        <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black text-indigo-700 border border-indigo-200">
          KPI Activo
        </span>
      )}
    </div>
  );
}

function ResponsableAreasCell({ areasUsuario = [] }) {
  if (areasUsuario.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[280px]">
      {areasUsuario.map((ua) => (
        <span
          key={ua.area.id}
          className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full"
        >
          {ua.area.nombre}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tarjeta mobile
// ---------------------------------------------------------------------------

function UsuarioCard({ usuario, currentUser, onVerDetalle, onEditar, onToggleEstado, onRestablecerContrasena }) {
  const responsables = usuario.areasUsuario ?? [];
  const isSuper = usuario.rol === 'SUPER_ADMIN';
  const canManageTarget = !isSuper || currentUser?.rol === 'SUPER_ADMIN';

  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-xl backdrop-blur-xl space-y-3">
      <div className="flex items-start justify-between gap-2" onClick={() => onVerDetalle(usuario)}>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-slate-900 leading-snug break-words">{usuario.nombre}</h2>
          <p className="text-xs font-medium text-slate-400">{usuario.nombreUsuario}</p>
          <EstadoUsuarioIndicator activo={usuario.activo} rol={usuario.rol} esComodin={usuario.esComodin} puedeSerAsignadoAuditoria={usuario.puedeSerAsignadoAuditoria} seEvalua={usuario.seEvalua} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
        <div className="min-w-0 flex-1" onClick={() => onVerDetalle(usuario)}>
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Áreas bajo su responsabilidad</span>
          {responsables.length === 0 ? (
            <span className="text-xs font-semibold text-slate-400 block mt-0.5">—</span>
          ) : (
            <div className="flex flex-wrap gap-1 mt-1">
              {responsables.map((ua) => (
                <span key={ua.area.id} className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {ua.area.nombre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 pt-3">
          <Button
            type="button"
            onClick={() => onVerDetalle(usuario)}
            variant="ghost"
            size="icon"
            icon="visibility"
            className="h-8 w-8 text-slate-500 hover:bg-slate-100 rounded-lg"
            title="Ver detalle"
            aria-label="Ver detalle"
          />
          {canManageTarget && (
            <>
              <Button
                type="button"
                onClick={() => onEditar(usuario)}
                variant="ghost"
                size="icon"
                icon="edit"
                className="h-8 w-8 text-amber-500 hover:bg-slate-100 rounded-lg"
                title="Editar usuario"
                aria-label="Editar usuario"
              />
              <Button
                type="button"
                onClick={() => onRestablecerContrasena(usuario)}
                variant="ghost"
                size="icon"
                icon="key"
                className="h-8 w-8 text-blue-600 hover:bg-slate-100 rounded-lg"
                title="Establecer nueva contraseña"
                aria-label="Establecer nueva contraseña"
              />
              <Button
                type="button"
                onClick={() => onToggleEstado(usuario)}
                variant="ghost"
                size="icon"
                icon={usuario.activo ? "person_remove" : "person_add"}
                className={cn("h-8 w-8 hover:bg-slate-100 rounded-lg", usuario.activo ? "text-red-500" : "text-emerald-500")}
                title={usuario.activo ? "Desactivar" : "Reactivar"}
                aria-label={usuario.activo ? "Desactivar" : "Reactivar"}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal de detalle del usuario
// ---------------------------------------------------------------------------

function UsuarioDetalleModal({ usuario, currentUser, onClose, onRestablecerContrasena }) {
  const loadCredential = useCallback(
    () => usuariosApi.obtenerCredencial(usuario.id),
    [usuario.id],
  );
  const {
    revealedCredential: revealedPassword,
    loadingCredential: loadingCred,
    copied,
    toggleCredential: handleToggleReveal,
    copyCredential: handleCopiarPassword,
    clearCredential,
  } = useCredentialReveal({ loadCredential, resetKey: usuario.id });

  const handleCloseModal = () => {
    clearCredential();
    onClose();
  };

  if (!usuario) return null;
  const areas = usuario.areasUsuario ?? [];
  const fechaMiembro = formatFechaLarga(usuario.creadoEn);
  const isSuper = usuario.rol === 'SUPER_ADMIN';
  const canManageTarget = !isSuper || currentUser?.rol === 'SUPER_ADMIN';

  return (
    <Modal isOpen={!!usuario} onClose={handleCloseModal}>
      <ModalHeader title="Detalle de Usuario" onClose={handleCloseModal}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
            {usuario.nombreUsuario}
          </p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{usuario.nombre}</h2>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className="space-y-4">
          <EstadoUsuarioIndicator activo={usuario.activo} rol={usuario.rol} esComodin={usuario.esComodin} puedeSerAsignadoAuditoria={usuario.puedeSerAsignadoAuditoria} seEvalua={usuario.seEvalua} />

          {fechaMiembro && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2.5 rounded-xl">
              <Icon name="calendar_today" size="xs" className="text-slate-400 shrink-0" />
              <span>Miembro desde: {fechaMiembro}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl min-w-0">
              <Icon name="mail" size="xs" className="text-slate-400 shrink-0" />
              <span className="truncate">{usuario.correo || 'Sin correo'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl min-w-0">
              <Icon name="call" size="xs" className="text-slate-400 shrink-0" />
              <span className="truncate">{usuario.telefonoE164 || 'Sin teléfono'}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
              Áreas bajo su responsabilidad
            </p>
            {areas.length === 0 ? (
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-3 text-center">
                <p className="text-sm italic text-slate-400">Sin áreas asociadas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {areas.map((ua) => (
                  <div key={ua.area.id} className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{ua.area.nombre}</p>
                      <p className="text-[11px] text-slate-400">{ua.area.tipo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Seguridad */}
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
              Seguridad
            </p>
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contraseña</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-base font-bold tracking-widest text-slate-800 select-all">
                      {revealedPassword || '••••••••••••'}
                    </span>
                    {usuario.tieneCredencialCifrada !== false && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          icon={revealedPassword ? 'visibility_off' : 'visibility'}
                          onClick={handleToggleReveal}
                          isLoading={loadingCred}
                          className="h-8 w-8 text-slate-600 hover:bg-slate-200/60 rounded-lg"
                          title={revealedPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                          aria-label={revealedPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          icon={copied ? 'check' : 'content_copy'}
                          onClick={handleCopiarPassword}
                          disabled={loadingCred}
                          className="h-8 w-8 text-slate-600 hover:bg-slate-200/60 rounded-lg"
                          title={copied ? '¡Copiada!' : 'Copiar contraseña'}
                          aria-label="Copiar contraseña"
                        />
                      </div>
                    )}
                  </div>

                  {usuario.tieneCredencialCifrada === false ? (
                    <p className="text-[11px] text-amber-700 font-medium block mt-1 leading-relaxed">
                      La contraseña actual fue creada antes de habilitar la visualización y no puede recuperarse. Establece una nueva para habilitar ojo y copiar.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 block mt-1 leading-relaxed">
                      {revealedPassword
                        ? 'Contraseña visible temporalmente (se ocultará automáticamente en 2 minutos).'
                        : 'Haz clic en el ojo para revelar la contraseña actual.'}
                    </p>
                  )}
                </div>

                {canManageTarget && onRestablecerContrasena && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon="key"
                    onClick={() => {
                      handleCloseModal();
                      onRestablecerContrasena(usuario);
                    }}
                    className="shrink-0 text-xs font-bold text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    Establecer nueva contraseña
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="cancelar" size="sm" onClick={handleCloseModal}>Cerrar</Button>
      </ModalFooter>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal de Establecer Nueva Contraseña
// ---------------------------------------------------------------------------

function EstablecerContrasenaModal({ usuario, onClose, onSuccess }) {
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [debeCambiarContrasena, setDebeCambiarContrasena] = useState(true);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!usuario) return null;

  const handleGenerar = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const arr = new Uint8Array(10);
    crypto.getRandomValues(arr);
    const pass = Array.from(arr).map((x) => chars[x % chars.length]).join('');
    setContrasenaNueva(pass);
    setConfirmarContrasena(pass);
    setShowNueva(false);
    setShowConfirmar(false);
    setCopied(false);
    setError('');
  };

  const handleCopiar = async () => {
    if (!contrasenaNueva) return;
    try {
      await navigator.clipboard.writeText(contrasenaNueva);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignorar fallo de clipboard
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contrasenaNueva || contrasenaNueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (contrasenaNueva !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await usuariosApi.establecerContrasenaTemporal(usuario.id, {
        contrasena: contrasenaNueva,
        debeCambiarContrasena,
      });
      handleClose();
      onSuccess?.(usuario);
    } catch (err) {
      setError(err.message || 'Error al establecer la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setContrasenaNueva('');
    setConfirmarContrasena('');
    setError('');
    setShowNueva(false);
    setShowConfirmar(false);
    setCopied(false);
    onClose();
  };

  const isSaveDisabled =
    saving ||
    !contrasenaNueva ||
    contrasenaNueva.length < 6 ||
    !confirmarContrasena ||
    contrasenaNueva !== confirmarContrasena;

  return (
    <Modal isOpen={Boolean(usuario)} onClose={handleClose} className="max-w-md">
      <ModalHeader title="Establecer Nueva Contraseña" onClose={handleClose}>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">
            {usuario.nombreUsuario}
          </p>
          <h2 className="mt-0.5 text-xl font-black text-slate-950 leading-tight">{usuario.nombre}</h2>
        </div>
      </ModalHeader>
      <form onSubmit={handleSubmit} autoComplete="off">
        <ModalBody>
          <div className="space-y-4 text-sm">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <Icon name="security" size="sm" className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="leading-relaxed font-medium">
                  Una vez guardada, la contraseña podrá ser visualizada temporalmente por administradores autorizados.
                </p>
                <p className="text-[11px] text-amber-800 font-bold">
                  Usa una contraseña exclusiva para Encuestas 5S. No reutilices contraseñas personales.
                </p>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="pass-nueva-admin" className="mb-0">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={handleGenerar}
                  className="text-xs font-bold text-marca-primario hover:underline flex items-center gap-1"
                >
                  <Icon name="autorenew" size="xs" />
                  Generar segura
                </button>
              </div>

              <div className="relative flex items-center">
                <Input
                  id="pass-nueva-admin"
                  type={showNueva ? 'text' : 'password'}
                  value={contrasenaNueva}
                  onChange={(e) => {
                    setContrasenaNueva(e.target.value.replace(/\s/g, ''));
                    setError('');
                  }}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="pr-20 font-mono"
                  autoComplete="new-password"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {contrasenaNueva && (
                    <button
                      type="button"
                      onClick={handleCopiar}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      title={copied ? '¡Copiada!' : 'Copiar contraseña'}
                      aria-label="Copiar contraseña"
                    >
                      <Icon name={copied ? 'check' : 'content_copy'} size="xs" className={copied ? 'text-emerald-600' : ''} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowNueva(!showNueva)}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title={showNueva ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showNueva ? 'Ocultar nueva contraseña' : 'Ver nueva contraseña'}
                  >
                    <Icon name={showNueva ? 'visibility_off' : 'visibility'} size="xs" />
                  </button>
                </div>
              </div>

              {contrasenaNueva && (
                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleCopiar}
                    aria-label={copied ? 'Contraseña copiada al portapapeles' : 'Copiar contraseña al portapapeles'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-sm"
                  >
                    <Icon name={copied ? 'check' : 'content_copy'} size="xs" className={copied ? 'text-emerald-600' : 'text-slate-500'} />
                    <span>{copied ? '¡Copiada al portapapeles!' : 'Copiar contraseña'}</span>
                  </button>
                  <span className="text-[11px] text-slate-400 italic">
                    {showNueva ? 'Visible' : 'Oculta'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <Label htmlFor="pass-confirmar-admin">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="pass-confirmar-admin"
                  type={showConfirmar ? 'text' : 'password'}
                  value={confirmarContrasena}
                  onChange={(e) => {
                    setConfirmarContrasena(e.target.value.replace(/\s/g, ''));
                    setError('');
                  }}
                  required
                  placeholder="Repite la contraseña"
                  className="pr-10 font-mono"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  title={showConfirmar ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showConfirmar ? 'Ocultar confirmación de contraseña' : 'Ver confirmación de contraseña'}
                >
                  <Icon name={showConfirmar ? 'visibility_off' : 'visibility'} size="xs" />
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-700 font-medium pt-1">
              <input
                type="checkbox"
                checked={debeCambiarContrasena}
                onChange={(e) => setDebeCambiarContrasena(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-marca-primario focus:ring-marca-primario/30"
              />
              <span>Forzar cambio de contraseña en el próximo inicio de sesión</span>
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="cancelar" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="guardar"
            size="sm"
            icon="key"
            isLoading={saving}
            disabled={isSaveDisabled}
          >
            Guardar contraseña
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}


// ---------------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------------

const ROLES_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'SUPER_ADMIN', label: 'Super' },
  { value: 'ADMINISTRADOR', label: 'Admin' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'VISUALIZADOR', label: 'Visualizador' },
];

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
];

const RESPONSABILIDAD_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'con', label: 'Con áreas' },
  { value: 'sin', label: 'Sin áreas' },
];

function FilterGridGroup({ title, value, options, onChange, gridCols = 'grid-cols-3' }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{title}</span>
      <div className={cn('grid gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-0.5', gridCols)}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-md py-1 px-1 text-center text-xs font-black transition truncate',
                isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Columnas desktop
// ---------------------------------------------------------------------------

function buildColumns(onVerDetalle, onEditar, onToggleEstado, onRestablecerContrasena, currentUser) {
  return [
    {
      header: 'Usuario',
      accessorKey: 'nombre',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marca-primario/10 font-bold text-marca-primario text-sm uppercase">
            {row.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-slate-900 text-sm block leading-tight">{row.nombre}</span>
            {row.correo && <span className="text-xs text-slate-400 block mt-0.5">{row.correo}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Username',
      accessorKey: 'nombreUsuario',
      headerClassName: 'w-[140px]',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.nombreUsuario}
        </span>
      ),
    },
    {
      header: 'Rol y Estado',
      accessorKey: 'rol',
      headerClassName: 'w-[180px]',
      cell: (row) => <EstadoUsuarioIndicator activo={row.activo} rol={row.rol} esComodin={row.esComodin} puedeSerAsignadoAuditoria={row.puedeSerAsignadoAuditoria} seEvalua={row.seEvalua} />,
    },
    {
      header: 'Áreas bajo su responsabilidad',
      accessorKey: 'responsable',
      cell: (row) => <ResponsableAreasCell areasUsuario={row.areasUsuario} />,
    },
    {
      header: '',
      accessorKey: '_acciones',
      align: 'center',
      headerClassName: 'w-[140px]',
      cell: (row) => {
        const isSuper = row.rol === 'SUPER_ADMIN';
        const canManageTarget = !isSuper || currentUser?.rol === 'SUPER_ADMIN';
        return (
          <TableActions
            row={row}
            actions={[
              { key: 'ver_detalle', enabled: true, onClick: () => onVerDetalle(row), tooltip: 'Ver detalle' },
              { key: 'editar', enabled: canManageTarget, onClick: () => onEditar(row), tooltip: 'Editar usuario' },
              { key: 'restablecer_contrasena', enabled: canManageTarget, onClick: () => onRestablecerContrasena(row), tooltip: 'Establecer nueva contraseña' },
              row.activo 
                ? { key: 'toggle_estatus_desactivar', enabled: canManageTarget, onClick: () => onToggleEstado(row), tooltip: 'Desactivar' }
                : { key: 'toggle_estatus_activar', enabled: canManageTarget, onClick: () => onToggleEstado(row), tooltip: 'Activar' }
            ]}
          />
        );
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

const LIMITE = 25;

const URL_DEFAULTS = { q: '', rol: '', estado: 'activo', responsabilidad: '', pagina: '1' };

export function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [state, setState] = useState({
    status: 'loading',
    usuarios: [],
    total: 0,
    totalPaginas: 1,
    error: null,
  });
  const { params, setParam, setSearch } = useUrlState(URL_DEFAULTS);
  const pagina = parsePageParam(params.pagina);

  const [usuarioDetalle, setUsuarioDetalle] = useState(null);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [restablecerTarget, setRestablecerTarget] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);


  const activeFiltersCount = [
    params.rol !== '',
    params.estado !== 'activo',
    params.responsabilidad !== '',
  ].filter(Boolean).length;

  const limpiarFiltros = () => {
    setParam('rol', '');
    setParam('estado', 'activo');
    setParam('responsabilidad', '');
    setSearch('q', '');
  };
  const [isCreating, setIsCreating] = useState(false);
  const [allAreas, setAllAreas] = useState([]);

  const [form, setForm] = useState({
    nombre: '',
    nombreUsuario: '',
    correo: '',
    telefonoE164: '',
    rol: 'AUDITOR',
    contrasena: '',
    areasResponsablesIds: [],
  });

  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [impactContext, setImpactContext] = useState(null);
  const [impactSaving, setImpactSaving] = useState(false);
  const [impactError, setImpactError] = useState('');
  const [pageActionError, setPageActionError] = useState('');

  const [isMobile, setIsMobile] = useState(false);
  const debounceRef = useRef(null);

  // Contadores de usuarios activos
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    auditores: 0,
    supers: 0,
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const cargarStats = useCallback(async () => {
    try {
      const { datos: lista, meta } = await obtenerCatalogoCompleto(usuariosApi.listar, { activo: true }, 100);
      const totalReal = meta.total ?? lista.length;
      setStats({
        total: totalReal,
        admins: lista.filter((u) => u.rol === 'ADMINISTRADOR').length,
        auditores: lista.filter((u) => u.rol === 'AUDITOR').length,
        supers: lista.filter((u) => u.rol === 'SUPER_ADMIN').length,
      });
    } catch {
      // Ignorar fallos de contadores
    }
  }, []);

  const cargarAreas = useCallback(async () => {
    try {
      const { datos } = await obtenerCatalogoCompleto(areasApi.listar, { activo: true }, 100);
      setAllAreas(datos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    } catch {
      // Ignorar errores
    }
  }, []);

  const cargar = useCallback(async (currentParams) => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const query = {};

      if (currentParams.q) query.busqueda = currentParams.q;
      if (currentParams.rol) query.rol = currentParams.rol.toUpperCase();
      if (currentParams.estado === 'activo') query.activo = true;
      else if (currentParams.estado === 'inactivo') query.activo = false;
      if (currentParams.responsabilidad) query.responsabilidad = currentParams.responsabilidad;

      const { datos } = await obtenerCatalogoCompleto(usuariosApi.listar, query, 100);

      setState({
        status: 'ready',
        usuarios: datos,
        total: datos.length,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, status: 'error', error: error?.message || 'No se pudieron cargar los usuarios.' }));
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => cargar(params), 300);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.q, params.rol, params.estado, params.responsabilidad, cargar]);

  useEffect(() => {
    cargarStats();
    cargarAreas();
  }, [cargarStats, cargarAreas]);

  const handleFiltro = (key, value) => {
    if (key === 'q') {
      setSearch('q', value);
    } else {
      setParam(key, value);
    }
  };

  const handlePagina = (p) => setParam('pagina', String(p), { resetPage: false });

  const startCreate = () => {
    setForm({
      nombre: '',
      nombreUsuario: '',
      correo: '',
      telefonoE164: '',
      rol: 'AUDITOR',
      esComodin: false,
      puedeSerAsignadoAuditoria: true,
      seEvalua: false,
      contrasena: '',
      areasResponsablesIds: [],
    });
    setShowCreatePassword(false);
    setActionError(null);
    setIsCreating(true);
  };

  const startEdit = (usuario) => {
    const responsables = (usuario.areasUsuario ?? []).map((ua) => String(ua.area.id));
    setForm({
      nombre: usuario.nombre,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo ?? '',
      telefonoE164: usuario.telefonoE164 ?? '',
      rol: usuario.rol,
      esComodin: Boolean(usuario.esComodin),
      puedeSerAsignadoAuditoria: usuario.puedeSerAsignadoAuditoria ?? true,
      seEvalua: Boolean(usuario.seEvalua),
      contrasena: '',
      areasResponsablesIds: responsables,
    });
    setShowCreatePassword(false);
    setActionError(null);
    setEditingUsuario(usuario);
  };

  const saveUsuario = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      if (form.telefonoE164 && !/^\+[1-9]\d{7,14}$/.test(form.telefonoE164.trim())) {
        throw new Error('El teléfono debe usar formato E.164, por ejemplo +525512345678.');
      }
      if (!isValidUsername(form.nombreUsuario.trim())) {
        throw new Error('El username debe usar solo letras minúsculas, sin espacios, números ni símbolos.');
      }

      if (form.seEvalua && form.areasResponsablesIds.length === 0) {
        throw new Error('Para activar "Se evalúa con KPI 50/50", el usuario debe tener al menos un área asignada.');
      }

      const payload = {
        nombre: form.nombre.trim(),
        nombreUsuario: normalizeUsernameInput(form.nombreUsuario),
        correo: form.correo?.trim() || null,
        telefonoE164: form.telefonoE164.trim() || null,
        rol: form.rol,
        esComodin: form.rol === 'ADMINISTRADOR' ? Boolean(form.esComodin) : false,
        puedeSerAsignadoAuditoria: Boolean(form.puedeSerAsignadoAuditoria ?? true),
      };

      let usuarioId;
      if (editingUsuario) {
        usuarioId = editingUsuario.id;
        const pierdeCapacidad = ['AUDITOR', 'ADMINISTRADOR'].includes(editingUsuario.rol)
          && !['AUDITOR', 'ADMINISTRADOR'].includes(payload.rol);
        if (pierdeCapacidad) {
          const impacto = await usuariosApi.impactoAuditoria(usuarioId);
          setImpactError('');
          setImpactContext({
            modo: 'rol',
            impacto,
            usuario: editingUsuario,
            payload,
            areasAnteriores: (editingUsuario.areasUsuario ?? []).map((ua) => String(ua.area.id)),
            areasNuevas: form.areasResponsablesIds,
          });
          return;
        }

        const prevResponsables = (editingUsuario.areasUsuario ?? []).map((ua) => String(ua.area.id));
        const toAdd = form.areasResponsablesIds.filter((id) => !prevResponsables.includes(id));
        const toRemove = prevResponsables.filter((id) => !form.areasResponsablesIds.includes(id));

        for (const areaId of toAdd) {
          const resultadoArea = await areasApi.guardarUsuarioArea(Number(areaId), { usuarioId });
          if (resultadoArea.impacto?.liberadas > 0) {
            window.dispatchEvent(new Event('asignaciones:pendientes-cambiaron'));
          }
        }
        for (const areaId of toRemove) {
          await areasApi.eliminarUsuarioArea(Number(areaId), usuarioId);
        }

        await usuariosApi.actualizar(usuarioId, { ...payload, seEvalua: Boolean(form.seEvalua) });
      } else {
        if (!form.contrasena) {
          throw new Error('La contraseña es obligatoria para nuevos usuarios.');
        }
        payload.contrasena = form.contrasena;
        const res = await usuariosApi.crear(payload);
        usuarioId = res.usuario.id;

        for (const areaId of form.areasResponsablesIds) {
          const resultadoArea = await areasApi.guardarUsuarioArea(Number(areaId), { usuarioId });
          if (resultadoArea.impacto?.liberadas > 0) {
            window.dispatchEvent(new Event('asignaciones:pendientes-cambiaron'));
          }
        }

        if (form.seEvalua && form.areasResponsablesIds.length > 0) {
          await usuariosApi.actualizar(usuarioId, { seEvalua: true });
        }
      }

      setIsCreating(false);
      setEditingUsuario(null);
      setShowCreatePassword(false);
      setForm({ nombre: '', nombreUsuario: '', correo: '', telefonoE164: '', rol: 'AUDITOR', esComodin: false, puedeSerAsignadoAuditoria: true, seEvalua: false, contrasena: '', areasResponsablesIds: [] });
      cargar(params);
      cargarStats();
    } catch (err) {
      setActionError(err.message || 'Error al guardar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEstado = async (usuario) => {
    const isActivo = usuario.activo;
    setPageActionError('');
    if (isActivo) {
      try {
        const impacto = await usuariosApi.impactoAuditoria(usuario.id);
        setImpactError('');
        setImpactContext({ modo: 'desactivar', impacto, usuario });
      } catch (err) {
        setPageActionError(err.message || 'No se pudo preparar la baja del usuario.');
      }
      return;
    }
    try {
      await usuariosApi.reactivar(usuario.id);
      cargar(params);
      cargarStats();
    } catch (err) {
      setPageActionError(err.message || 'No se pudo reactivar el usuario.');
    }
  };

  const sincronizarAreasUsuario = async (usuarioId, anteriores, nuevas) => {
    const toAdd = nuevas.filter((id) => !anteriores.includes(id));
    const toRemove = anteriores.filter((id) => !nuevas.includes(id));
    for (const areaId of toAdd) {
      const resultadoArea = await areasApi.guardarUsuarioArea(Number(areaId), { usuarioId });
      if (resultadoArea.impacto?.liberadas > 0) {
        window.dispatchEvent(new Event('asignaciones:pendientes-cambiaron'));
      }
    }
    for (const areaId of toRemove) {
      await areasApi.eliminarUsuarioArea(Number(areaId), usuarioId);
    }
  };

  const confirmarImpacto = async (decisiones) => {
    setImpactSaving(true);
    setImpactError('');
    try {
      if (impactContext.modo === 'desactivar') {
        const resultado = await usuariosApi.desactivar(impactContext.usuario.id, {
          usuarioActualizadoEn: impactContext.impacto.usuario.actualizadoEn,
          responsabilidades: decisiones.responsabilidades,
          auditorias: decisiones.auditorias,
        });
        if (resultado.impacto?.reasignadas > 0 || resultado.impacto?.pendientes > 0) {
          window.dispatchEvent(new Event('asignaciones:pendientes-cambiaron'));
        }
      } else {
        const resultado = await usuariosApi.actualizar(impactContext.usuario.id, {
          ...impactContext.payload,
          resolucionesAuditorias: {
            usuarioActualizadoEn: impactContext.impacto.usuario.actualizadoEn,
            auditorias: decisiones.auditorias,
          },
        });
        await sincronizarAreasUsuario(
          impactContext.usuario.id,
          impactContext.areasAnteriores,
          impactContext.areasNuevas,
        );
        if (resultado.impacto?.reasignadas > 0 || resultado.impacto?.pendientes > 0) {
          window.dispatchEvent(new Event('asignaciones:pendientes-cambiaron'));
        }
        setEditingUsuario(null);
      }
      setImpactContext(null);
      cargar(params);
      cargarStats();
    } catch (err) {
      setImpactError(err.message || 'El impacto cambió y no se aplicó ninguna modificación.');
    } finally {
      setImpactSaving(false);
    }
  };

  const columns = buildColumns(
    (usuario) => setUsuarioDetalle(usuario),
    (usuario) => startEdit(usuario),
    (usuario) => toggleEstado(usuario),
    (usuario) => setRestablecerTarget(usuario),
    currentUser,
  );

  const labelEstado = params.activo === 'true' ? ' activos' : params.activo === 'false' ? ' inactivos' : '';

  return (
    <section className="space-y-4 pb-16">
      {/* Encabezado */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento leading-none">
          ADMINISTRACIÓN
        </p>
        <h1 className="fuente-titulos text-2xl sm:text-3xl font-normal uppercase leading-tight text-marca-primario mt-0.5">
          Usuarios
        </h1>
      </div>

      {pageActionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {pageActionError}
        </div>
      )}

      {/* Resumen en 1 sola barra de 4 columnas */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 shadow-sm">
        <div className="grid grid-cols-4 divide-x divide-slate-100 text-center">
          <div className="px-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Activos</span>
            <span className="text-base sm:text-xl font-black text-slate-900">{stats.total}</span>
          </div>
          <div className="px-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-indigo-500">Audit.</span>
            <span className="text-base sm:text-xl font-black text-indigo-700">{stats.auditores}</span>
          </div>
          <div className="px-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-500">Admins</span>
            <span className="text-base sm:text-xl font-black text-amber-700">{stats.admins}</span>
          </div>
          <div className="px-1">
            <span className="block text-[10px] font-black uppercase tracking-wider text-rose-500">Super</span>
            <span className="text-base sm:text-xl font-black text-rose-700">{stats.supers}</span>
          </div>
        </div>
      </div>

      {/* Acción Nuevo usuario */}
      <div className="flex justify-end">
        <Button variant="outline" icon="add" onClick={startCreate} className="h-9 text-xs font-black">
          Nuevo usuario
        </Button>
      </div>

      {/* Filtros Mobile (Búsqueda + Botón Filtros Modal) */}
      <div className="md:hidden space-y-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, username o área a cargo…"
            value={params.q}
            onChange={(e) => handleFiltro('q', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-marca-primario focus:outline-none focus:ring-1 focus:ring-marca-primario/30 h-9"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            icon="tune"
            iconSize="16px"
            onClick={() => setShowMobileFilters(true)}
            className="h-8 px-3 text-xs font-black gap-1.5 bg-white shadow-sm"
          >
            Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {(activeFiltersCount > 0 || params.q) && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline px-1"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filtros Desktop */}
      <div className="hidden md:block rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size="18px" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, username o área a cargo…"
            value={params.q}
            onChange={(e) => handleFiltro('q', e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-marca-primario focus:outline-none focus:ring-1 focus:ring-marca-primario/30 h-9"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FilterGridGroup title="ROL" value={params.rol} options={ROLES_OPTIONS} onChange={(v) => handleFiltro('rol', v)} gridCols="grid-cols-5" />
          <FilterGridGroup title="ESTADO" value={params.estado} options={ESTADOS} onChange={(v) => handleFiltro('estado', v)} gridCols="grid-cols-3" />
          <FilterGridGroup title="RESPONSABILIDAD" value={params.responsabilidad} options={RESPONSABILIDAD_OPTS} onChange={(v) => handleFiltro('responsabilidad', v)} gridCols="grid-cols-3" />
        </div>
      </div>

      {/* Modal de Filtros Mobile */}
      <Modal isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)} className="max-w-md">
        <ModalHeader title="Filtros de Usuarios" onClose={() => setShowMobileFilters(false)} />
        <ModalBody>
          <div className="space-y-4">
            <FilterGridGroup title="ROL" value={params.rol} options={ROLES_OPTIONS} onChange={(v) => handleFiltro('rol', v)} gridCols="grid-cols-5" />
            <FilterGridGroup title="ESTADO" value={params.estado} options={ESTADOS} onChange={(v) => handleFiltro('estado', v)} gridCols="grid-cols-3" />
            <FilterGridGroup title="RESPONSABILIDAD" value={params.responsabilidad} options={RESPONSABILIDAD_OPTS} onChange={(v) => handleFiltro('responsabilidad', v)} gridCols="grid-cols-3" />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="cancelar" size="sm" onClick={limpiarFiltros}>
            Limpiar
          </Button>
          <Button variant="guardar" size="sm" onClick={() => setShowMobileFilters(false)}>
            Aplicar
          </Button>
        </ModalFooter>
      </Modal>

      {/* Loading */}
      {state.status === 'loading' && <Spinner />}

      {/* Error */}
      {state.status === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-bold text-red-700">{state.error}</p>
          <button type="button" onClick={() => cargar(params)} className="mt-1 text-xs text-red-500 underline">
            Reintentar
          </button>
        </div>
      )}

      {/* Desktop: Tabla */}
      {state.status === 'ready' && !isMobile && (
        <Table
          columns={columns}
          data={state.usuarios}
          keyField="id"
          loading={false}
          emptyMessage="No hay usuarios con los filtros aplicados."
          page={pagina}
          totalPages={state.totalPaginas}
          totalItems={state.total}
          onPageChange={handlePagina}
        />
      )}

      {/* Mobile: Cards */}
      {state.status === 'ready' && isMobile && (
        <>
          {state.usuarios.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl bg-white border border-slate-200 text-sm text-slate-400 italic">
              No hay usuarios con los filtros aplicados.
            </div>
          ) : (
            <div className="space-y-2">
              {state.usuarios.map((usuario) => (
                <UsuarioCard
                  key={usuario.id}
                  usuario={usuario}
                  currentUser={currentUser}
                  onVerDetalle={(u) => setUsuarioDetalle(u)}
                  onEditar={(u) => startEdit(u)}
                  onToggleEstado={(u) => toggleEstado(u)}
                  onRestablecerContrasena={(u) => setRestablecerTarget(u)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de detalle */}
      {usuarioDetalle && (
        <UsuarioDetalleModal
          usuario={usuarioDetalle}
          currentUser={currentUser}
          onClose={() => setUsuarioDetalle(null)}
          onRestablecerContrasena={(u) => setRestablecerTarget(u)}
        />
      )}

      {/* Modal de establecer contraseña */}
      {restablecerTarget && (
        <EstablecerContrasenaModal
          usuario={restablecerTarget}
          onClose={() => setRestablecerTarget(null)}
          onSuccess={(u) => {
            const usuarioConCredencial = { ...u, tieneCredencialCifrada: true };
            setState((current) => ({
              ...current,
              usuarios: current.usuarios.map((usuario) => (
                usuario.id === u.id
                  ? { ...usuario, tieneCredencialCifrada: true }
                  : usuario
              )),
            }));
            setUsuarioDetalle(usuarioConCredencial);
            notify.success(`Contraseña establecida correctamente para ${u.nombre}.`);
          }}
        />
      )}

      {impactContext && (
        <ImpactoUsuarioModal
          impacto={impactContext.impacto}
          modo={impactContext.modo}
          saving={impactSaving}
          error={impactError}
          onClose={() => {
            if (!impactSaving) setImpactContext(null);
          }}
          onConfirm={confirmarImpacto}
        />
      )}

      {/* Modal de Crear / Editar */}
      <Modal
        isOpen={(isCreating || !!editingUsuario) && !impactContext}
        onClose={() => {
          setIsCreating(false);
          setEditingUsuario(null);
          setShowCreatePassword(false);
          setForm({ nombre: '', nombreUsuario: '', correo: '', telefonoE164: '', rol: 'AUDITOR', esComodin: false, puedeSerAsignadoAuditoria: true, seEvalua: false, contrasena: '', areasResponsablesIds: [] });
        }}
        className="max-w-xl"
      >
        <ModalHeader
          title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          onClose={() => {
            setIsCreating(false);
            setEditingUsuario(null);
            setShowCreatePassword(false);
            setForm({ nombre: '', nombreUsuario: '', correo: '', telefonoE164: '', rol: 'AUDITOR', esComodin: false, puedeSerAsignadoAuditoria: true, seEvalua: false, contrasena: '', areasResponsablesIds: [] });
          }}
        />
        <form onSubmit={saveUsuario} autoComplete="off" className="flex min-h-0 flex-1 flex-col">
          <ModalBody>
            <div className="space-y-4 font-sans text-sm">
              {actionError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700">
                  {actionError}
                </div>
              )}

              <div>
                <Label htmlFor="crear-nombre">Nombre Completo <span className="text-red-500">*</span></Label>
                <Input
                  id="crear-nombre"
                  name="name"
                  autoComplete="name"
                  value={form.nombre}
                  required
                  placeholder="Carlos Mendoza"
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="crear-username">Username <span className="text-red-500">*</span></Label>
                <Input
                  id="crear-username"
                  name="username"
                  autoComplete="username"
                  value={form.nombreUsuario}
                  required
                  placeholder="carlosmendoza"
                  maxLength={80}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nombreUsuario: normalizeUsernameInput(e.target.value),
                    })
                  }
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Identificador único para inicio de sesión: solo letras minúsculas, sin espacios, números ni símbolos.
                </p>
              </div>

              <div>
                <Label htmlFor="crear-correo">Correo Electrónico <span className="text-slate-400 font-normal italic">(Opcional)</span></Label>
                <Input
                  id="crear-correo"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={form.correo}
                  placeholder="carlos.mendoza@cuadra.com.mx"
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="crear-tel">Teléfono <span className="text-slate-400 font-normal italic">(Opcional, E.164)</span></Label>
                <Input
                  id="crear-tel"
                  name="telefonoE164"
                  autoComplete="tel"
                  type="tel"
                  inputMode="tel"
                  value={form.telefonoE164}
                  placeholder="+525512345678"
                  onChange={(e) => setForm({ ...form, telefonoE164: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="crear-rol">Rol</Label>
                <Select
                  id="crear-rol"
                  name="rol"
                  autoComplete="off"
                  value={form.rol}
                  onChange={(e) => setForm({
                    ...form,
                    rol: e.target.value,
                    esComodin: e.target.value === 'ADMINISTRADOR' ? form.esComodin : false,
                  })}
                >
                  <option value="AUDITOR">Auditor</option>
                  <option value="ADMINISTRADOR">Administrador</option>
                  <option value="VISUALIZADOR">Visualizador</option>
                  {currentUser?.rol === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                </Select>

                <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Configuración especial
                  </p>

                  {form.rol === 'ADMINISTRADOR' && (
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(form.esComodin)}
                        onChange={(e) => setForm({ ...form, esComodin: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-marca-secundario focus:ring-marca-secundario/20"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Administrador Comodín</span>
                        <p className="text-[11px] font-medium text-slate-500">
                          Puede ejecutar auditorías pendientes de la organización en periodo vigente sin afectar su KPI personal.
                        </p>
                      </div>
                    </label>
                  )}

                  {['AUDITOR', 'ADMINISTRADOR'].includes(form.rol) && (
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.puedeSerAsignadoAuditoria ?? true}
                        onChange={(e) => setForm({ ...form, puedeSerAsignadoAuditoria: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-marca-secundario focus:ring-marca-secundario/20"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Puede ser asignado a auditorías</span>
                        <p className="text-[11px] font-medium text-slate-500">
                          Habilita al usuario para recibir asignaciones automáticas y manuales de auditoría en los periodos.
                        </p>
                      </div>
                    </label>
                  )}

                  <div className="space-y-1.5">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(form.seEvalua)}
                        onChange={(e) => setForm({ ...form, seEvalua: e.target.checked })}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-marca-secundario focus:ring-marca-secundario/20"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Se evalúa con KPI 50/50</span>
                        <p className="text-[11px] font-medium text-slate-500">
                          Incluye al usuario en el cálculo mensual del KPI 50/50 (50% cumplimiento individual + 50% promedio de áreas a cargo).
                        </p>
                      </div>
                    </label>
                    {form.seEvalua && form.areasResponsablesIds.length === 0 && (
                      <div className="ml-6 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] font-semibold text-amber-800 flex items-start gap-2">
                        <Icon name="warning" size="xs" className="text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          Para activar la evaluación de KPI 50/50, el usuario debe tener al menos un área asignada bajo su responsabilidad.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!editingUsuario && (
                <div>
                  <Label htmlFor="crear-pass">Contraseña Temporal <span className="text-red-500">*</span></Label>
                  <div className="relative flex items-center">
                    <Input
                      id="crear-pass"
                      name="new-password"
                      autoComplete="new-password"
                      type={showCreatePassword ? 'text' : 'password'}
                      value={form.contrasena}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="pr-10"
                      onChange={(e) => setForm({ ...form, contrasena: e.target.value.replace(/\s/g, '') })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showCreatePassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      aria-label={showCreatePassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      <Icon name={showCreatePassword ? 'visibility_off' : 'visibility'} size="xs" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Se forzará al usuario a cambiarla en su primer inicio de sesión.
                  </p>
                </div>
              )}

              <div>
                <p id="areas-responsabilidad-label" className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Áreas bajo su responsabilidad
                </p>
                <AreaMultiSelect
                  areas={allAreas}
                  value={form.areasResponsablesIds}
                  onChange={(areasResponsablesIds) => setForm({ ...form, areasResponsablesIds })}
                  labelId="areas-responsabilidad-label"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="cancelar"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setEditingUsuario(null);
                setShowCreatePassword(false);
                setForm({ nombre: '', nombreUsuario: '', correo: '', telefonoE164: '', rol: 'AUDITOR', esComodin: false, puedeSerAsignadoAuditoria: true, seEvalua: false, contrasena: '', areasResponsablesIds: [] });
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="guardar"
              size="sm"
              isLoading={saving}
            >
              Guardar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </section>
  );
}

