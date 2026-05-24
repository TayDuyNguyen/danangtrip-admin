import React from 'react';
import { DollarSign, BarChart3, Receipt, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';

interface RevenueStatsCardsProps {
    stats?: {
        totalRevenue: number;
        totalRevenueTrend: number;
        dailyAverage: number;
        dailyAverageTrend: number;
        totalTransactions: number;
        totalTransactionsTrend: number;
        totalRefunded: number;
        totalRefundedTrend: number;
    };
    isLoading?: boolean;
}

const RevenueStatsCards: React.FC<RevenueStatsCardsProps> = ({ stats, isLoading = false }) => {
    const { t } = useTranslation('revenue_report');

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
            {/* Total Revenue */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-emerald-500/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-emerald-500/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100/50 group-hover:scale-110 transition-transform duration-200">
                            <DollarSign size={20} />
                        </div>
                        {renderTrendBadge(stats.totalRevenueTrend)}
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-1 select-all truncate">
                            {stats.totalRevenue.toLocaleString()} <span className="text-sm font-bold text-[#94A3B8]">đ</span>
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.total_revenue')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Daily Average */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#14b8a6]"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#14b8a6] border border-teal-100/50 group-hover:scale-110 transition-transform duration-200">
                            <BarChart3 size={20} />
                        </div>
                        {renderTrendBadge(stats.dailyAverageTrend)}
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-1 select-all truncate">
                            {stats.dailyAverage.toLocaleString()} <span className="text-sm font-bold text-[#94A3B8]">đ</span>
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.daily_average')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Transactions */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-blue-500/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-blue-500/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100/50 group-hover:scale-110 transition-transform duration-200">
                            <Receipt size={20} />
                        </div>
                        {renderTrendBadge(stats.totalTransactionsTrend)}
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-1 select-all truncate">
                            {stats.totalTransactions.toLocaleString()}
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.total_transactions')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Refunded */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-rose-500/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-rose-500/30 transition-all duration-300 group h-full">
                <div className="bg-white rounded-[23px] p-6 relative overflow-hidden h-full">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                    <div className="flex justify-between items-start mb-4 pl-1">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100/50 group-hover:scale-110 transition-transform duration-200">
                            <RotateCcw size={20} />
                        </div>
                        {renderTrendBadge(stats.totalRefundedTrend)}
                    </div>
                    <div className="pl-1">
                        <h3 className="text-2xl font-black text-rose-600 leading-tight mb-1 select-all truncate">
                            {stats.totalRefunded.toLocaleString()} <span className="text-sm font-bold text-rose-400">đ</span>
                        </h3>
                        <p className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                            {t('stats.total_refunded')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueStatsCards;
