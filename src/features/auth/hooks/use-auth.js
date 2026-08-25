import { useContext } from 'react';
import { AuthContext } from '@/features/auth/context/auth-context-value';

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return value;
}
