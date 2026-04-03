import React, { useState, useRef, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Calendar } from 'lucide-react';
import { ColorChartDashboard } from '@/constants/colors';
import type { DashboardChartsProps } from '@/dataHelper/dashboard.dataHelper';

// Filter out purple/violet colors to comply with the Purple Ban rule
const SafeColors = ColorChartDashboard.filter(color => color.toLowerCase() !== '#8b5cf6');

const DashboardCharts: React.FC<DashboardChartsProps> = ({
    ratings,
    categories,
    currentPeriod,
    onPeriodChange
}) => {
    const { t } = useTranslation('dashboard');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const periods = [
        { value: 7, label: t('charts.period_7') },
        { value: 30, label: t('charts.period_30') },
        { value: 90, label: t('charts.period_90') }
    ];

    const currentPeriodLabel = periods.find(p => p.value === currentPeriod)?.label || periods[0].label;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col md:flex-col-2 gap-8">
            {/* Bar Chart - Daily Ratings */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col h-[480px] transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/30">
                <div className="flex items-center justify-between mb-8 overflow-visible">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">{t('charts.daily_ratings')}</h3>
                        <p className="text-slate-500 text-sm font-bold tracking-tight">{t('charts.rating_overview')}</p>
                    </div>

                    {/* Premium Period Selector */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-white hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
                        >
                            <Calendar size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            <span>{currentPeriodLabel}</span>
                            <ChevronDown
                                size={14}
                                className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        {t('charts.select_period')}
                                    </span>
                                </div>
                                {periods.map((p) => (
                                    <button
                                        key={p.value}
                                        onClick={() => {
                                            onPeriodChange(p.value);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-all duration-200 hover:bg-blue-50 group ${currentPeriod === p.value ? 'bg-blue-50/50 text-blue-600' : 'text-slate-600 hover:text-blue-600'
                                            }`}
                                    >
                                        <span>{p.label}</span>
                                        {currentPeriod === p.value && (
                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full shadow-lg shadow-blue-600/50"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ratings} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }}
                                dy={10}
                                interval={ratings.length > 10 ? Math.floor(ratings.length / 7) : 0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc', radius: 12 }}
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                    padding: '12px 16px'
                                }}
                            />
                            <Bar
                                dataKey="ratingCount"
                                fill="url(#barGradient)"
                                radius={[8, 8, 4, 4]}
                                barSize={ratings.length > 7 ? undefined : 40}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Pie Chart - Category Breakdown */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col h-[480px] transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/30">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">{t('charts.category_breakdown')}</h3>
                    <p className="text-slate-500 text-sm font-bold tracking-tight">{t('charts.location_share')}</p>
                </div>

                {/* Chart + Legend: row on large, column on small */}
                <div className="flex-1 flex flex-col sm:flex-row items-center min-h-0 gap-4 py-4">
                    {/* Pie Chart */}
                    <div className="w-full sm:flex-1 h-48 sm:h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {categories.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={SafeColors[index % SafeColors.length]}
                                            className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        fontWeight: 'bold',
                                        padding: '12px 16px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Custom Legend */}
                    <div className="flex sm:flex-col flex-row flex-wrap justify-center sm:justify-start gap-3 sm:w-40 w-full">
                        {categories.map((item, index) => (
                            <div key={index} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors group/item">
                                <div
                                    className="w-2.5 h-2.5 shrink-0 rounded-full shadow-sm group-hover/item:scale-125 transition-transform"
                                    style={{ backgroundColor: SafeColors[index % SafeColors.length] }}
                                ></div>
                                <span className="text-[12px] font-bold text-slate-600 truncate">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(DashboardCharts);
