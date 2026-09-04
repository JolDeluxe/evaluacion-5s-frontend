import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Card, CardBody } from '@/components/ui/card';
import { qrApi } from '../api/qr-api';
import { invitadosApi } from '@/features/invitados/api/invitados-api';
import { notify } from '@/components/notification/adaptive-notify';

export function QrTargetPage() {
  const { codigo: codigoParam } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [codigoInput, setCodigoInput] = useState(codigoParam ?? '');
  const [loading, setLoading] = useState(!!codigoParam);
  const [error, setError] = useState(null);
  const [areaInfo, setAreaInfo] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);

  // Modo invitado
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [iniciandoInvitado, setIniciandoInvitado] = useState(false);

  useEffect(() => {
    if (!codigoParam) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    qrApi
      .resolverCodigo(codigoParam)
      .then((res) => {
        if (!active) return;
        if (!res.disponible) {
          setError(res.motivo || 'Esta área no está disponible para auditoría.');
          setAreaInfo(res.area);
          return;
        }

        setAreaInfo(res.area);
        const asigs = res.asignacionesDisponibles ?? [];
        setAsignaciones(asigs);

        // Si el usuario está autenticado y tiene exactamente 1 asignación realizable
        if (usuario && asigs.length === 1) {
          navigate(`/auditorias/${asigs[0].id}/realizar`, { replace: true });
        }
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Código de área no válido');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [codigoParam, usuario, navigate]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const cleanCode = codigoInput.trim().toUpperCase();
    if (!cleanCode) return;
    navigate(`/q/${encodeURIComponent(cleanCode)}`);
  };

  const handleIniciarInvitado = async (e) => {
    e.preventDefault();
    if (!nombreInvitado.trim()) {
      notify.error('Por favor ingresa tu nombre para continuar como invitado.');
      return;
    }

    setIniciandoInvitado(true);
    try {
      const res = await invitadosApi.iniciarPublico({
        areaId: areaInfo.id,
        nombre: nombreInvitado.trim(),
      });
      const token = res.contextoInvitadoToken;
      navigate(`/invitado/${token}/auditoria`, {
        state: { nombreInvitado: nombreInvitado.trim() },
        replace: true,
      });
    } catch (err) {
      notify.error(err?.message || 'No se pudo iniciar la auditoría como invitado.');
    } finally {
      setIniciandoInvitado(false);
    }
  };

  // Render si no hay código en URL (Búsqueda manual)
  if (!codigoParam) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-surface p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,132,115,0.18),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(244,158,72,0.16),transparent_24%),linear-gradient(135deg,#f8fafc,#eef4f1_45%,#fff7ed)]" />
        <Card className="relative z-10 w-full max-w-md border-white/70 bg-white/80 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl rounded-3xl">
          <CardBody className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-primario/10 text-marca-primario">
                <Icon name="qr_code_scanner" size="24px" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">AUDITORÍA 5S</p>
              <h1 className="text-2xl font-black text-slate-950">Ingreso por código de área</h1>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Ingresa el código alfanumérico impreso en la hoja del área para acceder a la auditoría.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label required>Código del área</Label>
                <Input
                  type="text"
                  placeholder="Ej. K7M4-Q9X2"
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  className="font-mono uppercase text-center tracking-widest text-base font-bold h-11"
                  required
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                variant="primario"
                className="w-full h-11 font-bold text-sm"
                icon="arrow_forward"
                disabled={!codigoInput.trim()}
              >
                Continuar
              </Button>
            </form>

            <div className="border-t border-slate-100 pt-4 text-center">
              <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">
                ¿Tienes una cuenta? Inicia sesión aquí
              </Link>
            </div>
          </CardBody>
        </Card>
      </main>
    );
  }

  // Estado cargando
  if (loading) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center bg-app-surface p-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner size="lg" className="text-marca-primario" />
          <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">
            Verificando código del área...
          </p>
        </div>
      </main>
    );
  }

  // Error (Código inválido o área inactiva)
  if (error || !areaInfo) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-surface p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,132,115,0.18),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(244,158,72,0.16),transparent_24%),linear-gradient(135deg,#f8fafc,#eef4f1_45%,#fff7ed)]" />
        <Card className="relative z-10 w-full max-w-md border-white/70 bg-white/80 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl rounded-3xl">
          <CardBody className="p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Icon name="error_outline" size="24px" />
            </div>
            <h1 className="text-xl font-black text-slate-950">Acceso a Área</h1>
            <p className="text-sm font-bold text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-2xl">
              {error || 'Código de área no válido'}
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => navigate('/q')}
                className="w-full font-bold text-xs"
                icon="search"
              >
                Escribir otro código
              </Button>
            </div>
          </CardBody>
        </Card>
      </main>
    );
  }

  // Usuario Autenticado
  if (usuario) {
    // Si tiene más de 1 asignación para esta área
    if (asignaciones.length > 1) {
      return (
        <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-surface p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,132,115,0.18),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(244,158,72,0.16),transparent_24%),linear-gradient(135deg,#f8fafc,#eef4f1_45%,#fff7ed)]" />
          <Card className="relative z-10 w-full max-w-md border-white/70 bg-white/80 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl rounded-3xl">
            <CardBody className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-marca-acento">ÁREA VERIFICADA</p>
                <h1 className="text-2xl font-black text-slate-950">{areaInfo.nombre}</h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Tienes más de una auditoría asignada para esta área. Selecciona cuál deseas realizar:
                </p>
              </div>

              <div className="space-y-2">
                {asignaciones.map((asig) => (
                  <Button
                    key={asig.id}
                    variant="outline"
                    onClick={() => navigate(`/auditorias/${asig.id}/realizar`)}
                    className="w-full justify-between h-auto p-3.5 text-left border-slate-200 hover:border-marca-primario rounded-2xl"
                  >
                    <div>
                      <span className="block text-xs font-black uppercase text-slate-900">
                        {asig.anio} · Mes {asig.mes} · Periodo {asig.periodo}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Vence: {asig.reabiertaHasta ? 'Hoy 23:59' : new Date(asig.venceEn).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <Icon name="chevron_right" size="18px" className="text-slate-400" />
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>
        </main>
      );
    }

    // Si tiene 0 asignaciones realizables para esta área
    if (asignaciones.length === 0) {
      return (
        <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-surface p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,132,115,0.18),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(244,158,72,0.16),transparent_24%),linear-gradient(135deg,#f8fafc,#eef4f1_45%,#fff7ed)]" />
          <Card className="relative z-10 w-full max-w-md border-white/70 bg-white/80 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl rounded-3xl">
            <CardBody className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Icon name="assignment_late" size="24px" />
              </div>
              <h1 className="text-xl font-black text-slate-950">{areaInfo.nombre}</h1>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                No tienes una auditoría disponible para esta área en el periodo actual.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  as={Link}
                  to="/mis-auditorias"
                  variant="primario"
                  className="w-full font-bold text-xs"
                >
                  Ir a Mis Auditorías
                </Button>
              </div>
            </CardBody>
          </Card>
        </main>
      );
    }
  }

  // Usuario Invitado (Sin sesión autenticada)
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-surface p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,132,115,0.18),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(244,158,72,0.16),transparent_24%),linear-gradient(135deg,#f8fafc,#eef4f1_45%,#fff7ed)]" />
      <Card className="relative z-10 w-full max-w-md border-white/70 bg-white/80 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl rounded-3xl">
        <CardBody className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <span className="inline-block bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Área Verificada
            </span>
            <h1 className="text-2xl font-black text-slate-950 pt-1">{areaInfo.nombre}</h1>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Ingresa tu nombre completo para comenzar la auditoría de esta área como invitado.
            </p>
          </div>

          <form onSubmit={handleIniciarInvitado} className="space-y-4">
            <div>
              <Label required>Tu nombre completo</Label>
              <Input
                type="text"
                placeholder="Ej. Juan Pérez García"
                value={nombreInvitado}
                onChange={(e) => setNombreInvitado(e.target.value)}
                className="h-11 text-sm font-semibold"
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              variant="primario"
              className="w-full h-11 font-bold text-sm bg-emerald-600 hover:bg-emerald-500 border-none"
              icon="play_arrow"
              isLoading={iniciandoInvitado}
              disabled={!nombreInvitado.trim()}
            >
              Continuar como invitado
            </Button>
          </form>

          <div className="border-t border-slate-100 pt-4 text-center">
            <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">
              ¿Eres auditor registrado? Inicia sesión aquí
            </Link>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
