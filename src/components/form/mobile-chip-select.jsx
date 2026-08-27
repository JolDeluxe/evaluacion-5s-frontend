// src/components/form/mobile-chip-select.jsx
import { Icon } from '@/components/ui/z_index';
import { cn } from '@/utils/cn';
import { controlState } from './form-control-styles';

export const MobileChipSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "Todos",
    icon = "business",
    className
}) => {
    const isSelected = value !== null && value !== '' && value !== undefined;

    return (
        <div className={cn("relative shrink-0 inline-flex items-center", className)}>
            <div className="absolute left-2.5 flex items-center pointer-events-none">
                <Icon
                    name={icon}
                    size="xs"
                    className={isSelected ? "text-navigation-active" : "text-slate-500"}
                />
            </div>
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value || null)}
                className={cn(
                    "appearance-none w-full pl-8 pr-7 h-8 rounded-full border text-xs font-semibold transition-all cursor-pointer",
                    isSelected
                        ? "bg-navigation-active-soft border-navigation-active/30 text-navigation-active"
                        : cn("bg-white text-slate-600", controlState())
                )}
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="absolute right-2 flex items-center pointer-events-none">
                <Icon
                    name="expand_more"
                    size="xs"
                    className={isSelected ? "text-navigation-active" : "text-slate-400"}
                />
            </div>
        </div>
    );
};
