import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils';

interface EmptyStateProps {
    icon?: React.ElementType;
    title: string;
    description?: string;
    className?: string;
    iconClassName?: string;
}

const EmptyState = ({
    icon: Icon = Inbox,
    title,
    description,
    className,
    iconClassName,
}: EmptyStateProps) => {
    return (
        <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
            <div className={cn("w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300", iconClassName)}>
                <Icon size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
            {description && (
                <p className="text-sm font-medium text-slate-400 mt-1 max-w-[280px]">
                    {description}
                </p>
            )}
        </div>
    );
};

export default EmptyState;
