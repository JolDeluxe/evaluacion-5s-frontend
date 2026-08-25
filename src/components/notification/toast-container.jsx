import { dismissNotification, useNotificationStore } from './adaptive-notify';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';

const stylesByType = {
  success: {
    icon: 'check_circle',
    className: 'border-emerald-200/70 bg-emerald-50/90 text-emerald-950',
  },
  error: {
    icon: 'error',
    className: 'border-rose-200/70 bg-rose-50/90 text-rose-950',
  },
  warning: {
    icon: 'warning',
    className: 'border-amber-200/70 bg-amber-50/90 text-amber-950',
  },
  info: {
    icon: 'info',
    className: 'border-sky-200/70 bg-sky-50/90 text-sky-950',
  },
};

export const ToastContainer = () => {
  const notifications = useNotificationStore();
  const isDesktop = useIsDesktop();

  if (!notifications.length) return null;

  return (
    <div
      className={cn(
        'fixed z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 print:hidden',
        isDesktop ? 'bottom-5 right-5' : 'bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2',
      )}
    >
      {notifications.map((notification) => {
        const visual = stylesByType[notification.type] || stylesByType.info;

        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl shadow-slate-950/10 backdrop-blur-2xl',
              visual.className,
            )}
          >
            <Icon name={visual.icon} size="sm" fill />
            <p className="min-w-0 flex-1 text-sm font-semibold leading-snug">{notification.message}</p>
            <button
              type="button"
              onClick={() => dismissNotification(notification.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/50 text-current transition hover:bg-white/80"
              aria-label="Cerrar notificación"
            >
              <Icon name="close" size="xs" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
