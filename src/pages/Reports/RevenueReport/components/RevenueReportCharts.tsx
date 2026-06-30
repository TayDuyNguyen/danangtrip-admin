import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Line
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import type {
    RevenueTrendChartPoint,
    TopTourRevenuePoint,
    RevenueGatewayBreakdownPoint
} from '@/dataHelper/report.dataHelper';

interface RevenueReportChartsProps {
    data?: {
        trend: RevenueTrendChartPoint[];
        topTours: TopTourRevenuePoint[];
        gateways: RevenueGatewayBreakdownPoint[];
    };
    isLoading?: boolean;
}

const RevenueReportCharts: React.FC<RevenueReportChartsProps> = ({
    data,
    isLoading = false
}) => {
    const { t } = useTranslation(['revenue_report', 'common']);

    if (isLoading || !data) {
        return (
            <div className="flex flex-col gap-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs animate-pulse">
                        <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 h-[380px]">
                            <Skeleton className="w-48 h-6 mb-4" />
                            <Skeleton className="w-full h-[280px] rounded-xl" />
                        </div>
                    </div>
                    <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs animate-pulse">
                        <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 h-[380px]">
                            <Skeleton className="w-48 h-6 mb-4" />
                            <Skeleton className="w-full h-[280px] rounded-xl" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs animate-pulse">
                        <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 h-[320px]">
                            <Skeleton className="w-48 h-6 mb-4" />
                            <Skeleton className="w-full h-[220px] rounded-xl" />
                        </div>
                    </div>
                    <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs animate-pulse">
                        <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 h-[320px]">
                            <Skeleton className="w-48 h-6 mb-4" />
                            <Skeleton className="w-full h-[220px] rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Format currency to readable numbers, e.g., 1.2M or 500K
    const formatYAxisCurrency = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    const totalRevenue = data.gateways.reduce((sum, item) => sum + item.revenue, 0);

    return (
        <div className="flex flex-col gap-6 mb-6">
            {/* ROW 1: Revenue Trend & Top 5 High-Revenue Tours */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1.1 Dual-Axis Area & Line Chart - Cash Flow Trend */}
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 flex flex-col justify-between h-[380px]">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.trend_title')}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.trend_subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 w-full">
                            {data.trend.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                    {t('charts.no_data')}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.trend} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid stroke="#F8FAFC" strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={formatYAxisCurrency}
                                            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <Tooltip
                                            formatter={(value: unknown, name?: string | number) => {
                                                const nameStr = String(name ?? '');
                                                if (nameStr === t('charts.revenue_label')) {
                                                    return [`${Number(value).toLocaleString()} đ`, nameStr];
                                                }
                                                return [String(value), nameStr];
                                            }}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid #F1F5F9',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 12px -1px rgba(0,0,0,0.05)',
                                                padding: '10px 14px'
                                            }}
                                            labelStyle={{ fontWeight: 800, color: '#0F172A', fontSize: 11, marginBottom: 4 }}
                                            itemStyle={{ fontSize: 11, fontWeight: 700, padding: '2px 0' }}
                                        />
                                        <Area
                                            yAxisId="left"
                                            name={t('charts.revenue_label')}
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#10b981"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorRevenue)"
                                        />
                                        <Line
                                            yAxisId="right"
                                            name={t('charts.transactions_label')}
                                            type="monotone"
                                            dataKey="transactions"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 1, stroke: '#fff' }}
                                            activeDot={{ r: 5 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        <div className="flex gap-4 mt-3 justify-center select-none">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                                {t('charts.revenue_label')}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                                {t('charts.transactions_label')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1.2 Top 5 Tours (Horizontal Bar Chart) */}
                <div
                    className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300"
                    data-testid="revenue-top-tours-chart"
                >
                    <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 flex flex-col justify-between h-[380px]">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.top_tours_title')}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.top_tours_subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 w-full">
                            {data.topTours.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                    {t('charts.no_data')}
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data.topTours}
                                        layout="vertical"
                                        margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                                    >
                                        <CartesianGrid stroke="#F8FAFC" strokeDasharray="3 3" horizontal={false} />
                                        <XAxis
                                            type="number"
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={formatYAxisCurrency}
                                            tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="tourName"
                                            tickLine={false}
                                            axisLine={false}
                                            width={140}
                                            tickFormatter={(name) => (name.length > 28 ? `${name.substring(0, 28)}…` : name)}
                                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <Tooltip
                                            formatter={(value: unknown) => [`${Number(value).toLocaleString()} đ`, t('charts.revenue_label')]}
                                            labelFormatter={(label) => String(label)}
                                            contentStyle={{
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid #F1F5F9',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 12px -1px rgba(0,0,0,0.05)',
                                            }}
                                            itemStyle={{ fontSize: 11, fontWeight: 700 }}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#0ea5e9"
                                            radius={[0, 6, 6, 0]}
                                            barSize={16}
                                        >
                                            {data.topTours.map((_, index) => {
                                                // Gradient color shifts for high to lower ranks
                                                const colors = ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 2: Gateway share (donut) & Gateway bar (revenue detail per channel) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2.1 Donut Chart - Gateway Breakdown */}
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 flex flex-col lg:flex-row gap-6 items-center h-[300px]">
                        <div className="flex-1 flex flex-col self-stretch justify-between">
                            <div>
                                <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.gateway_donut_title')}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.gateway_donut_subtitle')}</p>
                            </div>

                            <div className="flex flex-col gap-2 mt-4">
                                {data.gateways.map((item) => (
                                    <div key={item.gateway} className="flex justify-between items-center text-xs font-bold text-slate-500 py-1 border-b border-slate-50/50">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                            <span className="uppercase">{item.gateway}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-800 font-extrabold">{item.revenue.toLocaleString()} đ</span>
                                            <span className="text-[10px] text-slate-400 ml-1">({item.percentage}%)</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative w-[180px] h-[180px] shrink-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.gateways}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={3}
                                        dataKey="revenue"
                                    >
                                        {data.gateways.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Centered Total Overlay */}
                            <div className="absolute flex flex-col items-center justify-center select-none text-center px-4 w-full">
                                <span className="text-lg font-black text-slate-800 leading-none truncate max-w-full">
                                    {totalRevenue >= 100000000 
                                        ? `${(totalRevenue / 1000000).toFixed(1)}M` 
                                        : totalRevenue.toLocaleString()}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">TOTAL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2.2 Vertical Bar Chart - Revenue per Gateway */}
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
                    <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 flex flex-col justify-between h-[300px]">
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.gateway_bar_title')}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.gateway_bar_subtitle')}</p>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data.gateways}
                                    margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
                                >
                                    <CartesianGrid stroke="#F8FAFC" strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="gateway"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.toUpperCase()}
                                        tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatYAxisCurrency}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        formatter={(value: unknown) => [`${Number(value).toLocaleString()} đ`, t('charts.revenue_label')]}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid #F1F5F9',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px -1px rgba(0,0,0,0.05)',
                                        }}
                                        itemStyle={{ fontSize: 11, fontWeight: 700 }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                    >
                                        {data.gateways.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueReportCharts;
