import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';

const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutos

export function PwaUpdatePrompt() {
  const [cerradoTemporal, setCerradoTemporal] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (!r) return;

      // Comprobación periódica cada 30 minutos
      setInterval(async () => {
        if (!r.installing && navigator.onLine) {
          try {
            const resp = await fetch(swUrl, {
              cache: 'no-store',
              headers: {
                'cache': 'no-store',
                'cache-control': 'no-cache',
              },
            });
            if (resp?.status === 200) {
              await r.update();
            }
          } catch {
            // Ignorar fallos de red en segundo plano
          }
        }
      }, CHECK_INTERVAL_MS);
    },
    onRegisterError(error) {
      console.error('Error registrando Service Worker:', error);
    },
  });

  // Resetear el estado de cerrado si deja de requerir actualización
  useEffect(() => {
    if (!needRefresh) {
      setCerradoTemporal(false);
    }
  }, [needRefresh]);

  if (!needRefresh || cerradoTemporal) {
    return null;
  }

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleMasTarde = () => {
    setCerradoTemporal(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-marca-acento/10 text-marca-acento">
          <span className="material-symbols-rounded text-2xl">system_update</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900">Nueva versión disponible</h3>
          <p className="text-xs font-semibold leading-relaxed text-slate-500">
            Hay una actualización de la aplicación lista para instalar.
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleMasTarde}
          className="text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          Más tarde
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleUpdate}
          className="text-xs font-black"
        >
          Actualizar ahora
        </Button>
      </div>
    </div>
  );
}
