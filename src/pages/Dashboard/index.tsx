import { useMemo, useState, useCallback } from 'react';
import { RefreshCcw, Calendar, TrendingUp, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/store';
import {
    useDashboardStatsQuery,
    useBookingStatusCountsQuery,
    useRevenueQuery,
    useBookingTrendQuery,
    useUserGrowthQuery,
    useTopToursQuery,
    useBookingsQuery,
    useBookingsExportMutation,
    dashboardKeys
} from '@/hooks/useDashboardQueries';
import StatsCards from './components/StatsCards';
import DashboardCharts from './components/DashboardCharts';
import TopToursTable from './components/TopToursTable';
import RecentOrdersTable from './components/RecentOrdersTable';
import { toast } from 'sonner';

// Separate filter options
const REVENUE_PERIOD_OPTIONS = [
    { labelKey: 'revenue.day', value: 'day' },
    { labelKey: 'revenue.week', value: 'week' },
    { labelKey: 'revenue.month', value: 'month' },
    { labelKey: 'revenue.year', value: 'year' },
] as const;

const BOOKING_TREND_OPTIONS = [
    { labelKey: 'period.7', value: 7 },
    { labelKey: 'period.30', value: 30 },
    { labelKey: 'period.90', value: 90 },
] as const;

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation('dashboard');
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const exportMutation = useBookingsExportMutation();

    // Filter states
    const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
    const [bookingTrendDays, setBookingTrendDays] = useState<7 | 30 | 90>(30);
    const [bookingsPage, setBookingsPage] = useState(1);
    const [bookingsStatus, setBookingsStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled' | ''>('');

    /**
     * Helper to calculate date ranges for specific filters
     */
    const getDateRange = useCallback((period: 'day' | 'week' | 'month' | 'year' | number) => {
        const today = new Date();
        const fromDate = new Date(today);

        if (typeof period === 'number') {
            fromDate.setDate(today.getDate() - period);
        } else {
            if (period === 'day') fromDate.setHours(0, 0, 0, 0);
            else if (period === 'week') fromDate.setDate(today.getDate() - 7);
            else if (period === 'month') fromDate.setMonth(today.getMonth() - 1);
            else if (period === 'year') fromDate.setFullYear(today.getFullYear() - 1);
        }

        return {
            from: fromDate.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        };
    }, []);

    // 1. Stats Cards
    const statsQuery = useDashboardStatsQuery();
    const bookingStatusCountsQuery = useBookingStatusCountsQuery();

    // 2. Charts
    const revenueRange = useMemo(() => getDateRange(revenuePeriod), [revenuePeriod, getDateRange]);
    const revenueQuery = useRevenueQuery({
        period: revenuePeriod,
        from: revenueRange.from,
        to: revenueRange.to
    });

    const bookingTrendQuery = useBookingTrendQuery({ days: bookingTrendDays });
    const userGrowthQuery = useUserGrowthQuery({ year: new Date().getFullYear() });

    // 3. Tables
    const toursRange = useMemo(() => getDateRange(bookingTrendDays), [bookingTrendDays, getDateRange]);
    const topToursQuery = useTopToursQuery({
        limit: 5,
        from: toursRange.from,
        to: toursRange.to
    });

    const bookingsQuery = useBookingsQuery({
        page: bookingsPage,
        per_page: 8,
        sort_by: 'booked_at',
        sort_order: 'desc',
        booking_status: bookingsStatus || undefined
    });

    // Handle global refresh
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
        setRefreshing(false);
    }, [queryClient]);

    // Handle export report
    const handleExport = useCallback(() => {
        const range = getDateRange(revenuePeriod);
        const fallbackFilename = t('tables.export_bookings_default_filename', {
            from: range.from,
            to: range.to,
        });
        exportMutation.mutate(
            { from_date: range.from, to_date: range.to, fallbackFilename },
            {
                onSuccess: () => toast.success(t('tables.export_success')),
                onError: (err) => {
                    toast.error(err instanceof Error ? err.message : t('tables.export_failed'));
                },
            }
        );
    }, [revenuePeriod, getDateRange, t, exportMutation]);

    // Build order status data
    const orderStatusData = useMemo(() => {
        const status = bookingStatusCountsQuery.data;
        if (!status) return [];
        return [
            { name: t('status.completed'), value: status.completed, color: '#14b8a6' },
            { name: t('status.confirmed'), value: status.confirmed, color: '#0f172a' },
            { name: t('status.pending'), value: status.pending, color: '#94a3b8' },
            { name: t('status.cancelled'), value: status.cancelled, color: '#ef4444' },
        ];
    }, [bookingStatusCountsQuery.data, t]);

    /** Tổng đơn = tổng 4 trạng thái (cùng nguồn với biểu đồ trạng thái đơn) */
    const ordersFromStatusTotal = useMemo(() => {
        if (bookingStatusCountsQuery.isLoading || bookingStatusCountsQuery.isError) return undefined;
        const s = bookingStatusCountsQuery.data;
        if (!s) return undefined;
        return s.pending + s.confirmed + s.completed + s.cancelled;
    }, [
        bookingStatusCountsQuery.isLoading,
        bookingStatusCountsQuery.isError,
        bookingStatusCountsQuery.data,
    ]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4 overflow-x-hidden min-w-0" aria-label={t('title')}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-slate-100">
                <div>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-[#14b8a6]" />
                        {t('title')}
                    </p>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                        {t('welcome_back', { name: user?.full_name || t('welcome_fallback_name') })}
                    </h1>
                    <p className="text-slate-500 font-bold text-sm mt-1.5 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        title={exportMutation.isPending ? t('exporting') : t('export')}
                        className="px-5 py-2.5 bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-xl shadow-[#14b8a6]/20 active:scale-95 disabled:opacity-50"
                    >
                        <Download size={16} className={exportMutation.isPending ? 'animate-bounce' : ''} />
                        {exportMutation.isPending ? t('exporting') : t('export')}
                    </button>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title={refreshing ? t('refreshing') : t('refresh')}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-xl active:scale-95 disabled:opacity-50 ${refreshing ? 'bg-[#dff7f4] text-slate-900 shadow-black/5' : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'}`}
                    >
                        <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? t('refreshing') : t('refresh')}
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-8 min-w-0">
                {/* 1. Stats Cards */}
                <StatsCards
                    stats={statsQuery.data}
                    bookingStatus={bookingStatusCountsQuery.data}
                    ordersFromStatusTotal={ordersFromStatusTotal}
                    isLoading={statsQuery.isLoading}
                    bookingStatusLoading={bookingStatusCountsQuery.isLoading}
                    isRefreshing={refreshing || statsQuery.isFetching || bookingStatusCountsQuery.isFetching}
                    isError={statsQuery.isError}
                    bookingStatusError={bookingStatusCountsQuery.isError}
                />

                {/* 2. Charts Row */}
                <DashboardCharts
                    dailyRevenueData={revenueQuery.data || []}
                    bookingTrendData={bookingTrendQuery.data || []}
                    userGrowthData={userGrowthQuery.data || []}
                    orderStatusData={orderStatusData}
                    // Filter props
                    revenuePeriod={revenuePeriod}
                    onRevenuePeriodChange={setRevenuePeriod}
                    revenuePeriodOptions={REVENUE_PERIOD_OPTIONS}
                    bookingTrendDays={bookingTrendDays}
                    onBookingTrendDaysChange={setBookingTrendDays}
                    bookingTrendOptions={BOOKING_TREND_OPTIONS}
                    // State props
                    onRevenueRefresh={() => revenueQuery.refetch()}
                    isRevenueFetching={revenueQuery.isFetching}
                    isRevenueLoading={revenueQuery.isLoading}
                    isRevenueError={revenueQuery.isError}
                    onTrendRefresh={() => bookingTrendQuery.refetch()}
                    isTrendFetching={bookingTrendQuery.isFetching}
                    isTrendLoading={bookingTrendQuery.isLoading}
                    isTrendError={bookingTrendQuery.isError}
                    onGrowthRefresh={() => userGrowthQuery.refetch()}
                    isGrowthFetching={userGrowthQuery.isFetching}
                    isGrowthLoading={userGrowthQuery.isLoading}
                    isGrowthError={userGrowthQuery.isError}
                    onStatusRefresh={() => bookingStatusCountsQuery.refetch()}
                    isStatusFetching={bookingStatusCountsQuery.isFetching}
                    isStatusLoading={bookingStatusCountsQuery.isLoading}
                    isStatusError={bookingStatusCountsQuery.isError}
                />

                {/* 3. Tables Section */}
                <div className="grid grid-cols-1 gap-8">
                    <TopToursTable
                        topTours={topToursQuery.data || []}
                        onRefresh={() => topToursQuery.refetch()}
                        isRefreshing={topToursQuery.isFetching}
                        isLoading={topToursQuery.isLoading}
                        isError={topToursQuery.isError}
                    />
                    <RecentOrdersTable
                        bookings={bookingsQuery.data}
                        currentPage={bookingsPage}
                        onPageChange={setBookingsPage}
                        statusFilter={bookingsStatus}
                        onStatusChange={setBookingsStatus}
                        onRefresh={() => bookingsQuery.refetch()}
                        isRefreshing={bookingsQuery.isFetching}
                        isLoading={bookingsQuery.isLoading}
                        isError={bookingsQuery.isError}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
