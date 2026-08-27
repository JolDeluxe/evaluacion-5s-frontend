import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/utils/cn';

export function QrCode({ value, label = 'QR', className }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    setSrc('');

    if (!value) return undefined;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 240,
      color: {
        dark: '#2f2526',
        light: '#ffffff',
      },
    }).then((dataUrl) => {
      if (active) setSrc(dataUrl);
    }).catch(() => {
      if (active) setSrc('');
    });

    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className={cn('flex aspect-square w-48 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm', className)}>
      {src ? (
        <img src={src} alt={label} className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-50 text-slate-400">
          <Icon name="qr_code_2" size="xl" />
        </div>
      )}
    </div>
  );
}
