import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

export const Checkbox = forwardRef(({ className, label, error, helperText, ...props }, ref) => {
  return (
    <div className="w-fit">
      <label className={cn('flex cursor-pointer select-none items-center gap-2 text-sm', className)}>
        <input
          type="checkbox"
          ref={ref}
          className="h-4 w-4 rounded border-app-border accent-navigation-active transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {label && (
          <span className={cn('font-semibold', error ? 'text-estado-rechazado' : 'text-slate-700')}>
            {label}
          </span>
        )}
      </label>
      {helperText && (
        <p className={cn('mt-1 pl-6 text-xs font-semibold', error ? 'text-estado-rechazado' : 'text-app-text-muted')}>
          {helperText}
        </p>
      )}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
