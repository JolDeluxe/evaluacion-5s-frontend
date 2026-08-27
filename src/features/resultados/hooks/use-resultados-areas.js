import { useCallback, useEffect, useState } from 'react';
import { resultadosApi } from '@/features/resultados/api/resultados-api';

export function useResultadosAreas({ mes, enabled = true }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await resultadosApi.obtenerAreas({ mes });
      setState({ loading: false, error: null, data });
    } catch (error) {
      setState({
        loading: false,
        error: error?.message || 'No se pudieron cargar las áreas.',
        data: null,
      });
    }
  }, [enabled, mes]);

  useEffect(() => {
    if (enabled) fetchData();
  }, [enabled, fetchData]);

  return { ...state, refetch: fetchData };
}
