import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import {
    CircleDollarSign,
    ShoppingCart,
    Users,
    Ticket,
    Clock,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import type { StatsCardsProps } from '@/dataHelper/dashboard.dataHelper';
import { Skeleton } from '@/components/ui/Skeleton';

const formatInt = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');

const StatsCards = ({
    stats,
    bookingStatus,
    ordersFromStatusTotal,
    isLoading,
    bookingStatusLoading,
    isError,
}: StatsCardsProps) => {
    const { t } = useTranslation('dashboard');

    if (isError) {
        return (
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-red-50/50 p-5 rounded-3xl border border-red-100 h-[140px] flex items-center justify-center"
                    >
                        <span className="text-red-400 text-sm font-bold">{t('error_loading')}</span>
                    </div>
                ))}
            </div>
        );
    }

    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-[140px] flex flex-col gap-4"
                    >
                        <Skeleton className="w-11 h-11 rounded-2xl" />
                        <div>
                            <Skeleton className="w-24 h-6 mb-2 rounded-md" />
                            <Skeleton className="w-16 h-3 rounded-md" />
                        </div>
                        <div className="mt-auto">
                            <Skeleton className="w-20 h-5 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const ordersFromStatus = ordersFromStatusTotal !== undefined;

    /** Tổng doanh thu luôn từ API dashboard/stats (total_revenue), không lấy từ biểu đồ */
    const revenueValueStr = formatInt(stats.total_revenue ?? 0);

    const ordersValueStr =
        bookingStatusLoading && !ordersFromStatus
            ? null
            : formatInt(ordersFromStatus ? ordersFromStatusTotal! : stats.total_bookings ?? 0);

    const cardData = [
        {
            title: t('stats.total_revenue'),
            valueStr: revenueValueStr,
            valueSkeleton: false,
            trend: stats.total_revenue_trend,
            sub: t('stats.vs_last_period'),
            icon: CircleDollarSign,
            accent: 'blue',
        },
        {
            title: t('stats.total_orders'),
            valueStr: ordersValueStr,
            valueSkeleton: Boolean(bookingStatusLoading && !ordersFromStatus),
            trend: ordersFromStatus ? null : stats.total_bookings_trend,
            sub: ordersFromStatus ? t('stats.chart_orders_hint') : t('stats.vs_last_period'),
            icon: ShoppingCart,
            accent: 'emerald',
        },
        {
            title: t('stats.total_users'),
            valueStr: formatInt(stats.total_users ?? 0),
            valueSkeleton: false,
            trend: stats.total_users_trend,
            sub: t('stats.vs_last_period'),
            icon: Users,
            accent: 'sky',
        },
        {
            title: t('stats.tours_sold'),
            valueStr: formatInt(stats.total_tours_sold ?? 0),
            valueSkeleton: false,
            trend: stats.total_tours_sold_trend,
            sub: t('stats.vs_last_period'),
            icon: Ticket,
            accent: 'orange',
        },
        {
            title: t('stats.pending_orders'),
            valueStr:
                bookingStatusLoading && !bookingStatus
                    ? null
                    : formatInt(bookingStatus?.pending ?? stats.booking_status?.pending_count ?? 0),
            valueSkeleton: Boolean(bookingStatusLoading && !bookingStatus),
            trend: null,
            sub: t('stats.waiting_processing'),
            icon: Clock,
            accent: 'amber',
        },
        {
            title: t('stats.new_contacts'),
            valueStr: formatInt(stats.new_contacts ?? 0),
            valueSkeleton: false,
            trend: null,
            sub: t('stats.unread_messages'),
            icon: MessageSquare,
            accent: 'rose',
        },
    ];

    const accentColors: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', shadow: 'shadow-blue-100/80' },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            border: 'border-emerald-100',
            shadow: 'shadow-emerald-100/80',
        },
        sky: {
            bg: 'bg-sky-50',
            text: 'text-sky-600',
            border: 'border-sky-100',
            shadow: 'shadow-sky-100/80',
        },
        orange: {
            bg: 'bg-orange-50',
            text: 'text-orange-600',
            border: 'border-orange-100',
            shadow: 'shadow-orange-100/80',
        },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', shadow: 'shadow-amber-100/80' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', shadow: 'shadow-rose-100/80' },
    };

    return (
        <div className="grid grid-cols-3 xl:grid-cols-6 gap-4" aria-label={t('stats.title')}>
            {cardData.map((card, index) => {
                const colors = accentColors[card.accent];
                const isUp = card.trend !== null && card.trend >= 0;
                const showCardSkeleton = card.valueStr === null && card.valueSkeleton;

                return (
                    <div
                        key={index}
                        className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg ${colors.shadow} hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4 min-h-[140px]`}
                    >
                        {showCardSkeleton ? (
                            <>
                                <Skeleton className="w-11 h-11 rounded-2xl" />
                                <div>
                                    <Skeleton className="w-24 h-6 mb-2 rounded-md" />
                                    <Skeleton className="w-16 h-3 rounded-md" />
                                </div>
                                <div className="mt-auto">
                                    <Skeleton className="w-20 h-5 rounded-lg" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                    <card.icon size={22} />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                                        {card.valueStr ?? '—'}
                                    </h3>
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        {card.title}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    {card.trend !== null ? (
                                        <span
                                            className={`inline-flex items-center gap-0.5 text-[11px] font-black px-2 py-1 rounded-lg ${
                                                isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                            }`}
                                        >
                                            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {Math.abs(card.trend)}% {card.sub}
                                        </span>
                                    ) : (
                                        <span className="text-[11px] font-bold text-slate-400">{card.sub}</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default memo(StatsCards);
