import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/form/input';
import { Label } from '@/components/form/label';
import { Select } from '@/components/form/select';
import { Icon } from '@/components/ui/icon';
import { notify } from '@/components/notification/adaptive-notify';
import { invitadosApi } from '@/features/invitados/api/invitados-api';

export function InvitadoAccesoPage() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [nombreInvitado, setNombreInvitado] = useState('');
  const [areaId, setAreaId] = useState('');
  const [codigoQr, setCodigoQr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let activo = true;
    invitadosApi.areasPublicas()
      .then((response) => {
        if (!activo) return;
        setAreas(response?.datos?.areas ?? response?.areas ?? []);
      })
      .catch((error) => notify.error(error?.message || 'No se pudieron cargar las áreas.'));

    return () => {
      activo = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await invitadosApi.crearAccesoPublico({
        nombreInvitado,
        areaId: Number(areaId),
        codigoQr,
      });
      const token = response?.datos?.token ?? response?.token;
      if (!token) throw new Error('No se recibió el acceso temporal.');
      navigate(`/invitado/${token}/auditoria`, { replace: true });
    } catch (error) {
      notify.error(error?.message || 'No se pudo validar el acceso invitado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-app-surface px-5 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(30,132,115,0.18),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(244,158,72,0.16),transparent_24%),linear-gradient(135deg,#f8fafc,#eef4f1_45%,#fff7ed)]" />
      <Card className="relative z-10 w-full max-w-lg border-white/70 bg-white/75 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl rounded-3xl">
        <CardBody className="space-y-6 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marca-primario text-white shadow-lg shadow-marca-primario/20">
              <Icon name="qr_code_scanner" fill />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Acceso invitado</p>
              <h1 className="text-2xl font-black text-slate-950">Validar área</h1>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nombreInvitado">Nombre</Label>
              <Input
                id="nombreInvitado"
                autoComplete="name"
                value={nombreInvitado}
                onChange={(event) => setNombreInvitado(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaId">Área</Label>
              <Select id="areaId" value={areaId} onChange={(event) => setAreaId(event.target.value)} required>
                <option value="">Selecciona un área</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>{area.nombre}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigoQr">Código QR</Label>
              <Input
                id="codigoQr"
                value={codigoQr}
                onChange={(event) => setCodigoQr(event.target.value)}
                placeholder="Escanea o pega el contenido del QR"
                required
              />
              <p className="px-1 text-xs font-semibold leading-5 text-slate-500">
                En esta base se valida el QR del área antes de abrir la auditoría.
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg" icon="arrow_forward" isLoading={loading}>
              Continuar
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
