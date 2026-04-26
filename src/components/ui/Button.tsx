import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    isLoading?: boolean;
}

export const Button = ({
    children,
    className,
    variant = 'primary',
    isLoading,
    disabled,
    ...props
}: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
        primary: 'bg-[#14b8a6] text-white hover:bg-[#0f766e] border border-transparent shadow-sm shadow-[#14b8a6]/20',
        outline: 'border border-[#f1f5f9] bg-white text-[#64748b] hover:bg-[#f8fafc]',
        ghost: 'bg-transparent text-[#64748b] hover:bg-[#f8fafc]',
        danger: 'bg-[#fee2e2] text-[#b91c1c] hover:bg-[#fecaca] border border-transparent shadow-sm',
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
};
