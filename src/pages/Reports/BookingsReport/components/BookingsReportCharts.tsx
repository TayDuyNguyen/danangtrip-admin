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
    Cell
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import type {
    BookingTrendChartDataPoint,
    BookingStatusDistributionPoint
} from '@/dataHelper/report.dataHelper';

interface BookingsReportChartsProps {
    data?: {
        trend: BookingTrendChartDataPoint[];
        statuses: BookingStatusDistributionPoint[];
    };
    isLoading?: boolean;
}

const BookingsReportCharts: React.FC<BookingsReportChartsProps> = ({
    data,
    isLoading = false
}) => {
    const { t } = useTranslation('bookings_report');

    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs h-[380px] lg:col-span-2">
                    <Skeleton className="w-48 h-6 mb-4" />
                    <Skeleton className="w-full h-[280px] rounded-xl" />
                </div>
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs h-[380px]">
                    <Skeleton className="w-48 h-6 mb-4" />
                    <Skeleton className="w-full h-[280px] rounded-xl" />
                </div>
            </div>
        );
    }

    const totalBookings = data.statuses.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 1. Trend Area Chart — Bookings & Revenue Trend */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[380px] lg:col-span-2">
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
                            <AreaChart data={data.trend} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.01}/>
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01}/>
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
                                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val}
                                    tick={{ fill: '#3b82f6', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid #F1F5F9',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                        padding: '10px 14px'
                                    }}
                                    labelStyle={{ fontWeight: 800, color: '#0F172A', fontSize: 11, marginBottom: 4 }}
                                    itemStyle={{ fontSize: 11, fontWeight: 700, padding: '2px 0' }}
                                    formatter={(value: string | number | readonly (string | number)[] | undefined, name?: string | number) => {
                                        if (typeof name === 'string' && name === t('charts.revenue_label')) {
                                            const numVal = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0;
                                            return [`${numVal.toLocaleString()} đ`, name];
                                        }
                                        const displayVal = Array.isArray(value) ? value.join(' - ') : String(value ?? '');
                                        return [displayVal, name ?? ''];
                                    }}
                                />
                                <Area
                                    yAxisId="left"
                                    name={t('charts.bookings_label')}
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#14b8a6"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorBookings)"
                                />
                                <Area
                                    yAxisId="right"
                                    name={t('charts.revenue_label')}
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="flex gap-4 mt-3 justify-center select-none">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                        {t('charts.bookings_label')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>
                        {t('charts.revenue_label')}
                    </div>
                </div>
            </div>

            {/* 2. Donut Chart — Booking Status Distribution */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[380px]">
                <div>
                    <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.status_title')}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.status_subtitle')}</p>
                </div>

                <div className="relative w-[180px] h-[180px] shrink-0 mx-auto flex items-center justify-center my-3">
                    {totalBookings === 0 ? (
                        <div className="text-center text-xs font-bold text-slate-400">{t('charts.no_data')}</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.statuses}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={3}
                                    dataKey="count"
                                >
                                    {data.statuses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    )}

                    {/* Absolute Overlay inside the donut center */}
                    <div className="absolute flex flex-col items-center justify-center select-none text-center">
                        <span className="text-2xl font-black text-slate-800 leading-none">{totalBookings.toLocaleString()}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('charts.bookings_label')}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-slate-50 pt-3">
                    {data.statuses.map((item) => (
                        <div key={item.status} className="flex justify-between items-center text-xs font-bold text-slate-500 py-0.5">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span>
                                    {item.status === 'pending' ? t('table.status_pending') :
                                     item.status === 'confirmed' ? t('table.status_confirmed') :
                                     item.status === 'completed' ? t('table.status_completed') : t('table.status_cancelled')}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-slate-800 font-extrabold">{item.count.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400 ml-1">({item.percentage}%)</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookingsReportCharts;

