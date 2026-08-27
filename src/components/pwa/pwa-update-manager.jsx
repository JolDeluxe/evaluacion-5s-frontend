import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  getAuditRuntimeStatus,
  subscribeAuditRuntimeStatus,
  waitForAuditIdle,
} from '@/features/auditorias/utils/auditoria-runtime-status';

const UPDATE_CHECK_INTERVAL_MS = 45 * 60 * 1000;
const AUTOSAVE_SETTLE_MS = 800;
const RELOAD_GUARD_KEY = 'encuestas-5s:pwa-update-reload-at';
const RELOAD_GUARD_MS = 30 * 1000;

const isAuditCapturePath = (pathname) => (
  /^\/auditorias\/[^/]+\/realizar\/?$/i.test(pathname) ||
  /^\/invitado\/[^/]+\/auditoria\/?$/i.test(pathname)
);

const getCurrentPath = () => window.location.pathname;

const hasRecentReloadGuard = () => {
  try {
    const value = Number(sessionStorage.getItem(RELOAD_GUARD_KEY));
    return value > 0 && Date.now() - value < RELOAD_GUARD_MS;
  } catch {
    return false;
  }
};

const markReloadGuard = () => {
  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // noop
  }
};

const clearExpiredReloadGuard = () => {
  try {
    const value = Number(sessionStorage.getItem(RELOAD_GUARD_KEY));
    if (!value || Date.now() - value >= RELOAD_GUARD_MS) {
      sessionStorage.removeItem(RELOAD_GUARD_KEY);
    }
  } catch {
    // noop
  }
};

export function PwaUpdateManager() {
  const registrationRef = useRef(null);
  const swUrlRef = useRef('');
  const checkingRef = useRef(false);
  const applyingRef = useRef(false);

  const [path, setPath] = useState(getCurrentPath);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [status, setStatus] = useState(getAuditRuntimeStatus);
  const [message, setMessage] = useState('');

  const checkForUpdate = useCallback(async () => {
    const registration = registrationRef.current;
    const swUrl = swUrlRef.current;

    if (!registration || checkingRef.current) {
      return;
    }

    checkingRef.current = true;

    try {
      if (swUrl) {
        await fetch(swUrl, {
          cache: 'no-store',
          headers: {
            'cache-control': 'no-cache',
          },
        });
      }

      await registration.update();
    } catch {
      // La app sigue funcionando; la próxima verificación volverá a intentar.
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onNeedRefresh() {
      setUpdateAvailable(true);
    },
    onRegisteredSW(swUrl, registration) {
      swUrlRef.current = swUrl;
      registrationRef.current = registration ?? null;

      window.setTimeout(() => {
        checkForUpdate();
      }, 1000);
    },
    onRegisterError(error) {
      console.error('No se pudo registrar el Service Worker.', error);
    },
  });

  useEffect(() => {
    setUpdateAvailable(needRefresh);
  }, [needRefresh]);

  useEffect(() => {
    clearExpiredReloadGuard();
    const timeoutId = window.setTimeout(clearExpiredReloadGuard, RELOAD_GUARD_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeAuditRuntimeStatus(setStatus);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const syncPath = () => setPath(getCurrentPath());
    const intervalId = window.setInterval(syncPath, 1000);

    window.addEventListener('popstate', syncPath);
    window.addEventListener('hashchange', syncPath);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener('hashchange', syncPath);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };

    window.addEventListener('focus', checkForUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', checkForUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkForUpdate]);

  const applyUpdate = useCallback(async ({ waitForAudit = false } = {}) => {
    if (applyingRef.current || hasRecentReloadGuard()) {
      return;
    }

    applyingRef.current = true;
    setIsApplying(true);

    try {
      if (waitForAudit) {
        setMessage('Guardando progreso antes de actualizar...');
        await new Promise((resolve) => window.setTimeout(resolve, AUTOSAVE_SETTLE_MS));

        if (getAuditRuntimeStatus().isBusy) {
          setMessage('Esperando a que terminen las fotos en subida...');
        }

        const isIdle = await waitForAuditIdle({ timeoutMs: 15000 });

        if (!isIdle) {
          setMessage('Termina o cancela las fotos en subida antes de actualizar.');
          applyingRef.current = false;
          setIsApplying(false);
          return;
        }
      }

      markReloadGuard();
      await updateServiceWorker(true);
    } catch {
      applyingRef.current = false;
      setIsApplying(false);
      setMessage('No se pudo aplicar la actualización. Intenta de nuevo.');
    }
  }, [updateServiceWorker]);

  const isAuditCapture = isAuditCapturePath(path);

  useEffect(() => {
    if (!updateAvailable || isAuditCapture || applyingRef.current) {
      return;
    }

    applyUpdate();
  }, [applyUpdate, isAuditCapture, updateAvailable]);

  if (!updateAvailable || !isAuditCapture) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[9998] mx-auto max-w-md print:hidden">
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl shadow-slate-950/18 backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Icon name="system_update_alt" size="sm" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-950">
              Nueva versión disponible
            </p>

            <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
              Hay una actualización disponible. Tu progreso está guardado.
            </p>

            {status.isBusy && (
              <p className="mt-1 text-xs font-bold text-amber-700">
                Hay {status.uploadsInProgress} foto{status.uploadsInProgress === 1 ? '' : 's'} en subida.
              </p>
            )}

            {message && (
              <p className="mt-1 text-xs font-bold text-slate-500">
                {message}
              </p>
            )}

            <Button
              type="button"
              size="sm"
              className="mt-3 rounded-xl"
              icon="refresh"
              onClick={() => applyUpdate({ waitForAudit: true })}
              disabled={isApplying}
            >
              {isApplying ? 'Actualizando...' : 'Actualizar ahora'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
