import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import type { UsersReportMonthViewModel } from '@/dataHelper/report.dataHelper';

interface UsersReportChartsProps {
    data?: UsersReportMonthViewModel[];
    isLoading?: boolean;
}

const UsersReportCharts: React.FC<UsersReportChartsProps> = ({
    data,
    isLoading = false
}) => {
    const { t } = useTranslation('users_report');

    if (isLoading || !data) {
        return (
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs h-[380px] mb-6">
                <Skeleton className="w-48 h-6 mb-4" />
                <Skeleton className="w-full h-[280px] rounded-xl" />
            </div>
        );
    }

    const hasData = data.some(point => point.count > 0);

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-[400px] mb-6 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[16px] font-black text-slate-800 leading-tight">
                        {t('charts.growth_title')}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {t('charts.growth_subtitle')}
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full">
                {!hasData ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                        <span className="text-xs font-bold">{t('charts.no_data')}</span>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.01}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#F8FAFC" strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickFormatter={(val) => t(`month_short.${val}`)}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
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
                                labelFormatter={(labelValue) => t(`month_long.${labelValue}`)}
                                formatter={(value: unknown) => {
                                    const rawVal = (typeof value === 'number' || typeof value === 'string') ? value : 0;
                                    return [Number(rawVal).toLocaleString() + ` ${t('units.users')}`, t('charts.users_label')];
                                }}
                            />
                            <Area
                                name={t('charts.users_label')}
                                type="monotone"
                                dataKey="count"
                                stroke="#14b8a6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorUsers)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="flex gap-4 mt-4 justify-center select-none">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]"></span>
                    {t('charts.legend_users')}
                </div>
            </div>
        </div>
    );
};

export default UsersReportCharts;
