import React from 'react';
import { RefreshCw, Users } from 'lucide-react';
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
    const items = data ?? [];

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0 mb-6">
            {/* Toolbar */}
            <div className="px-[24px] py-[16px] border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-[#F8FAFC]/50 shrink-0">
                <div>
                    <h3 className="text-[15px] font-black text-slate-800 leading-tight">{t('table.title')}</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">{t('table.subtitle')}</p>
                </div>
                {items.length > 0 && (
                    <span className="text-xs font-black text-slate-600 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                        {t('table.total_rows', { count: items.length })}
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-[#F8FAFC]/60 border-b border-[#E2E8F0]">
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[150px]">{t('table.header_month')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t('table.header_new_users')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">{t('table.header_cumulative')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={3} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RefreshCw size={24} className="animate-spin text-[#14b8a6]" />
                                        <span className="text-sm font-bold text-slate-400">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <Users size={32} className="text-slate-200" />
                                        <p className="text-sm font-black text-slate-500">{t('table.no_data_title')}</p>
                                        <p className="text-xs font-bold text-slate-400 max-w-sm">{t('table.no_data_desc')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.month} className="hover:bg-[#14b8a6]/3 hover:text-slate-900 transition-colors duration-200 group/row">
                                    <td className="px-6 py-4">
                                        <span className="text-[13px] font-black text-slate-800">{t(`month_long.${item.month}`)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[13px] font-extrabold px-3 py-1 rounded-full ${
                                            item.count > 0 ? 'bg-[#14b8a6]/10 text-[#0f766e]' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            {item.count.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[13px] font-extrabold text-slate-700">{item.cumulativeCount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersReportTable;
