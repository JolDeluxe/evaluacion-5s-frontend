import { useEffect, useState } from 'react';
import { inicioApi } from '@/features/inicio/api/inicio-api';

export function useInicioDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inicioApi.obtenerDashboard();
      setData(res);
    } catch (err) {
      console.error('Error al cargar dashboard de inicio:', err);
      setError(err?.message || 'No se pudo cargar la información de inicio.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return { data, loading, error, refetch: cargar };
}
