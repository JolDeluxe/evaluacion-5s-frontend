import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { resultadosApi } from '@/features/resultados/api/resultados-api';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function ResultadosDescargarPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estado, setEstado] = useState('descargando'); // 'descargando' | 'exito' | 'error'
  const [errorMensaje, setErrorMensaje] = useState(null);
  const descargaIniciadaRef = useRef(false);

  const tipo = searchParams.get('tipo') || 'mes';
  const mes = searchParams.get('mes') || undefined;
  const anio = searchParams.get('anio') || undefined;
  const trimestre = searchParams.get('trimestre') || undefined;
  const semestre = searchParams.get('semestre') || undefined;

  useEffect(() => {
    if (descargaIniciadaRef.current) return;
    descargaIniciadaRef.current = true;

    resultadosApi
      .descargarPdfGeneral({
        tipo,
        mes,
        anio,
        trimestre,
        semestre,
      })
      .then(() => {
        setEstado('exito');
      })
      .catch((err) => {
        console.error('[ResultadosDescargarPage] Error al descargar PDF:', err);
        setErrorMensaje(err?.message || 'No se pudo generar o descargar el archivo PDF.');
        setEstado('error');
      });
  }, [tipo, mes, anio, trimestre, semestre]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center shadow-lg">
        {estado === 'descargando' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Spinner size="md" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Descargando reporte oficial...</h1>
              <p className="mt-1 text-xs text-slate-500">
                Tu navegador iniciará la descarga del PDF de Resultados Generales 5S en un momento.
              </p>
            </div>
          </div>
        )}

        {estado === 'exito' && (
          <div className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Icon name="check_circle" size="lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Descarga completada</h1>
              <p className="mt-1 text-xs text-slate-500">
                El archivo PDF se ha generado y transferido a tu carpeta de descargas.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  descargaIniciadaRef.current = false;
                  setEstado('descargando');
                  resultadosApi.descargarPdfGeneral({ tipo, mes, anio, trimestre, semestre })
                    .then(() => setEstado('exito'))
                    .catch((err) => {
                      setErrorMensaje(err?.message);
                      setEstado('error');
                    });
                }}
              >
                Volver a descargar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/inicio')}
              >
                Ir al Inicio
              </Button>
            </div>
          </div>
        )}

        {estado === 'error' && (
          <div className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Icon name="error" size="lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">No se pudo descargar</h1>
              <p className="mt-1 text-xs text-rose-600">
                {errorMensaje || 'Ocurrió un error al intentar generar el archivo.'}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  descargaIniciadaRef.current = false;
                  setEstado('descargando');
                  resultadosApi.descargarPdfGeneral({ tipo, mes, anio, trimestre, semestre })
                    .then(() => setEstado('exito'))
                    .catch((err) => {
                      setErrorMensaje(err?.message);
                      setEstado('error');
                    });
                }}
              >
                Reintentar descarga
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/inicio')}
              >
                Ir al Inicio
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
