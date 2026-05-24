import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import type { LocationReportViewModel } from '@/dataHelper/report.dataHelper';

interface LocationReportChartsProps {
    data: LocationReportViewModel['charts'] | undefined;
    isLoading: boolean;
}

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#6366f1', '#64748b'];

const LocationReportCharts: React.FC<LocationReportChartsProps> = ({ data, isLoading }) => {
    const { t } = useTranslation('location_report');

    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[0, 1].map(i => (
                    <div key={i} className="p-[1px] rounded-3xl bg-gradient-to-br from-slate-200/20 via-slate-100/10 to-transparent">
                        <div className="bg-white rounded-[23px] p-5 h-[360px] flex flex-col">
                            <Skeleton className="w-48 h-5 mb-2" />
                            <Skeleton className="w-32 h-3 mb-6" />
                            <Skeleton className="flex-1 w-full rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const categories = data.categories || [];
    const districts = data.districts || [];

    const totalLocations = categories.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Category Distribution Donut Chart */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
                <div className="bg-white rounded-[23px] p-5 flex flex-col justify-between h-[360px]">
                    <div>
                        <h3 className="text-sm font-black text-[#0F172A] leading-tight">{t('charts.category_title')}</h3>
                        <p className="text-xs font-bold text-[#94A3B8] mt-0.5">{t('charts.category_subtitle')}</p>
                    </div>

                    <div className="flex-1 min-h-0 w-full flex flex-col md:flex-row items-center gap-6 py-2">
                        {categories.length === 0 ? (
                            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-[#94A3B8]">
                                {t('charts.no_data')}
                            </div>
                        ) : (
                            <>
                                {/* Legend Details */}
                                <div className="flex-1 flex flex-col justify-center gap-1.5 self-stretch overflow-y-auto pr-1 max-h-[220px] md:max-h-full">
                                    {categories.slice(0, 5).map((item, index) => {
                                        const percentage = totalLocations > 0 ? Math.round((item.value / totalLocations) * 100) : 0;
                                        const color = COLORS[index % COLORS.length];
                                        return (
                                            <div key={item.name} className="flex justify-between items-center text-xs font-bold text-[#94A3B8] py-1 border-b border-[#F1F5F9]/55">
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                                                    <span className="truncate max-w-[120px] md:max-w-[150px] text-slate-600">{item.name}</span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="text-[#0F172A] font-extrabold">{item.value}</span>
                                                    <span className="text-[10px] text-[#94A3B8] ml-1">({percentage}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {categories.length > 5 && (
                                        <div className="text-[10px] font-bold text-[#94A3B8] text-center mt-1">
                                            + {categories.length - 5} {t('charts.others_label')}
                                        </div>
                                    )}
                                </div>

                                {/* Donut Container */}
                                <div className="relative w-[180px] h-[180px] shrink-0 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categories}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={75}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {categories.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: unknown) => [String(value), t('charts.count_label')]}
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(8px)',
                                                    border: '1px solid #F1F5F9',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 12px -1px rgba(0,0,0,0.05)',
                                                }}
                                                itemStyle={{ fontSize: 11, fontWeight: 700 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Centered Total Overlay */}
                                    <div className="absolute flex flex-col items-center justify-center select-none text-center px-4 w-full">
                                        <span className="text-xl font-black text-[#0F172A] leading-none truncate max-w-full">
                                            {totalLocations}
                                        </span>
                                        <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">LOCATIONS</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* District Distribution Bar Chart */}
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
                <div className="bg-white rounded-[23px] p-5 flex flex-col justify-between h-[360px]">
                    <div>
                        <h3 className="text-sm font-black text-[#0F172A] leading-tight">{t('charts.district_title')}</h3>
                        <p className="text-xs font-bold text-[#94A3B8] mt-0.5">{t('charts.district_subtitle')}</p>
                    </div>

                    <div className="flex-1 min-h-0 w-full mt-4">
                        {districts.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs font-bold text-[#94A3B8]">
                                {t('charts.no_data')}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={districts.slice(0, 7)}
                                    margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                                >
                                    <CartesianGrid stroke="#F8FAFC" strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        formatter={(value: unknown) => [String(value), t('charts.count_label')]}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid #F1F5F9',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px -1px rgba(0,0,0,0.05)',
                                            padding: '10px 14px'
                                        }}
                                        labelStyle={{ fontWeight: 800, color: '#0F172A', fontSize: 11, marginBottom: 4 }}
                                        itemStyle={{ fontSize: 11, fontWeight: 700 }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#14b8a6"
                                        radius={[6, 6, 0, 0]}
                                        barSize={24}
                                    >
                                        {districts.slice(0, 7).map((_, index) => {
                                            const colors = ['#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#2dd4bf', '#5eead4'];
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
    );
};

export default LocationReportCharts;
