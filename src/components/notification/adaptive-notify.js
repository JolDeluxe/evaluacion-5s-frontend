import { useSyncExternalStore } from 'react';

let notifications = [];
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export function useNotificationStore() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => notifications,
    () => notifications,
  );
}

export function dismissNotification(id) {
  notifications = notifications.filter((notification) => notification.id !== id);
  notifyListeners();
}

function pushNotification(message, type = 'info') {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  notifications = [...notifications, { id, message, type }].slice(-3);
  notifyListeners();

  window.setTimeout(() => dismissNotification(id), 4000);
}

export const notify = {
  success: (message) => pushNotification(message, 'success'),
  error: (message) => pushNotification(message, 'error'),
  info: (message) => pushNotification(message, 'info'),
  warning: (message) => pushNotification(message, 'warning'),
};
