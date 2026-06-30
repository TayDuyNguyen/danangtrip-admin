import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import type { UsersRoleDistributionPoint } from '@/dataHelper/report.dataHelper';

interface UsersRoleChartProps {
    data?: UsersRoleDistributionPoint[];
    isLoading?: boolean;
}

const UsersRoleChart: React.FC<UsersRoleChartProps> = ({ data, isLoading = false }) => {
    const { t } = useTranslation('users_report');

    if (isLoading || !data) {
        return (
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs mb-6 animate-pulse">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 h-[320px]">
                    <Skeleton className="w-48 h-6 mb-4" />
                    <Skeleton className="w-full h-[220px] rounded-xl" />
                </div>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div
            className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 mb-6"
            data-testid="users-role-chart"
        >
            <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-6 flex flex-col lg:flex-row gap-6 items-center min-h-[320px]">
                <div className="flex-1 self-stretch">
                    <h3 className="text-[16px] font-black text-slate-800 leading-tight">{t('charts.roles_title')}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {t('charts.roles_subtitle')}
                    </p>
                    <div className="flex flex-col gap-2 mt-4">
                        {data.map((item) => (
                            <div key={item.role} className="flex justify-between items-center text-xs font-bold text-slate-500 py-1 border-b border-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span>{t(item.labelKey)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-800 font-extrabold">{item.count.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 ml-1">({item.percentage}%)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative w-[200px] h-[200px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="count">
                                {data.map((entry) => (
                                    <Cell key={entry.role} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: unknown, _name, props) => {
                                    const payload = props?.payload as UsersRoleDistributionPoint | undefined;
                                    return [`${Number(value).toLocaleString()} (${payload?.percentage ?? 0}%)`, t(payload?.labelKey ?? 'filter.role_user')];
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-black text-slate-800">{total.toLocaleString()}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersRoleChart;
