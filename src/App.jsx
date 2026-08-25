import { RouterProvider } from 'react-router';
import { ToastContainer } from '@/components/notification/toast-container';
import { AuthProvider } from '@/features/auth/context/auth-context';
import { router } from '@/app/router';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer />
    </AuthProvider>
  );
}
