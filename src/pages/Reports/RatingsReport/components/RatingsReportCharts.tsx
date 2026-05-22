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
    Bar
} from 'recharts';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import type {
    TrendChartDataPoint,
    StarDistributionPoint,
    StatusDistributionPoint,
    TypeDistributionPoint
} from '@/dataHelper/report.dataHelper';

interface RatingsReportChartsProps {
    data?: {
        trend: TrendChartDataPoint[];
        stars: StarDistributionPoint[];
        statuses: StatusDistributionPoint[];
        types: TypeDistributionPoint[];
    };
    averageScore?: number;
    isLoading?: boolean;
}

const RatingsReportCharts: React.FC<RatingsReportChartsProps> = ({
    data,
    averageScore = 0,
    isLoading = false
}) => {
    const { t } = useTranslation(['ratings', 'common']);

    if (isLoading || !data) {
        return (
            <div className="flex flex-col gap-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs h-[360px]">
                        <Skeleton className="w-48 h-6 mb-4" />
                        <Skeleton className="w-full h-[260px] rounded-xl" />
                    </div>
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs h-[360px]">
                        <Skeleton className="w-48 h-6 mb-4" />
                        <Skeleton className="w-full h-[260px] rounded-xl" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs h-[320px]">
                        <Skeleton className="w-48 h-6 mb-4" />
                        <Skeleton className="w-full h-[220px] rounded-xl" />
                    </div>
                    <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs h-[320px]">
                        <Skeleton className="w-48 h-6 mb-4" />
                        <Skeleton className="w-full h-[220px] rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const starColors: Record<number, string> = {
        5: 'bg-emerald-500',
        4: 'bg-blue-500',
        3: 'bg-amber-400',
        2: 'bg-orange-400',
        1: 'bg-rose-500'
    };

    const totalRatings = data.statuses.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="flex flex-col gap-6 mb-6">
            {/* ROW 1: Trend and Star Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1.1 Line/Area Chart — Rating Trend */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[360px]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.trend_title')}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.trend_subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 w-full">
                        {data.trend.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                {t('charts.no_trend_data')}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.01}/>
                                        </linearGradient>
                                        <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
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
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid #F1F5F9',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                            padding: '10px 14px'
                                        }}
                                        labelStyle={{ fontWeight: 800, color: '#0F172A', fontSize: 11, marginBottom: 4 }}
                                        itemStyle={{ fontSize: 11, fontWeight: 700, padding: '2px 0' }}
                                    />
                                    <Area
                                        name={t('stats.total_ratings')}
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#14b8a6"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                    />
                                    <Area
                                        name={t('filter.status_approved')}
                                        type="monotone"
                                        dataKey="approved"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        strokeDasharray="4 2"
                                        fillOpacity={1}
                                        fill="url(#colorApproved)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="flex gap-4 mt-3 justify-center select-none">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                            {t('stats.total_ratings')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-dashed border-white"></span>
                            {t('filter.status_approved')}
                        </div>
                    </div>
                </div>

                {/* 1.2 Star Distribution horizontal list */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[360px]">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.stars_distribution')}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.stars_subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 font-extrabold text-[12px] px-3 py-1 rounded-xl">
                            <Star size={14} className="fill-yellow-500/20" />
                            {t('common:labels.average_score', { defaultValue: 'TB' })} {averageScore.toFixed(1)} ★
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-4">
                        {data.stars.map((item) => (
                            <div key={item.stars} className="flex items-center gap-3 w-full">
                                <span className="text-[12px] font-black text-slate-600 w-8 flex items-center justify-end gap-0.5">
                                    {item.stars} <span className="text-yellow-500">★</span>
                                </span>

                                <div className="h-6 bg-slate-50 border border-slate-100 rounded-lg flex-1 relative overflow-hidden">
                                    <div
                                        className={`h-full rounded-r-lg transition-all duration-1000 ${starColors[item.stars]}`}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>

                                <div className="text-[12px] font-black text-slate-700 w-16 text-right">
                                    {item.count.toLocaleString()}
                                    <span className="text-[10px] font-bold text-slate-400 ml-1">({item.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ROW 2: Moderation Status and Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2.1 Donut Chart — Approval Status */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row gap-6 items-center h-[300px]">
                    <div className="flex-1 flex flex-col self-stretch justify-between">
                        <div>
                            <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('filter.moderation_status')}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.status_subtitle')}</p>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            {data.statuses.map((item) => (
                                <div key={item.status} className="flex justify-between items-center text-xs font-bold text-slate-500 py-1 border-b border-slate-50/50">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                        <span>
                                            {item.status === 'approved' 
                                                ? t('filter.status_approved') 
                                                : item.status === 'pending' 
                                                    ? t('filter.status_pending') 
                                                    : t('filter.status_rejected')}
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

                    <div className="relative w-[180px] h-[180px] shrink-0 flex items-center justify-center">
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

                        {/* Absolute Overlay inside the donut center */}
                        <div className="absolute flex flex-col items-center justify-center select-none text-center">
                            <span className="text-2xl font-black text-slate-800 leading-none">{totalRatings.toLocaleString()}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('stats.ratings')}</span>
                        </div>
                    </div>
                </div>

                {/* 2.2 Grouped Bar Chart — Type Distribution (Location vs Tour) */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[300px]">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('charts.type_title')}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{t('charts.type_subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.types.map(item => ({
                                    ...item,
                                    displayName: item.type === 'location' ? t('filter.type_location') : t('filter.type_tour')
                                }))}
                                margin={{ top: 20, right: 10, left: -25, bottom: 5 }}
                            >
                                <CartesianGrid stroke="#F8FAFC" strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="displayName"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
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
                                    domain={[0, 5]}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#F59E0B', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(8px)',
                                        border: '1px solid #F1F5F9',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    }}
                                    itemStyle={{ fontSize: 11, fontWeight: 700 }}
                                />
                                <Bar
                                    yAxisId="left"
                                    name={t('charts.count_label')}
                                    dataKey="count"
                                    fill="#14b8a6"
                                    radius={[6, 6, 0, 0]}
                                    barSize={28}
                                />
                                <Bar
                                    yAxisId="right"
                                    name={t('charts.avg_label')}
                                    dataKey="average"
                                    fill="#F59E0B"
                                    radius={[6, 6, 0, 0]}
                                    barSize={28}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex gap-4 justify-center select-none">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                            {t('charts.count_label')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                            {t('charts.avg_label')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RatingsReportCharts;
