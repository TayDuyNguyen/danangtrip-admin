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
                    <div key={idx} className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <Skeleton className="w-16 h-5 rounded-full" />
                        </div>
                        <Skeleton className="w-24 h-8 mb-2" />
                        <Skeleton className="w-32 h-4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Revenue */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <DollarSign size={20} />
                    </div>
                    {renderTrendBadge(stats.totalRevenueTrend)}
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 select-all truncate">
                    {stats.totalRevenue.toLocaleString()} <span className="text-sm font-bold text-slate-400">đ</span>
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t('stats.total_revenue')}
                </p>
            </div>

            {/* Daily Average */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-[#14b8a6]"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#14b8a6] group-hover:scale-110 transition-transform">
                        <BarChart3 size={20} />
                    </div>
                    {renderTrendBadge(stats.dailyAverageTrend)}
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 select-all truncate">
                    {stats.dailyAverage.toLocaleString()} <span className="text-sm font-bold text-slate-400">đ</span>
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t('stats.daily_average')}
                </p>
            </div>

            {/* Total Transactions */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-blue-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Receipt size={20} />
                    </div>
                    {renderTrendBadge(stats.totalTransactionsTrend)}
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 select-all truncate">
                    {stats.totalTransactions.toLocaleString()}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t('stats.total_transactions')}
                </p>
            </div>

            {/* Total Refunded */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-rose-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                        <RotateCcw size={20} />
                    </div>
                    {renderTrendBadge(stats.totalRefundedTrend)}
                </div>
                <h3 className="text-2xl font-black text-rose-600 leading-tight mb-1 select-all truncate">
                    {stats.totalRefunded.toLocaleString()} <span className="text-sm font-bold text-rose-400">đ</span>
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {t('stats.total_refunded')}
                </p>
            </div>
        </div>
    );
};

export default RevenueStatsCards;
