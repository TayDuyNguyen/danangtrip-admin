import React from 'react';
import { MessageSquare, Clock, CheckCircle2, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

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
            {/* Total Ratings */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-[#14b8a6]"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#14b8a6] group-hover:scale-110 transition-transform">
                        <MessageSquare size={20} />
                    </div>
                    {renderTrendBadge(stats.totalTrend)}
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 select-all">
                    {stats.total.toLocaleString()}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Tổng đánh giá
                </p>
            </div>

            {/* Pending Reviews */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-amber-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </div>
                    {renderTrendBadge(stats.pendingTrend)}
                </div>
                <h3 className="text-2xl font-black text-amber-600 leading-tight mb-1 select-all">
                    {stats.pending.toLocaleString()}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Chờ duyệt
                </p>
            </div>

            {/* Approved Reviews */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={20} />
                    </div>
                    {renderTrendBadge(stats.approvedTrend)}
                </div>
                <h3 className="text-2xl font-black text-emerald-600 leading-tight mb-1 select-all">
                    {stats.approved.toLocaleString()}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Đã duyệt
                </p>
            </div>

            {/* Average Rating Score */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 bg-amber-400"></div>
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
                        <Star size={20} className="fill-yellow-500/20" />
                    </div>
                    {renderTrendBadge(stats.averageTrend)}
                </div>
                <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1 select-all flex items-baseline gap-1">
                    {stats.average.toFixed(1)}
                    <span className="text-sm font-black text-amber-500">★</span>
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Điểm trung bình
                </p>
            </div>
        </div>
    );
};

export default RatingStatsCards;
