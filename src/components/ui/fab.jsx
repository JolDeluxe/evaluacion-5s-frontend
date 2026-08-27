import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';

const variants = {
  solid: 'bg-marca-primario text-white shadow-xl shadow-marca-primario/20 hover:bg-marca-primario-hover',
  primary: 'bg-marca-primario text-white shadow-xl shadow-marca-primario/20 hover:bg-marca-primario-hover',
  success: 'bg-estado-resuelto text-white shadow-xl shadow-emerald-700/20 hover:brightness-95',
  danger: 'bg-estado-rechazado text-white shadow-xl shadow-red-700/20 hover:brightness-95',
  neutral: 'bg-slate-700 text-white shadow-xl shadow-slate-950/20 hover:bg-slate-800',
  glass: 'glass-surface text-marca-primario hover:bg-white/90',
  'glass-primary': 'text-white border border-white/30 bg-marca-primario/78 shadow-xl shadow-marca-primario/20 backdrop-blur-xl hover:bg-marca-primario/90',
  'glass-success': 'text-white border border-white/30 bg-estado-resuelto/78 shadow-xl shadow-emerald-700/20 backdrop-blur-xl hover:bg-estado-resuelto/90',
  'glass-blue': 'text-white border border-white/30 bg-estado-asignada/78 shadow-xl shadow-blue-700/20 backdrop-blur-xl hover:bg-estado-asignada/90',
  'glass-green': 'text-white border border-white/30 bg-estado-resuelto/78 shadow-xl shadow-emerald-700/20 backdrop-blur-xl hover:bg-estado-resuelto/90',
};

const sizes = {
  sm: { button: 'h-10 w-10', icon: 'sm' },
  md: { button: 'h-12 w-12', icon: '20px' },
  lg: { button: 'h-14 w-14', icon: 'md' },
};

export const Fab = ({
  icon,
  onClick,
  disabled = false,
  isLoading = false,
  variant = 'solid',
  size = 'lg',
  positionClass = 'bottom-6 right-5',
  fixed = true,
  className,
  ariaLabel,
  style,
  ...props
}) => {
  const sizeConfig = typeof size === 'number'
    ? { button: '', icon: 'md', style: { width: size, height: size } }
    : (sizes[size] || sizes.lg);
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel || icon}
      className={cn(
        fixed && 'fixed z-50',
        'inline-flex items-center justify-center overflow-hidden rounded-full',
        'transition-all duration-200 ease-out active:scale-95 focus-visible:outline-focus-ring/40',
        'hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0',
        variants[variant] || variants.solid,
        sizeConfig.button,
        positionClass,
        className,
      )}
      style={{ ...sizeConfig.style, ...style }}
      {...props}
    >
      <Icon
        name={isLoading ? 'progress_activity' : icon}
        className={cn('shrink-0 drop-shadow-sm', isLoading && 'animate-spin')}
        size={sizeConfig.icon}
        weight={500}
      />
    </button>
  );
};
