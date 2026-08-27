import React from 'react';
import { cn } from '@/utils/cn';

const variants = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  outline: 'bg-white text-slate-700 border-slate-300',
  brand: 'bg-marca-primario/10 text-marca-primario border-marca-primario/20',

  pendiente: 'bg-estado-pendiente text-white border-transparent',
  asignada: 'bg-estado-asignada text-white border-transparent',
  'en-progreso': 'bg-estado-en-progreso text-white border-transparent',
  'en-pausa': 'bg-estado-en-pausa text-white border-transparent',
  resuelto: 'bg-estado-resuelto text-white border-transparent',
  cerrado: 'bg-estado-cerrado text-white border-transparent',
  rechazado: 'bg-estado-rechazado text-white border-transparent',
  cancelada: 'bg-estado-cancelada text-white border-transparent',
  vencido: 'bg-estado-rechazado text-white border-transparent',
};

export const Badge = ({
  children,
  variant,
  status = 'neutral',
  className,
  ...props
}) => {
  const visual = variant || status;
  const colorClass = variants[visual] || variants.neutral;

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-bold leading-none shadow-sm',
        colorClass,
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
    </span>
  );
};
