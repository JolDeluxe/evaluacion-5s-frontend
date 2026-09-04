import { OfflinePendingBadge } from '@/components/ui/offline-pending-badge';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useInicioDashboard } from '@/features/inicio/hooks/use-inicio-dashboard';
import { InicioHeader } from '@/features/inicio/components/inicio-header';
import { ResumenTarjetasMes } from '@/features/inicio/components/resumen-tarjetas-mes';
import { ControlAuditoriasAdmin } from '@/features/inicio/components/control-auditorias-admin';
import { MisPendientesAuditor } from '@/features/inicio/components/mis-pendientes-auditor';
import { ResultadoGlobalCard } from '@/features/inicio/components/resultado-global-card';
import { ResultadosDepartamentos } from '@/features/inicio/components/resultados-departamentos';

export function InicioPage() {
  const { user } = useAuth();
  const { data, loading, error } = useInicioDashboard();

  const esAdmin = Boolean(user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPER_ADMIN');

  if (loading) {
    return (
      <section className="space-y-6">
        <OfflinePendingBadge />
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <OfflinePendingBadge />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* 1. Cabecera / Bienvenida */}
      <InicioHeader
        user={user}
        esAdmin={esAdmin}
        etiquetaMesControl={data?.etiquetaMesControl}
      />

      {/* 2. Resultado Global destacado */}
      {data?.resultadoGlobal && (
        <ResultadoGlobalCard resultadoGlobal={data.resultadoGlobal} />
      )}

      {/* 3. Auditorías del Mes (Métricas por Periodo) */}
      {(data?.periodosResumen || data?.resumen) && (
        <ResumenTarjetasMes
          periodosResumen={data?.periodosResumen}
          resumen={data?.resumen}
          esAdmin={esAdmin}
          etiquetaMesControl={data.etiquetaMesControl}
        />
      )}

      {/* 4. Auditoría Personal (Mis auditorías pendientes) */}
      <MisPendientesAuditor
        misPendientesResumen={data?.misPendientesResumen}
      />

      {/* 5. Control de Auditorías (Administración) */}
      {esAdmin && (
        <ControlAuditoriasAdmin
          etiquetaMesControl={data?.etiquetaMesControl}
          mostrarMesAnterior={data?.mostrarMesAnterior}
          etiquetaMesAnterior={data?.etiquetaMesAnterior}
          controlFilas={data?.controlFilas}
        />
      )}

      {/* 6. Departamentos a tu cargo (Cualquier rol con responsabilidad de área) */}
      <ResultadosDepartamentos
        departamentosCargo={data?.departamentosCargo}
      />
    </section>
  );
}
