import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/icon';
import { controlBase, controlSizes, controlState, helperTextClass } from './form-control-styles';

export const Select = forwardRef(({ 
    className, 
    error, 
    children, 
    helperText, 
    icon,
    onClear,
    value,
    size = 'md',
    ...props 
}, ref) => {
    const hasValue = value && value !== "";

    return (
        <div className="w-full">
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors">
                        <Icon 
                            name={icon} 
                            size="xs" 
                            className={cn(
                                "transition-colors",
                                hasValue ? "text-marca-primario" : "text-slate-400 group-focus-within:text-marca-secundario"
                            )} 
                        />
                    </div>
                )}
                
                <select
                    ref={ref}
                    value={value}
                    className={cn(
                        controlBase,
                        controlSizes[size] || controlSizes.md,
                        controlState({ error, selected: hasValue }),
                        "appearance-none",
                        icon ? "pl-9" : "pl-3",
                        onClear && hasValue ? "pr-14" : "pr-9",
                        className
                    )}
                    aria-invalid={error ? true : undefined}
                    {...props}
                >
                    {children}
                </select>

                <div className="absolute inset-y-0 right-0 flex items-center gap-1 px-2 pointer-events-none">
                    {onClear && hasValue && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onClear();
                            }}
                            className="pointer-events-auto flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                            aria-label="Limpiar selección"
                        >
                            <Icon name="close" size="14px" />
                        </button>
                    )}
                    
                    <Icon 
                        name="expand_more" 
                        size="18px" 
                        className={cn(
                            "transition-colors",
                            hasValue ? "text-marca-primario/50" : "text-slate-400"
                        )} 
                    />
                </div>
            </div>
            {helperText && (
                <p className={helperTextClass(error)}>
                    {helperText}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';
