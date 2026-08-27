import React from 'react';
import { cn } from '@/utils/cn';

export const Label = ({ children, className, error, hint, ...props }) => {
  return (
    <div className="flex justify-between items-end mb-1">
      <label className={cn("block text-sm font-bold", error ? "text-estado-rechazado" : "text-slate-700", className)} {...props}>
        {children}
      </label>
      {hint && (
        <span className={cn("text-xs", error ? "text-estado-rechazado font-bold" : "text-app-text-muted")}>
          {hint}
        </span>
      )}
    </div>
  );
};
