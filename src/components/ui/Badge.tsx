import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'neutral';
}

const Badge: React.FC<BadgeProps> = ({ 
    children, 
    variant = 'default', 
    className, 
    ...props 
}) => {
    const variants = {
        default: 'bg-blue-100 text-blue-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
        neutral: 'bg-gray-100 text-gray-700',
        outline: 'border border-gray-200 text-gray-600 bg-transparent',
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
