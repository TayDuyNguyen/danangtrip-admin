import { memo } from 'react';
import { cn } from '@/utils/cn';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'md';
}

const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    disabled = false, 
    className = '',
    size = 'md'
}: ToggleSwitchProps) => {
    const isSm = size === 'sm';
    
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={cn(
                'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none ring-0',
                isSm ? 'h-5 w-9' : 'h-6 w-11',
                enabled ? 'bg-[#14b8a6]' : 'bg-slate-200',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    'pointer-events-none inline-block transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                    isSm ? 'h-4 w-4' : 'h-5 w-5',
                    isSm 
                        ? (enabled ? 'translate-x-4' : 'translate-x-0.5') 
                        : (enabled ? 'translate-x-5' : 'translate-x-0.5'),
                    'mt-0.5'
                )}
            />
        </button>
    );
};

export default memo(ToggleSwitch);
