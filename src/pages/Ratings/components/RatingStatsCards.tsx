import React from 'react';
import { MessageSquare, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import EmptyState from '@/components/common/EmptyState';

interface RatingStatsCardsProps {
    stats?: {
        total: number;
        new: number;
        viewed: number;
        rejected: number;
    };
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

const RatingStatsCards: React.FC<RatingStatsCardsProps> = ({
    stats,
    isLoading = false,
    isError = false,
    onRetry,
}) => {
    const { t } = useTranslation(['ratings', 'common']);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="p-[1px] rounded-3xl bg-gradient-to-br from-slate-200/20 via-slate-100/10 to-transparent">
                        <div className="bg-white rounded-[23px] p-6 h-full border border-slate-100 shadow-xs">
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                            </div>
                            <Skeleton className="w-20 h-8 mb-2" />
                            <Skeleton className="w-28 h-4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div
                className="bg-white border border-[#E2E8F0] rounded-2xl p-8 flex flex-col items-center text-center mb-6"
                data-testid="rating-stats-error"
            >
                <EmptyState
                    title={t('error.stats_load_failed')}
                    description={t('error.stats_load_failed_desc')}
                />
                {onRetry && (
                    <button
                        type="button"
                        onClick={() => void onRetry()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('actions.retry', { ns: 'common', defaultValue: 'Thử lại' })}
                    </button>
                )}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Ratings */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/25 via-slate-200/20 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/35 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full border border-slate-100/50">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#14b8a6]"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#14b8a6] border border-teal-100/50 group-hover:scale-110 transition-transform duration-200">
                            <MessageSquare size={20} />
                        </div>
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-1 select-all">
                            {stats.total.toLocaleString()}
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.total_ratings')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Visible Reviews */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-emerald-500/25 via-slate-200/20 to-slate-100/10 shadow-xs hover:shadow-md hover:from-emerald-500/35 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full border border-slate-100/50">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100/50 group-hover:scale-110 transition-transform duration-200">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-emerald-600 leading-tight mb-1 select-all">
                            {stats.viewed.toLocaleString()}
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.viewed_ratings', 'Đã xem')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hidden Reviews */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-rose-500/25 via-slate-200/20 to-slate-100/10 shadow-xs hover:shadow-md hover:from-rose-500/35 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full border border-slate-100/50">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/50 group-hover:scale-110 transition-transform duration-200">
                            <XCircle size={20} />
                        </div>
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-rose-600 leading-tight mb-1 select-all">
                            {stats.rejected.toLocaleString()}
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.hidden_ratings', 'Đã ẩn')}
                        </p>
                    </div>
                </div>
            </div>

            {/* New Reviews */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-500/25 via-slate-200/20 to-slate-100/10 shadow-xs hover:shadow-md hover:from-amber-500/35 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full border border-slate-100/50">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50 group-hover:scale-110 transition-transform duration-200 relative">
                            <Clock size={20} />
                            {stats.new > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-amber-600 leading-tight mb-1 select-all">
                            {stats.new.toLocaleString()}
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.new_ratings', 'Mới')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingStatsCards;
