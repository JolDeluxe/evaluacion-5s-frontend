import React from 'react';
import { cn } from '@/utils/cn';

const variants = {
  surface: 'bg-app-surface border-app-border shadow-sm',
  muted: 'bg-app-surface-muted border-app-border shadow-sm',
  glass: 'glass-surface border-white/70',
  outline: 'bg-transparent border-app-border shadow-none',
  danger: 'bg-red-50/70 border-red-200 text-red-800 shadow-sm',
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const Card = ({ children, className, variant = 'surface', ...props }) => (
  <div
    className={cn(
      'overflow-hidden rounded-lg border',
      variants[variant] || variants.surface,
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className, muted = true, ...props }) => (
  <div
    className={cn(
      'border-b border-app-border px-4 py-3',
      muted && 'bg-app-surface-muted/65',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3
    className={cn(
      'text-lg font-normal uppercase leading-tight text-marca-primario fuente-titulos',
      className,
    )}
    {...props}
  >
    {children}
  </h3>
);

export const CardBody = ({ children, className, padding = 'md', ...props }) => (
  <div className={cn(paddings[padding] || paddings.md, className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, muted = true, ...props }) => (
  <div
    className={cn(
      'border-t border-app-border px-4 py-3',
      muted && 'bg-app-surface-muted/55',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);
