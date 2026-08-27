import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

const filterBase = 'bg-white border border-slate-200/80 text-slate-600 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-slate-300 md:hover:-translate-y-0.5 md:active:translate-y-0 md:active:shadow-sm';

const variants = {
  primary: 'bg-marca-primario text-white hover:bg-marca-primario-hover border border-transparent shadow-sm shadow-marca-primario/15',
  secondary: 'bg-marca-secundario text-white hover:bg-marca-acento border border-transparent shadow-sm shadow-marca-secundario/15',
  success: 'bg-estado-resuelto text-white hover:brightness-95 border border-transparent shadow-sm shadow-emerald-700/15',
  danger: 'bg-estado-rechazado text-white hover:brightness-95 border border-transparent shadow-sm shadow-red-700/15',
  warning: 'bg-estado-pendiente text-white hover:brightness-95 border border-transparent shadow-sm shadow-amber-700/15',
  info: 'bg-estado-asignada text-white hover:brightness-95 border border-transparent shadow-sm shadow-blue-700/15',
  ghost: 'bg-transparent text-slate-700 hover:bg-marca-primario/5 hover:text-marca-primario border border-transparent',
  outline: 'bg-white text-marca-primario border border-marca-primario/30 hover:border-marca-primario hover:bg-marca-primario/5',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 border border-transparent shadow-sm',
  icon: 'bg-white text-slate-700 border border-app-border hover:border-marca-secundario/40 hover:bg-marca-primario/5 shadow-sm',

  primario: 'bg-marca-primario text-white hover:bg-marca-primario-hover border border-transparent shadow-sm shadow-marca-primario/15',
  secundario: 'bg-marca-secundario text-white hover:bg-marca-acento border border-transparent shadow-sm shadow-marca-secundario/15',
  acento: 'bg-marca-acento text-white hover:bg-marca-primario-hover border border-transparent shadow-sm',
  guardar: 'bg-estado-resuelto text-white hover:brightness-95 border border-transparent shadow-sm shadow-emerald-700/15',
  editar: 'bg-estado-pendiente text-white hover:brightness-95 border border-transparent shadow-sm shadow-amber-700/15',
  accion: 'bg-estado-asignada text-white hover:brightness-95 border border-transparent shadow-sm shadow-blue-700/15',
  borrar: 'bg-estado-rechazado text-white hover:brightness-95 border border-transparent shadow-sm shadow-red-700/15',
  cancelar: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200',
  pendiente: 'bg-estado-pendiente text-white hover:brightness-95 border border-transparent shadow-sm',
  progreso: 'bg-estado-en-progreso text-white hover:brightness-95 border border-transparent shadow-sm',
  pausa: 'bg-estado-en-pausa text-white hover:brightness-95 border border-transparent shadow-sm',
  detener: 'bg-prioridad-alta text-white hover:brightness-95 border border-transparent shadow-sm',
  critico: 'bg-prioridad-critica text-white hover:brightness-95 border border-transparent shadow-sm',
  carbon: 'bg-slate-700 text-white hover:bg-slate-800 border border-transparent',
  gris: 'bg-slate-500 text-white hover:bg-slate-600 border border-transparent',
  silver: 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-200',
  light: 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200',
  soft: 'bg-white text-slate-500 border border-transparent hover:border-slate-200 hover:bg-slate-50',
  outline_dark: 'bg-transparent border border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white',
  success_light: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
  info_light: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100',
  indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent',
  sky: 'bg-sky-500 text-white hover:bg-sky-600 border border-transparent',

  filtro_por_defecto: {
    base: filterBase,
    active: 'bg-navigation-active border border-navigation-active text-white shadow-md shadow-marca-primario/20 active:scale-[0.98]',
  },
  filtro_todos: {
    base: filterBase,
    active: 'bg-navigation-active border border-navigation-active text-white shadow-md shadow-marca-primario/20 active:scale-[0.98]',
  },
  filtro_gris: {
    base: 'bg-white border border-gray-200/80 text-gray-600 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-gray-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-gray-700 to-gray-800 border border-gray-800 text-white shadow-md shadow-gray-900/20 active:scale-[0.98]',
  },
  filtro_ambar: {
    base: 'bg-white border border-amber-200/80 text-amber-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-amber-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-amber-500 to-amber-600 border border-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.98]',
  },
  filtro_amarillo: {
    base: 'bg-white border border-yellow-200/80 text-yellow-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-yellow-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-yellow-400 to-yellow-500 border border-yellow-500 text-white shadow-md shadow-yellow-500/25 active:scale-[0.98]',
  },
  filtro_azul: {
    base: 'bg-white border border-blue-200/80 text-blue-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-blue-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600 text-white shadow-md shadow-blue-500/25 active:scale-[0.98]',
  },
  filtro_rosa: {
    base: 'bg-white border border-rose-200/80 text-rose-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-rose-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-rose-500 to-rose-600 border border-rose-600 text-white shadow-md shadow-rose-500/25 active:scale-[0.98]',
  },
  filtro_esmeralda: {
    base: 'bg-white border border-emerald-200/80 text-emerald-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-emerald-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-500/25 active:scale-[0.98]',
  },
  filtro_indigo: {
    base: 'bg-white border border-indigo-200/80 text-indigo-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-indigo-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-600 text-white shadow-md shadow-indigo-500/25 active:scale-[0.98]',
  },
  filtro_rojo: {
    base: 'bg-white border border-red-200/80 text-red-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-red-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]',
  },
  filtro_pendiente: {
    base: 'bg-white border border-amber-200/80 text-amber-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-amber-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-amber-500 to-amber-600 border border-amber-600 text-white shadow-md shadow-amber-500/25 active:scale-[0.98]',
  },
  filtro_asignada: {
    base: 'bg-white border border-blue-200/80 text-blue-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-blue-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600 text-white shadow-md shadow-blue-500/25 active:scale-[0.98]',
  },
  filtro_en_progreso: {
    base: 'bg-white border border-violet-200/80 text-violet-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-violet-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-violet-500 to-violet-600 border border-violet-600 text-white shadow-md shadow-violet-500/25 active:scale-[0.98]',
  },
  filtro_en_pausa: {
    base: 'bg-white border border-gray-200/80 text-gray-600 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-gray-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-gray-500 to-gray-600 border border-gray-600 text-white shadow-md shadow-gray-500/25 active:scale-[0.98]',
  },
  filtro_resuelto: {
    base: 'bg-white border border-emerald-200/80 text-emerald-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-emerald-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-600 text-white shadow-md shadow-emerald-500/25 active:scale-[0.98]',
  },
  filtro_cerrado: {
    base: 'bg-white border border-slate-200/80 text-slate-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-slate-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-800 text-white shadow-md shadow-slate-800/25 active:scale-[0.98]',
  },
  filtro_rechazado: {
    base: 'bg-white border border-red-200/80 text-red-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-red-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]',
  },
  filtro_cancelada: {
    base: 'bg-white border border-gray-200/80 text-gray-500 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-gray-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-gray-400 to-gray-500 border border-gray-500 text-white shadow-md shadow-gray-400/25 active:scale-[0.98]',
  },
  filtro_papelera: {
    base: 'bg-white border border-red-200/80 text-red-700 shadow-sm active:scale-[0.98] md:hover:shadow-md md:hover:border-red-300 md:hover:-translate-y-0.5',
    active: 'bg-gradient-to-b from-red-500 to-red-600 border border-red-600 text-white shadow-md shadow-red-500/25 active:scale-[0.98]',
  },
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
  icon: 'h-10 w-10 p-0',
};

export const Button = forwardRef(({
  children,
  as,
  variant = 'primary',
  size = 'md',
  icon,
  iconSize,
  isLoading = false,
  isActive = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}, ref) => {
  const Component = as || 'button';
  const isDisabled = disabled || isLoading;
  const variantConfig = variants[variant] || variants.primary;
  const variantClass = typeof variantConfig === 'object'
    ? (isActive ? variantConfig.active : variantConfig.base)
    : variantConfig;
  const sizeClass = sizes[size] || sizes.md;
  const resolvedIconSize = iconSize || (size === 'icon' ? '20px' : size);

  const interactiveProps = as
    ? {
        'aria-disabled': isDisabled || undefined,
        tabIndex: isDisabled ? -1 : props.tabIndex,
      }
    : {
        type,
        disabled: isDisabled,
      };

  return (
    <Component
      {...interactiveProps}
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold font-lectura transition-all duration-200 ease-out',
        'focus-visible:outline-focus-ring/40 active:scale-[0.98]',
        'disabled:opacity-55 disabled:grayscale disabled:shadow-none disabled:active:scale-100',
        'aria-disabled:pointer-events-none aria-disabled:opacity-55',
        'hover:-translate-y-0.5 hover:shadow-md',
        variantClass,
        sizeClass,
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Icon
          name="progress_activity"
          className="animate-spin shrink-0"
          size={resolvedIconSize}
          opsz={20}
          wght={500}
        />
      ) : (
        icon && <Icon name={icon} size={resolvedIconSize} opsz={20} wght={500} className="shrink-0" />
      )}
      {size !== 'icon' && (children || isLoading) && (
        <span className="truncate">{isLoading ? 'Cargando...' : children}</span>
      )}
    </Component>
  );
});

Button.displayName = 'Button';
