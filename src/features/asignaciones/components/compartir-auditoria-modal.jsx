import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { QrCode } from '@/components/ui/qr-code';
import { Spinner } from '@/components/ui/spinner';
import { notify } from '@/components/notification/adaptive-notify';

import { asignacionesApi } from '@/features/asignaciones/api/asignaciones-api';
import { buildPublicAppUrl, copyToClipboard, getPublicAppBaseUrl } from '@/utils/share-url';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const noop = () => {};

const getPeriodLabel = (ciclo) => {
  if (!ciclo) return '';

  const label =
    ciclo.numeroCorte === 1
      ? 'Primer periodo'
      : ciclo.numeroCorte === 2
        ? 'Segundo periodo'
        : `Periodo ${ciclo.numeroCorte}`;

  const mesName = MESES[ciclo.mes - 1];

  return `${label} · ${mesName} ${ciclo.anio}`;
};

export function CompartirAuditoriaModal({
  asignacion,
  isOpen,
  onClose,
  onInvitacionChange = noop,
}) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const objetivo =
    asignacion?.objetivoAuditoria ??
    asignacion?.objetivo ??
    null;

  const areaNombre =
    objetivo?.area?.nombre ??
    asignacion?.area?.nombre ??
    asignacion?.nombreAreaSnapshot ??
    'Área';

  const ciclo =
    objetivo?.cicloAuditoria ??
    asignacion?.ciclo ??
    null;

  useEffect(() => {
    if (!isOpen || !asignacion) {
      return undefined;
    }

    let active = true;

    setLoading(true);
    setError('');
    setUrl('');

    if (!getPublicAppBaseUrl()) {
      setError(
        'Configura VITE_PUBLIC_APP_URL con una URL pública. No se genera enlace con localhost.',
      );

      setLoading(false);

      return undefined;
    }

    asignacionesApi
      .crearInvitacion(asignacion.id)
      .then((response) => {
        if (!active) {
          return;
        }

        const invitacionUrl =
          buildPublicAppUrl(
            `/invitado/${response.token}`,
          );

        setUrl(invitacionUrl);

        onInvitacionChange(
          asignacion.id,
          response.enlace,
        );
      })
      .catch((err) => {
        if (active) {
          setError(
            err?.message ||
              'No se pudo crear la invitación.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    asignacion,
    isOpen,
    onInvitacionChange,
  ]);

  const copiar = async () => {
    await copyToClipboard(url);

    notify.success(
      'Enlace copiado.',
    );
  };

  const compartir = async () => {
    if (navigator.share && url) {
      await navigator.share({
        title: `Auditoría 5S · ${areaNombre}`,
        text: `Te comparto la auditoría 5S de ${areaNombre}.`,
        url,
      });

      return;
    }

    await copiar();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <ModalHeader
        title="Compartir auditoría"
        onClose={onClose}
      />

      <ModalBody className="space-y-5 text-center">
        <div>
          <h3 className="text-2xl font-black uppercase text-slate-950">
            {areaNombre}
          </h3>

          <p className="mt-1 text-sm font-bold text-slate-500">
            {ciclo
              ? getPeriodLabel(ciclo)
              : 'Evaluación 5S'}
          </p>
        </div>

        <p className="mx-auto max-w-sm text-sm font-semibold leading-6 text-slate-600">
          Este enlace permite que otra persona realice esta auditoría.
        </p>

        {loading ? (
          <Spinner label="Generando invitación..." />
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
            {error}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <QrCode
              value={url}
              label="QR de invitación"
            />

            <div className="w-full rounded-xl bg-slate-100 px-3 py-2">
              <p className="break-all text-left text-xs font-bold leading-5 text-slate-500">
                {url}
              </p>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          icon="content_copy"
          onClick={copiar}
          disabled={!url || loading}
        >
          Copiar enlace
        </Button>

        <Button
          type="button"
          icon="ios_share"
          onClick={compartir}
          disabled={!url || loading}
        >
          Compartir
        </Button>
      </ModalFooter>
    </Modal>
  );
}
