import React from 'react';
import { MessageSquare, Clock, CheckCircle2, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';

interface RatingStatsCardsProps {
    stats?: {
        total: number;
        totalTrend: number;
        pending: number;
        pendingTrend: number;
        approved: number;
        approvedTrend: number;
        average: number;
        averageTrend: number;
    };
    isLoading?: boolean;
}

const RatingStatsCards: React.FC<RatingStatsCardsProps> = ({ stats, isLoading = false }) => {
    const { t } = useTranslation(['ratings', 'common']);

    const renderTrendBadge = (trend: number) => {
        const isPositive = trend > 0;
        const isNegative = trend < 0;

        if (isPositive) {
            return (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-extrabold text-[11px] px-2 py-0.5 rounded-full select-none">
                    <TrendingUp size={11} />
                    +{trend.toFixed(1)}%
                </span>
            );
        } else if (isNegative) {
            return (
                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 font-extrabold text-[11px] px-2 py-0.5 rounded-full select-none">
                    <TrendingDown size={11} />
                    {trend.toFixed(1)}%
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-400 font-extrabold text-[11px] px-2 py-0.5 rounded-full select-none">
                    0.0%
                </span>
            );
        }
    };

    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="p-[1px] rounded-3xl bg-gradient-to-br from-slate-200/20 via-slate-100/10 to-transparent">
                        <div className="bg-white rounded-[23px] p-6 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton className="w-10 h-10 rounded-xl" />
                                <Skeleton className="w-16 h-5 rounded-full" />
                            </div>
                            <Skeleton className="w-24 h-8 mb-2" />
                            <Skeleton className="w-32 h-4" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Ratings */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#14b8a6]"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#14b8a6] border border-teal-100/50 group-hover:scale-110 transition-transform duration-200">
                            <MessageSquare size={20} />
                        </div>
                        {renderTrendBadge(stats.totalTrend)}
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

            {/* Pending Reviews */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-amber-500/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100/50 group-hover:scale-110 transition-transform duration-200">
                            <Clock size={20} />
                        </div>
                        {renderTrendBadge(stats.pendingTrend)}
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-amber-600 leading-tight mb-1 select-all">
                            {stats.pending.toLocaleString()}
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('filter.status_pending')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Approved Reviews */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-emerald-500/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-emerald-500/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100/50 group-hover:scale-110 transition-transform duration-200">
                            <CheckCircle2 size={20} />
                        </div>
                        {renderTrendBadge(stats.approvedTrend)}
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-emerald-600 leading-tight mb-1 select-all">
                            {stats.approved.toLocaleString()}
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('filter.status_approved')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Average Rating Score */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-amber-400/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-amber-400/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 border border-yellow-100/50 group-hover:scale-110 transition-transform duration-200">
                            <Star size={20} className="fill-yellow-500/20" />
                        </div>
                        {renderTrendBadge(stats.averageTrend)}
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-1 select-all flex items-baseline gap-1">
                            {stats.average.toFixed(1)}
                            <span className="text-sm font-black text-amber-500">★</span>
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.average_score')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingStatsCards;
