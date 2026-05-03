import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

interface StatCardProps {
    title: string;
    value: string | number | null;
    icon: LucideIcon;
    isLoading?: boolean;
    isError?: boolean;
    accent?: 'teal' | 'tealSoft' | 'slate' | 'indigo' | 'amber' | 'rose';
    trend?: number | null;
    subText?: string;
    className?: string;
}

const accentColors = {
    teal: { bg: 'bg-[#dff7f4]', text: 'text-[#0f766e]', border: 'border-[#ccfbf1]', shadow: 'shadow-[#14b8a6]/10' },
    tealSoft: { bg: 'bg-[#f4fce3]', text: 'text-[#0f766e]', border: 'border-[#e5f8cf]', shadow: 'shadow-[#14b8a6]/10' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-100', shadow: 'shadow-black/5' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', shadow: 'shadow-indigo-500/10' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', shadow: 'shadow-amber-500/10' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', shadow: 'shadow-rose-500/10' },
};

const StatCard = ({
    title,
    value,
    icon: Icon,
    isLoading,
    isError,
    accent = 'slate',
    trend,
    subText,
    className
}: StatCardProps) => {
    const colors = accentColors[accent];

    return (
        <div
            className={cn(
                'bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col gap-4 min-h-[140px]',
                colors.shadow,
                className
            )}
        >
            {isLoading ? (
                <>
                    <Skeleton className="w-11 h-11 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="w-24 h-6 rounded-md" />
                        <Skeleton className="w-16 h-3 rounded-md" />
                    </div>
                </>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 py-2 text-center">
                    <AlertCircle size={20} className="text-rose-400" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                        ERROR
                    </span>
                </div>
            ) : (
                <>
                    <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center border', colors.bg, colors.text, colors.border)}>
                        <Icon size={22} />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1 truncate">
                            {value ?? '0'}
                        </h3>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">
                            {title}
                        </p>
                    </div>

                    {(trend !== undefined || subText) && (
                        <div className="mt-auto">
                             <span className="text-[11px] font-bold text-slate-400 truncate block">
                                {subText}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default memo(StatCard);
