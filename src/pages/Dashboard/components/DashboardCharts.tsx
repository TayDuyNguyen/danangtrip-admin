import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import {
    LineChart, Line,
    BarChart, Bar, Cell,
    AreaChart, Area,
    XAxis, YAxis,
    CartesianGrid, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { RefreshCw } from 'lucide-react';
import type { DashboardChartsProps } from '@/dataHelper/dashboard.dataHelper';
import { Skeleton } from '@/components/ui/Skeleton';

// Extended props with filter controls
interface ExtendedDashboardChartsProps extends DashboardChartsProps {
    // Revenue filter
    revenuePeriod: 'day' | 'week' | 'month' | 'year';
    onRevenuePeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
    revenuePeriodOptions: ReadonlyArray<{ labelKey: string; value: string }>;
    // Booking trend filter
    bookingTrendDays: 7 | 30 | 90;
    onBookingTrendDaysChange: (days: 7 | 30 | 90) => void;
    bookingTrendOptions: ReadonlyArray<{ labelKey: string; value: number }>;
}

// Axis formatters moved inside component to access i18next 't'

// ─── Custom Tooltip ───────────────────────────────────────────────────────
interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; name: string }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-sm">
                <p className="font-bold text-slate-400 mb-1 text-[11px] uppercase tracking-widest">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="font-black">
                        {Number.isFinite(p.value)
                            ? p.value.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
                            : '0'}{' '}
                        {p.name}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ─── Chart Card Wrapper ──────────────────────────────────────────────────
interface ChartCardProps {
    title: string;
    subtitle: string;
    badge?: string;
    filter?: ReactNode;
    refreshTooltip?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    isLoading?: boolean;
    children: ReactNode;
}

const ChartCard = ({
    title, subtitle, badge, filter,
    refreshTooltip, onRefresh, isRefreshing, isLoading, children,
}: ChartCardProps) => (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm h-[380px] flex flex-col hover:shadow-xl transition-all duration-500 group/card">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tighter">{title}</h3>
                    <p className="text-slate-400 text-[12px] font-bold">{subtitle}</p>
                </div>
                {onRefresh && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                        disabled={isRefreshing}
                        title={refreshTooltip ?? 'Refresh'}
                        aria-label={refreshTooltip ?? 'Refresh'}
                        className={`p-2 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all ${isRefreshing
                            ? 'opacity-100 text-blue-600 cursor-not-allowed'
                            : 'text-slate-400 hover:text-blue-600 active:scale-90 group-hover/card:opacity-100 opacity-0 lg:opacity-0'
                        }`}
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                )}
            </div>
            <div className="flex items-center gap-2">
                {filter}
                {badge && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black rounded-xl border border-blue-100 uppercase tracking-wider">
                        {badge}
                    </span>
                )}
            </div>
        </div>
        <div className="flex-1 min-h-0">
            {isLoading ? <Skeleton className="w-full h-full rounded-2xl" /> : children}
        </div>
    </div>
);

// ─── Filter Button ────────────────────────────────────────────────────────
const FilterButton = ({ active, onClick, label }: {
    active: boolean;
    onClick: () => void;
    label: string;
}) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-[11px] font-black rounded-lg transition-all ${active
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
    >
        {label}
    </button>
);

// ─── Main Component ───────────────────────────────────────────────────────
const DashboardCharts = (props: ExtendedDashboardChartsProps) => {
    const {
        dailyRevenueData,
        bookingTrendData,
        userGrowthData,
        orderStatusData,
        revenuePeriod,
    } = props;
    const { t } = useTranslation('dashboard');

    const safeDailyRevenueData = Array.isArray(dailyRevenueData) ? dailyRevenueData : [];
    const safeBookingTrendData = Array.isArray(bookingTrendData) ? bookingTrendData : [];
    const safeUserGrowthData   = Array.isArray(userGrowthData)   ? userGrowthData   : [];
    const safeOrderStatusData  = Array.isArray(orderStatusData)  ? orderStatusData  : [];

    const revenueSeriesTotal = safeDailyRevenueData.reduce((a, b) => a + (Number(b.revenue) || 0), 0);
    const bookingTrendTotal  = safeBookingTrendData.reduce((a, b) => a + (Number(b.count) || 0), 0);
    const userGrowthNewTotal = safeUserGrowthData.reduce((a, b) => a + (Number(b.new_users) || 0), 0);
    const orderStatusTotal   = safeOrderStatusData.reduce((a, b) => a + (Number(b.value) || 0), 0);

    const fmtInt = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US');

    // ─── Y-axis localized formatters ──────────────────────────────────────────
    const fmtRevenueAxis = (v: number) => {
        if (!Number.isFinite(v)) return '0';
        if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)} ${t('charts.unit_million')}`;
        if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)} ${t('charts.unit_thousand')}`;
        return `${Math.round(v)}`;
    };

    const fmtCountAxis = (v: number) => {
        if (!Number.isFinite(v)) return '0';
        if (v >= 1_000) return `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)} ${t('charts.unit_thousand')}`;
        return `${Math.round(v)}`;
    };

    /** i18n tooltip for chart refresh buttons */
    const refreshLabel = t('charts.refresh_chart', { defaultValue: t('refresh') });

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Chart 1: Daily Revenue (Line) */}
            <ChartCard
                title={t('charts.daily_revenue')}
                subtitle={t(`revenue.${revenuePeriod}`)}
                badge={t('charts.badge_total_short', { value: `${fmtInt(revenueSeriesTotal)} ${t('charts.unit_currency')}` })}
                refreshTooltip={refreshLabel}
                onRefresh={props.onRevenueRefresh}
                isRefreshing={props.isRevenueFetching}
                isLoading={props.isRevenueLoading}
                filter={
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        {props.revenuePeriodOptions.map((opt) => (
                            <FilterButton
                                key={opt.value}
                                active={props.revenuePeriod === opt.value}
                                onClick={() => props.onRevenuePeriodChange(opt.value as 'day' | 'week' | 'month' | 'year')}
                                label={t(opt.labelKey) || opt.value}
                            />
                        ))}
                    </div>
                }
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={safeDailyRevenueData} margin={{ left: 10, right: 10 }}>
                        <defs>
                            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={fmtRevenueAxis}
                            width={56}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="url(#lineGrad)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            name={t('charts.unit_currency')}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Chart 2: Booking Trend (Bar) */}
            <ChartCard
                title={t('charts.booking_trend')}
                subtitle={t('charts.total_orders_count', { count: bookingTrendTotal })}
                badge={t('charts.badge_total_short', { value: fmtInt(bookingTrendTotal) })}
                refreshTooltip={refreshLabel}
                onRefresh={props.onTrendRefresh}
                isRefreshing={props.isTrendFetching}
                isLoading={props.isTrendLoading}
                filter={
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                        {props.bookingTrendOptions.map((opt) => (
                            <FilterButton
                                key={opt.value}
                                active={props.bookingTrendDays === opt.value}
                                onClick={() => props.onBookingTrendDaysChange(opt.value as 7 | 30 | 90)}
                                label={t(opt.labelKey) || `${opt.value}d`}
                            />
                        ))}
                    </div>
                }
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeBookingTrendData} margin={{ left: -10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                            /* Show fewer ticks when range > 7 days to avoid overlap */
                            interval={props.bookingTrendDays <= 7 ? 0 : Math.ceil(props.bookingTrendDays / 7) - 1}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={fmtCountAxis}
                            allowDecimals={false}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                            barSize={props.bookingTrendDays <= 7 ? 28 : props.bookingTrendDays <= 30 ? 14 : 8}
                            name={t('charts.unit_orders')}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Chart 3: User Growth (Area) */}
            <ChartCard
                title={t('charts.user_growth')}
                subtitle={t('charts.last_12_months')}
                badge={t('charts.badge_total_short', { value: fmtInt(userGrowthNewTotal) })}
                refreshTooltip={refreshLabel}
                onRefresh={props.onGrowthRefresh}
                isRefreshing={props.isGrowthFetching}
                isLoading={props.isGrowthLoading}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeUserGrowthData} margin={{ left: -4, right: 20, top: 10, bottom: 20 }}>
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            interval={1}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={fmtCountAxis}
                            allowDecimals={false}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="new_users"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="url(#areaGrad)"
                            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                            name={t('charts.unit_users')}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Chart 4: Order Status (Vertical Bar) */}
            <ChartCard
                title={t('charts.order_status')}
                subtitle={t('charts.allocation')}
                badge={t('charts.badge_total_short', { value: fmtInt(orderStatusTotal) })}
                refreshTooltip={refreshLabel}
                onRefresh={props.onStatusRefresh}
                isRefreshing={props.isStatusFetching}
                isLoading={props.isStatusLoading}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={safeOrderStatusData} margin={{ left: -10, right: 10, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            tickFormatter={fmtCountAxis}
                            allowDecimals={false}
                            width={40}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-sm">
                                            <p className="font-bold text-slate-400 mb-1 text-[11px] uppercase tracking-widest">
                                                {payload[0].payload.name}
                                            </p>
                                            <p className="font-black">
                                                {Number(payload[0].value).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} {t('charts.unit_orders')}
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                            {safeOrderStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
};

export default memo(DashboardCharts);
