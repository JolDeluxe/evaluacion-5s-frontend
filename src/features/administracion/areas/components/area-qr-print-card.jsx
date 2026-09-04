import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Icon } from '@/components/ui/icon';
import { buildAreaQrUrl, getPrintedDisplayUrl } from '../utils/area-qr-payload';

export function AreaQrPrintCard({ area, onLoad }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  const fullUrl = area ? buildAreaQrUrl(area.codigoVerificacion) : '';
  const displayUrl = getPrintedDisplayUrl();

  useEffect(() => {
    let active = true;
    if (!fullUrl || !area) return;

    QRCode.toDataURL(fullUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) {
          setQrDataUrl(url);
          if (onLoad) onLoad(area.id);
        }
      })
      .catch(() => {
        if (active && onLoad) onLoad(area.id);
      });

    return () => {
      active = false;
    };
  }, [fullUrl, area?.id, onLoad]);

  if (!area) return null;

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-white border border-slate-300 rounded-2xl shadow-sm max-w-[280px] text-center print:break-inside-avoid print:border-2 print:border-slate-800 print:shadow-none mx-auto w-full print:max-w-[170mm] print:p-8 print:rounded-2xl">
      {/* Encabezado */}
      <div className="text-[10px] sm:text-xs font-black text-marca-acento print:text-slate-700 uppercase tracking-[0.2em] mb-1 print:text-base">
        AUDITORÍA 5S
      </div>

      {/* Nombre del área */}
      <div className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight w-full mb-3 print:text-black leading-tight print:text-3xl print:mb-6 whitespace-normal break-words">
        {area.nombre}
      </div>

      {/* QR Code */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-inner relative print:bg-white print:border-2 print:border-slate-300 print:p-4 print:shadow-none mb-3 print:mb-6">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            width="180"
            height="180"
            alt={`QR ${area.nombre}`}
            className="print:w-[85mm] print:h-[85mm]"
          />
        ) : (
          <div className="h-44 w-44 flex items-center justify-center text-xs font-bold text-slate-400">
            Generando QR...
          </div>
        )}
      </div>

      {/* Código del área */}
      <div className="w-full bg-slate-100 print:bg-slate-100/90 rounded-xl p-2 sm:p-2.5 mb-3 print:mb-4 border border-slate-200/80">
        <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 mb-0.5 print:text-slate-600">
          Código del área
        </span>
        <span className="text-base sm:text-lg print:text-xl font-mono font-black text-slate-900 tracking-widest uppercase">
          {area.codigoVerificacion}
        </span>
      </div>

      {/* Instrucciones de Escaneo / Enlace */}
      <div className="space-y-1 text-slate-600 print:text-slate-800 text-[10px] sm:text-xs font-bold leading-tight print:text-xs">
        <div className="flex items-center justify-center gap-1">
          <Icon name="qr_code_scanner" size="14px" className="shrink-0 text-slate-500 print:text-slate-700" />
          <span>Escanea el QR o ingresa a</span>
        </div>
        <div className="text-marca-primario print:text-black font-black text-xs sm:text-sm tracking-wide">
          {displayUrl}
        </div>
      </div>
    </div>
  );
}
