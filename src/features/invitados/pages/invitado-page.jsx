import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Icon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { notify } from '@/components/notification/adaptive-notify';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { auditoriasApi } from '@/features/auditorias/ejecucion/api/auditorias-api';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function periodoLabel(ciclo) {
  if (!ciclo) return 'Evaluación 5S';
  const periodo = ciclo.numeroCorte === 1
    ? 'Primer periodo'
    : ciclo.numeroCorte === 2
      ? 'Segundo periodo'
      : `Periodo ${ciclo.numeroCorte}`;
  const mes = MESES[(ciclo.mes ?? 1) - 1] ?? '';
  return `${periodo} · ${mes} ${ciclo.anio ?? ''}`.trim();
}

export function InvitadoPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [state, setState] = useState({ status: 'loading', contexto: null, error: '' });
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    let active = true;
    auditoriasApi.obtenerContextoInvitado(token)
      .then((contexto) => {
        if (active) setState({ status: 'ready', contexto, error: '' });
      })
      .catch((error) => {
        if (active) setState({ status: 'error', contexto: null, error: error?.message || 'Invitación no válida.' });
      });
    return () => { active = false; };
  }, [token]);

  const comenzar = () => {
    const nombreLimpio = nombre.trim();
    if (!auth.isAuthenticated && nombreLimpio.length < 3) {
      notify.warning('Escribe tu nombre para continuar.');
      return;
    }

    navigate(`/invitado/${token}/auditoria`, {
      state: { nombreInvitado: auth.isAuthenticated ? auth.user?.nombre : nombreLimpio },
    });
  };

  if (state.status === 'loading' || auth.status === 'loading') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-app-surface p-5">
        <Spinner label="Validando invitación..." />
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-app-surface p-5">
        <Card className="w-full max-w-lg bg-white/80 shadow-2xl backdrop-blur-xl">
          <CardBody className="space-y-4 p-6 text-center">
            <Icon name="link_off" size="xl" className="mx-auto text-rose-600" />
            <h1 className="text-2xl font-black text-slate-950">Invitación no disponible</h1>
            <p className="text-sm font-semibold leading-6 text-slate-600">{state.error}</p>
          </CardBody>
        </Card>
      </main>
    );
  }

  const invitacion = state.contexto?.invitacion;
  const area = invitacion?.area?.nombre ?? invitacion?.objetivo?.nombreAreaSnapshot ?? 'Área';
  const auditorOriginal = invitacion?.asignacion?.auditor?.nombre ?? 'Auditor asignado';

  return (
    <main className="flex min-h-dvh items-center justify-center bg-app-surface p-5">
      <Card className="w-full max-w-lg border-white/70 bg-white/80 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
        <CardBody className="space-y-6 p-6">
          <div className="text-center">
            <Icon name="assignment_ind" size="xl" className="mx-auto text-marca-primario" />
            <p className="mt-4 text-xs font-black uppercase tracking-[0.25em] text-marca-acento">
              Auditoría compartida
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{area}</h1>
            <p className="mt-1 text-sm font-bold text-slate-500">{periodoLabel(invitacion?.ciclo)}</p>
          </div>

          <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Asignada originalmente a</p>
              <p className="text-sm font-black text-slate-900">{auditorOriginal}</p>
            </div>
            {auth.isAuthenticated ? (
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Realizarás esta auditoría como</p>
                <p className="text-sm font-black text-marca-primario">{auth.user?.nombre}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="nombreInvitado">Tu nombre</Label>
                <Input
                  id="nombreInvitado"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="María López"
                  maxLength={160}
                />
              </div>
            )}
          </div>

          <Button type="button" size="lg" icon="arrow_forward" className="w-full rounded-2xl" onClick={comenzar}>
            Comenzar auditoría
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
