import { RouterProvider } from 'react-router';
import { PwaUpdateManager } from '@/components/pwa/pwa-update-manager';
import { ToastContainer } from '@/components/notification/toast-container';
import { AuthProvider } from '@/features/auth/context/auth-context';
import { router } from '@/app/router';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <PwaUpdateManager />
      <ToastContainer />
    </AuthProvider>
  );
}
