import type { HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'neutral';
}

const Badge = ({ 
    children, 
    variant = 'default', 
    className, 
    ...props 
}: BadgeProps) => {
    const variants = {
        default: 'bg-blue-100 text-[#0f172a]',
        success: 'bg-[#f4fce3] text-[#166534]',
        warning: 'bg-[#fef3c7] text-[#92400e]',
        error: 'bg-[#fee2e2] text-[#b91c1c]',
        neutral: 'bg-[#f8fafc] text-[#64748b]',
        outline: 'border border-[#f1f5f9] text-[#64748b] bg-transparent',
    };

    return (
        <span 
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                variants[variant],
                className
            )} 
            {...props}
        >
            {children}
        </span>
    );
};

export default Badge;
