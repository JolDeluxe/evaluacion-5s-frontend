import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { notify } from '@/components/notification/adaptive-notify';

export function MicrosoftConexionModal({
  isOpen,
  onClose,
  estadoMicrosoft,
  onIniciarConexion,
  onDesconectar,
  onRecargar,
}) {
  const [iniciando, setIniciando] = useState(false);
  const [desconectando, setDesconectando] = useState(false);
  const [deviceCodeData, setDeviceCodeData] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const handleIniciar = async () => {
    setIniciando(true);
    try {
      const res = await onIniciarConexion();
      setDeviceCodeData(res?.deviceCode ?? null);
      notify.success('Código de dispositivo generado. Ingresa a Microsoft para autorizar.');
    } catch (err) {
      notify.error(err?.message || 'Error al iniciar conexión con Microsoft');
    } finally {
      setIniciando(false);
    }
  };

  const handleDesconectar = async () => {
    setDesconectando(true);
    try {
      await onDesconectar();
      notify.success('Cuenta Microsoft desconectada');
      setDeviceCodeData(null);
      await onRecargar();
    } catch (err) {
      notify.error(err?.message || 'Error al desconectar cuenta');
    } finally {
      setDesconectando(false);
    }
  };

  const handleCopiarCodigo = () => {
    if (deviceCodeData?.userCode) {
      navigator.clipboard.writeText(deviceCodeData.userCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
      notify.info('Código copiado al portapapeles');
    }
  };

  const conectado = Boolean(estadoMicrosoft?.conectado);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader
        title="Conexión de Cuenta Microsoft Outlook"
        description="Vincula una cuenta de Outlook.com dedicada para el envío de notificaciones mediante autorización delegada OAuth (MSAL Node)."
        onClose={onClose}
      />

      <ModalBody className="space-y-4">
        {conectado ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Icon name="check_circle" size="md" />
              </div>
              <div>
                <h4 className="text-sm font-black text-emerald-950">Cuenta Microsoft Conectada</h4>
                <p className="text-xs font-semibold text-emerald-800">
                  {estadoMicrosoft?.cuenta || 'Outlook.com'}
                </p>
              </div>
            </div>

            <p className="text-xs text-emerald-700 leading-relaxed">
              La caché de tokens OAuth está cifrada en base de datos y se renovará automáticamente sin necesidad de reingresar credenciales.
            </p>

            <div className="pt-2 border-t border-emerald-200/60 flex justify-end">
              <Button
                type="button"
                variant="danger"
                size="xs"
                icon="link_off"
                disabled={desconectando}
                onClick={handleDesconectar}
              >
                {desconectando ? 'Desconectando...' : 'Desconectar Cuenta'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!deviceCodeData ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <h4 className="text-sm font-black text-slate-900">Iniciar Autorización por Device Code</h4>
                <p className="text-slate-600 leading-relaxed">
                  Para autorizar el envío de correos sin almacenar tu contraseña en el servidor:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium pl-1">
                  <li>Haz clic en <strong>Generar Código de Conexión</strong>.</li>
                  <li>Copia el código alfanumérico proporcionado.</li>
                  <li>Inicia sesión con la cuenta de Outlook dedicada y acepta el permiso <code>Mail.Send</code>.</li>
                </ol>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon="login"
                    disabled={iniciando}
                    onClick={handleIniciar}
                    className="text-xs font-bold"
                  >
                    {iniciando ? 'Generando código...' : 'Generar Código de Conexión'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 block">
                    Paso 1: Copia este código
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-2xl font-black tracking-widest text-slate-900 bg-white border border-sky-300 rounded-xl px-4 py-2 select-all shadow-inner">
                      {deviceCodeData.userCode}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={copiado ? 'done' : 'content_copy'}
                      onClick={handleCopiarCodigo}
                    >
                      {copiado ? 'Copiado' : 'Copiar'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 block">
                    Paso 2: Autoriza en Microsoft
                  </span>
                  <a
                    href={deviceCodeData.verificationUri || 'https://microsoft.com/devicelogin'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shadow-sm transition"
                  >
                    <span>Abrir microsoft.com/devicelogin</span>
                    <Icon name="open_in_new" size="xs" />
                  </a>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-sky-200/80 text-[11px] text-slate-600 flex items-center gap-2">
                  <Spinner size="xs" />
                  <span>Esperando confirmación en Microsoft... Una vez autorizado, haz clic en <strong>Comprobar Estado</strong>.</span>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={onRecargar}
                  >
                    Comprobar Estado
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
}