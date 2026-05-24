import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { useTranslation } from 'react-i18next';
import type { UsersReportMonthViewModel } from '@/dataHelper/report.dataHelper';

interface UsersReportTableProps {
    data?: UsersReportMonthViewModel[];
    isLoading?: boolean;
}

const UsersReportTable: React.FC<UsersReportTableProps> = ({
    data,
    isLoading = false,
}) => {
    const { t } = useTranslation('users_report');

    if (isLoading) {
        return (
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs mb-6">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100/50 flex justify-between items-center bg-white/40">
                        <Skeleton className="w-40 h-6" />
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {[...Array(5)].map((_, idx) => (
                                <Skeleton key={idx} className="w-full h-12 rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs mb-6">
                <div className="bg-white/95 backdrop-blur-md rounded-[23px] p-8">
                    <EmptyState
                        title={t('table.no_data_title')}
                        description={t('table.no_data_desc')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300">
            <div className="bg-white/95 backdrop-blur-md rounded-[23px] overflow-hidden flex flex-col justify-between">
                {/* Table Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-white/40">
                    <div>
                        <h3 className="text-[15px] font-black text-slate-800 leading-tight">
                            {t('table.title')}
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">
                            {t('table.subtitle')}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {t('table.total_rows', { count: data.length })}
                        </span>
                    </div>
                </div>

                {/* Table wrapper */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px]">
                                    {t('table.header_month')}
                                </th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                    {t('table.header_new_users')}
                                </th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                    {t('table.header_cumulative')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item) => (
                                <tr key={item.month} className="hover:bg-[#14b8a6]/3 hover:text-slate-900 transition-colors duration-200 group/row">
                                    {/* 1. Month Label */}
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-black text-slate-800">
                                            {t(`month_long.${item.month}`)}
                                        </span>
                                    </td>

                                    {/* 2. New User Signup Count */}
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[13px] font-extrabold px-3 py-1 rounded-full ${
                                            item.count > 0 
                                                ? 'bg-[#14b8a6]/10 text-[#0f766e]' 
                                                : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            {item.count.toLocaleString()}
                                        </span>
                                    </td>

                                    {/* 3. Cumulative Growth total */}
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[13px] font-extrabold text-slate-700">
                                            {item.cumulativeCount.toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersReportTable;
