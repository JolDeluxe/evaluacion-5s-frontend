import { useCallback, useEffect, useRef, useState } from 'react';
import { notify } from '@/components/notification/adaptive-notify';

const REVEAL_DURATION_MS = 2 * 60 * 1000;

export function useCredentialReveal({ loadCredential, resetKey }) {
  const [revealedCredential, setRevealedCredential] = useState(null);
  const [loadingCredential, setLoadingCredential] = useState(false);
  const [copied, setCopied] = useState(false);
  const revealTimerRef = useRef(null);
  const copiedTimerRef = useRef(null);
  const requestRevisionRef = useRef(0);
  const mountedRef = useRef(true);

  const clearCredential = useCallback(() => {
    requestRevisionRef.current += 1;
    clearTimeout(revealTimerRef.current);
    clearTimeout(copiedTimerRef.current);
    setRevealedCredential(null);
    setLoadingCredential(false);
    setCopied(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestRevisionRef.current += 1;
      clearTimeout(revealTimerRef.current);
      clearTimeout(copiedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    clearCredential();
  }, [clearCredential, resetKey]);

  const requestCredential = useCallback(async () => {
    const requestRevision = ++requestRevisionRef.current;
    setLoadingCredential(true);

    try {
      const response = await loadCredential();
      if (!mountedRef.current || requestRevision !== requestRevisionRef.current) return null;

      const data = response?.datos ?? response;
      if (typeof data?.credencial !== 'string' || !data.credencial) {
        notify.info(
          data?.mensaje
            || 'La visualización estará disponible después de establecer una nueva contraseña.',
        );
        return null;
      }

      return data.credencial;
    } catch (error) {
      if (mountedRef.current && requestRevision === requestRevisionRef.current) {
        notify.error(error?.message || 'No se pudo obtener la contraseña.');
      }
      return null;
    } finally {
      if (mountedRef.current && requestRevision === requestRevisionRef.current) {
        setLoadingCredential(false);
      }
    }
  }, [loadCredential]);

  const toggleCredential = useCallback(async () => {
    if (revealedCredential) {
      clearCredential();
      return;
    }

    const credential = await requestCredential();
    if (!credential || !mountedRef.current) return;

    setRevealedCredential(credential);
    setCopied(false);
    clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(clearCredential, REVEAL_DURATION_MS);
  }, [clearCredential, requestCredential, revealedCredential]);

  const copyCredential = useCallback(async () => {
    const credential = revealedCredential || await requestCredential();
    if (!credential || !mountedRef.current) return;

    try {
      await navigator.clipboard.writeText(credential);
      if (!mountedRef.current) return;
      setCopied(true);
      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => {
        if (mountedRef.current) setCopied(false);
      }, 2000);
    } catch {
      notify.error('No se pudo copiar la contraseña al portapapeles.');
    }
  }, [requestCredential, revealedCredential]);

  return {
    revealedCredential,
    loadingCredential,
    copied,
    toggleCredential,
    copyCredential,
    clearCredential,
  };
}
