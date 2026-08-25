import { useSyncExternalStore } from 'react';

let state = {
  mobileMenuOpen: false,
  sidebarExpanded: false,
  isBottomNav: false,
  badgeCounts: {},
};

const listeners = new Set();
const actions = {
  openMobileMenu: () => setState({ mobileMenuOpen: true }),
  closeMobileMenu: () => setState({ mobileMenuOpen: false }),
  toggleMobileMenu: () => setState((current) => ({ mobileMenuOpen: !current.mobileMenuOpen })),
  setIsBottomNav: (isBottomNav) => setState({ isBottomNav }),
  setBadgeCounts: (badgeCounts) => setState({ badgeCounts }),
  setSidebarExpanded: (sidebarExpanded) => setState({ sidebarExpanded }),
};

let snapshot = { ...state, ...actions };

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (patch) => {
  state = {
    ...state,
    ...(typeof patch === 'function' ? patch(state) : patch),
  };
  snapshot = { ...state, ...actions };
  emit();
};

export function useUIStore(selector = (value) => value) {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => selector(snapshot),
    () => selector(snapshot),
  );
}

useUIStore.setState = setState;
useUIStore.getState = () => snapshot;
useUIStore.getActions = () => actions;
