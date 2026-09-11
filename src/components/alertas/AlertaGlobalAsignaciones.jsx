import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ROLES } from '@/config/navigation-config';
import { asignacionesApi } from '@/features/administracion/asignaciones/api/asignaciones-api';

export function AlertaGlobalAsignaciones() {
  const { user } = useAuth();
  const [alerta, setAlerta] = useState(null);

  const esAdmin = user?.rol === ROLES.ADMINISTRADOR || user?.rol === ROLES.SUPER_ADMIN;

  const ahora = useMemo(() => new Date(), []);
  const anio = ahora.getFullYear();
  const mes = ahora.getMonth() + 1;

  const cargarAlertas = useCallback(async () => {
    if (!esAdmin) return;
    try {
      const data = await asignacionesApi.obtenerAlertas({ anio, mes });
      setAlerta(data);
    } catch {
      // Manejo silencioso en caso de error de red
    }
  }, [esAdmin, anio, mes]);

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  // Escuchar eventos de reasignación/asignación por si cambian en vivo
  useEffect(() => {
    const onActualizado = () => cargarAlertas();
    window.addEventListener('asignaciones:pendientes-cambiaron', onActualizado);
    return () => window.removeEventListener('asignaciones:pendientes-cambiaron', onActualizado);
  }, [cargarAlertas]);

  if (!esAdmin || !alerta || !alerta.faltantes || alerta.faltantes <= 0) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mx-4 mt-4 sm:mx-0 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
        <div className="flex items-center justify-center bg-amber-100/80 rounded-full p-2 text-amber-600 shrink-0">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <span className="text-sm text-amber-950 font-medium leading-relaxed">
          Atención: Hay <strong className="font-bold text-amber-950">{alerta.faltantes}</strong> {alerta.faltantes === 1 ? 'área' : 'áreas'} sin auditor asignado para este mes.
        </span>
      </div>
      <Link
        to="/admin/asignaciones"
        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center shrink-0"
      >
        <span>Asignar ahora</span>
        <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
      </Link>
    </div>
  );
}
