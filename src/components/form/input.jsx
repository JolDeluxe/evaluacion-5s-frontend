import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { controlBase, controlSizes, controlState, helperTextClass } from './form-control-styles';

export const Input = forwardRef(({ className, error, multiline, helperText, size = 'md', ...props }, ref) => {
  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className="w-full">
      <Component
        ref={ref}
        className={cn(
          controlBase,
          controlState({ error }),
          multiline ? 'min-h-24 resize-y py-2' : controlSizes[size] || controlSizes.md,
          className,
        )}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {helperText && (
        <p className={helperTextClass(error)}>
          {helperText}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
