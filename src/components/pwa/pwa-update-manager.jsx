import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useRegisterSW } from 'virtual:pwa-register/react';

import {
  waitForAuditSafeToReload,
} from '@/features/auditorias/ejecucion/utils/auditoria-runtime-status';

const UPDATE_CHECK_INTERVAL_MS = 45 * 60 * 1000;
const AUTOSAVE_SETTLE_MS = 800;
const AUDIT_UPDATE_RETRY_MS = 30 * 1000;
const RELOAD_GUARD_KEY = 'encuestas-5s:pwa-update-reload-at';
const RELOAD_GUARD_MS = 30 * 1000;

const isAuditCapturePath = (pathname) => (
  /^\/auditorias\/[^/]+\/realizar\/?$/i.test(pathname) ||
  /^\/invitado\/[^/]+\/auditoria\/?$/i.test(pathname)
);

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
  const location = useLocation();
  const registrationRef = useRef(null);
  const swUrlRef = useRef('');
  const checkingRef = useRef(false);
  const applyingRef = useRef(false);
  const pendingReloadRef = useRef(false);
  const controllerReloadedRef = useRef(false);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  const checkForUpdate = useCallback(async () => {
    const registration = registrationRef.current;
    const swUrl = swUrlRef.current;

    if (
      !registration ||
      checkingRef.current ||
      navigator.onLine === false ||
      registration.installing ||
      !swUrl
    ) {
      return;
    }

    checkingRef.current = true;

    try {
      const response = await fetch(swUrl, {
        cache: 'no-store',
        headers: {
          'cache-control': 'no-cache',
        },
      });

      if (response.status !== 200) {
        return;
      }

      await registration.update();
    } catch {
      // La app sigue funcionando; la próxima verificación volverá a intentar.
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const reloadForNewController = useCallback(() => {
    if (controllerReloadedRef.current || hasRecentReloadGuard()) {
      return;
    }

    controllerReloadedRef.current = true;
    pendingReloadRef.current = false;
    markReloadGuard();
    window.location.reload();
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
    if (!('serviceWorker' in navigator)) {
      return undefined;
    }

    const handleControllerChange = () => {
      if (pendingReloadRef.current) {
        reloadForNewController();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, [reloadForNewController]);

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

    try {
      if (waitForAudit) {
        const isSafe = await waitForAuditSafeToReload({
          autosaveSettleMs: AUTOSAVE_SETTLE_MS,
          uploadTimeoutMs: 15000,
        });

        if (!isSafe) {
          applyingRef.current = false;
          setIsApplying(false);
          window.setTimeout(() => setRetryTick(Date.now()), AUDIT_UPDATE_RETRY_MS);
          return;
        }
      }

      setIsApplying(true);
      pendingReloadRef.current = true;
      await updateServiceWorker(false);

      window.setTimeout(() => {
        if (pendingReloadRef.current) {
          reloadForNewController();
        }
      }, 3000);
    } catch {
      applyingRef.current = false;
      setIsApplying(false);
      pendingReloadRef.current = false;
      window.setTimeout(() => setRetryTick(Date.now()), AUDIT_UPDATE_RETRY_MS);
    }
  }, [reloadForNewController, updateServiceWorker]);

  const isAuditCapture = isAuditCapturePath(location.pathname);

  useEffect(() => {
    if (!updateAvailable || isAuditCapture || applyingRef.current) {
      return;
    }

    applyUpdate();
  }, [applyUpdate, isAuditCapture, updateAvailable, retryTick]);

  useEffect(() => {
    if (!updateAvailable || !isAuditCapture || applyingRef.current) {
      return;
    }

    applyUpdate({ waitForAudit: true });
  }, [applyUpdate, isAuditCapture, retryTick, updateAvailable]);

  if (!isApplying) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[9998] mx-auto max-w-sm print:hidden">
      <div className="rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-center text-sm font-black text-slate-900 shadow-2xl shadow-slate-950/18 backdrop-blur-2xl">
        Actualizando aplicación...
      </div>
    </div>
  );
}
