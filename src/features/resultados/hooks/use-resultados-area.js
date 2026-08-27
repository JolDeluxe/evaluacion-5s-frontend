import { useCallback, useEffect, useState } from 'react';
import { resultadosApi } from '@/features/resultados/api/resultados-api';

export function useResultadosArea(areaId, { mes }) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
  });

  const fetchData = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await resultadosApi.obtenerArea(areaId, { mes });
      setState({ loading: false, error: null, data });
    } catch (error) {
      setState({
        loading: false,
        error: error?.message || 'No se pudo cargar el resultado del área.',
        data: null,
      });
    }
  }, [areaId, mes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}
