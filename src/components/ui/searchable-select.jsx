import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from './icon';
import { Tooltip } from './tooltip';
import { cn } from '@/utils/cn';
import { controlBase, controlSizes, controlState } from '@/components/form/form-control-styles';

export const SearchableSelect = ({
    options = [],
    value,
    onChange = () => {},
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    allOptionText = "Todos",
    icon,
    disabled = false,
    className,
    menuClassName,
    onToggle,
    onSearchChange,
    isSearching = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const containerRef = useRef(null);

    // ── Interceptor de clics externos para cerrar el menú ──
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                if (onToggle) onToggle(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onToggle]);

    useEffect(() => {
        if (!onSearchChange || !isOpen) return undefined;
        const timeoutId = window.setTimeout(() => {
            onSearchChange(searchQuery);
        }, 300);
        return () => window.clearTimeout(timeoutId);
    }, [isOpen, onSearchChange, searchQuery]);

    const selectedOption = useMemo(() => {
        if (!options || !Array.isArray(options)) return null;
        return options.find(opt => opt && String(opt.value ?? '') === String(value ?? ''));
    }, [options, value]);

    const usesRemoteSearch = typeof onSearchChange === 'function';
    const hasValue = value !== null && value !== undefined && value !== '';

    const filteredOptions = useMemo(() => {
        if (!options || !Array.isArray(options)) return [];
        if (usesRemoteSearch) return options.filter(Boolean);
        return options.filter(opt => {
            if (!opt) return false;
            const labelStr = String(opt.label ?? opt.value ?? '');
            return labelStr.toLowerCase().includes((searchQuery ?? '').toLowerCase());
        });
    }, [options, searchQuery, usesRemoteSearch]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
        if (onToggle) onToggle(false);
        setSearchQuery("");
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        const nextState = !isOpen;
                        setIsOpen(nextState);
                        if (onToggle) onToggle(nextState);
                    }
                }}
                className={cn(
                    controlBase,
                    controlSizes.md,
                    controlState({ selected: hasValue && !disabled }),
                    "flex items-center justify-between gap-2 pr-3 text-left",
                    disabled ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed" : "cursor-pointer",
                    className
                )}
            >
                <span className="flex items-center min-w-0 flex-1">
                    {icon && <Icon name={icon} size="sm" className="mr-2 opacity-70 flex-shrink-0" />}
                    <span className="truncate min-w-0 overflow-hidden">
                        {hasValue ? selectedOption?.label : placeholder}
                    </span>
                </span>

                {hasValue && !disabled ? (
                    <Tooltip text="Limpiar selección" variant="dark" position="top">
                        <div
                            role="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect('');
                            }}
                            className="flex items-center justify-center w-6 h-6 hover:bg-red-100 rounded-full text-red-600 transition-colors ml-2 flex-shrink-0"
                        >
                            <Icon name="close" size="xs" />
                        </div>
                    </Tooltip>
                ) : (
                    <Icon
                        name="expand_more"
                        size="sm"
                        className={cn(
                            "transition-transform flex-shrink-0 ml-2",
                            disabled ? "text-slate-300" : "text-slate-400",
                            isOpen ? "rotate-180" : ""
                        )}
                    />
                )}
            </button>

            {isOpen && !disabled && (
                <div className={cn("absolute top-full left-0 mt-1 w-full max-w-full bg-white border border-app-border rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in", menuClassName)}>

                    {/* Buscador Interno */}
                    <div className="p-2 border-b border-app-border bg-app-surface-muted sticky top-0">
                        <div className="relative">
                            <Icon name="search" size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                }}
                                className={cn(controlBase, 'h-8 pl-8 pr-3 text-xs', controlState())}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Lista de Resultados */}
                    <div className="max-h-60 overflow-y-auto py-1">
                        {searchQuery === "" && allOptionText && (
                            <button
                                onClick={() => handleSelect("")}
                                className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm hover:bg-app-surface-muted transition-colors cursor-pointer",
                                    !hasValue ? "bg-slate-50 font-bold text-slate-900" : "text-slate-600"
                                )}
                            >
                                <span className="block truncate">{allOptionText}</span>
                            </button>
                        )}

                        {isSearching ? (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                                Buscando...
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const valStr = opt.value !== undefined && opt.value !== null ? String(opt.value) : '';
                                return (
                                    <button
                                        key={valStr || opt.label}
                                        onClick={() => handleSelect(valStr)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 text-sm hover:bg-navigation-active-soft transition-colors border-t border-slate-50 cursor-pointer",
                                            String(value ?? '') === valStr ? "bg-navigation-active-soft font-bold text-navigation-active" : "text-slate-600"
                                        )}
                                    >
                                        <span className="block truncate min-w-0">{opt.label}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-sm text-slate-500 text-center italic">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
