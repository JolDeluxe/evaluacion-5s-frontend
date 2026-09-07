import { useState } from 'react';
import { Card, CardBody } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { PerfilSummaryCard } from '../components/perfil-summary-card';
import { PerfilInfoCard } from '../components/perfil-info-card';
import { PerfilGeneralForm } from '../components/perfil-general-form';
import { PerfilPasswordForm } from '../components/perfil-password-form';
import { perfilApi } from '../api/perfil-api';
import { useCredentialReveal } from '@/hooks/use-credential-reveal';

export function PerfilDesktop({
  user,
  updating,
  error,
  onUpdate,
  onChangePassword,
  clearError,
}) {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [changingPassword, setChangingPassword] = useState(false);
  const {
    revealedCredential: revealedPassword,
    loadingCredential: loadingCred,
    copied,
    toggleCredential: handleToggleReveal,
    copyCredential: handleCopiarPassword,
    clearCredential,
  } = useCredentialReveal({
    loadCredential: perfilApi.obtenerMiCredencial,
    resetKey: user?.id,
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* Header */}
      <div>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-marca-acento">Cuenta</p>
        <h1 className="text-3xl font-black text-slate-950">Mi Perfil</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Gestiona tu información personal y configuración de seguridad.
        </p>
      </div>

      {/* Summary Card */}
      <PerfilSummaryCard user={user} />

      {/* Navigation tabs & Action */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="inline-flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('general');
              setEditing(false);
              setChangingPassword(false);
              clearCredential();
              clearError?.();
            }}
            className={`cursor-pointer flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'general'
                ? 'bg-marca-primario text-white shadow-md shadow-marca-primario/20 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Icon name="person" size="xs" />
            Datos Generales
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('security');
              setEditing(false);
              setChangingPassword(false);
              clearError?.();
            }}
            className={`cursor-pointer flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'security'
                ? 'bg-marca-primario text-white shadow-md shadow-marca-primario/20 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Icon name="lock" size="xs" />
            Seguridad
          </button>
        </div>

        {activeTab === 'general' && !editing && (
          <Button
            type="button"
            onClick={() => setEditing(true)}
            variant="editar"
            icon="edit"
            size="sm"
          >
            Editar Información
          </Button>
        )}
      </div>

      {/* Main Content Card */}
      <Card className="border border-white/70 bg-white/80 shadow-xl backdrop-blur-xl rounded-2xl overflow-hidden w-full">
        <CardBody className="p-8">
          {activeTab === 'general' ? (
            editing ? (
              <div className="animate-in fade-in duration-200">
                <PerfilGeneralForm
                  user={user}
                  onSave={async (d) => {
                    const ok = await onUpdate(d);
                    if (ok) setEditing(false);
                  }}
                  onCancel={() => {
                    setEditing(false);
                    clearError?.();
                  }}
                  updating={updating}
                  error={error}
                  clearError={clearError}
                />
              </div>
            ) : (
              <PerfilInfoCard user={user} />
            )
          ) : (
            <div className="space-y-6">
              {!changingPassword ? (
                <div>
                  <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2 uppercase tracking-wide">
                    <Icon name="shield" size="sm" className="text-marca-primario" />
                    Seguridad de la Cuenta
                  </h3>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="block text-xs font-black uppercase tracking-wider text-slate-400">
                        Contraseña
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xl tracking-widest text-slate-800 select-all font-bold">
                          {revealedPassword || '••••••••••••'}
                        </span>
                        {user?.tieneCredencialCifrada !== false && (
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

                      {user?.tieneCredencialCifrada === false ? (
                        <p className="text-xs text-amber-700 font-medium block mt-1">
                          Tu contraseña actual fue creada antes de habilitar la visualización y no puede recuperarse. Cámbiala para habilitar ojo y copiar.
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 block mt-1">
                          {revealedPassword
                            ? 'Contraseña visible temporalmente (se ocultará automáticamente en 2 minutos).'
                            : 'Haz clic en el ojo para ver tu contraseña actual.'}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon="lock_reset"
                      onClick={() => {
                        clearCredential();
                        setChangingPassword(true);
                      }}
                      className="shrink-0 text-xs font-bold"
                    >
                      Cambiar contraseña
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto py-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Icon name="lock_reset" size="sm" className="text-marca-primario" />
                      Cambiar Contraseña
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setChangingPassword(false);
                        clearError?.();
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Icon name="arrow_back" size="xs" />
                      Volver
                    </button>
                  </div>
                  <PerfilPasswordForm
                    onSave={async (d) => {
                      const ok = await onChangePassword(d);
                      if (ok) {
                        clearCredential();
                        setChangingPassword(false);
                      }
                    }}
                    onCancel={() => {
                      setChangingPassword(false);
                      clearError?.();
                    }}
                    updating={updating}
                    error={error}
                    clearError={clearError}
                  />
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
