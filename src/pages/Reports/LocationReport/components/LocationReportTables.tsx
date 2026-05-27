import React from 'react';
import { RefreshCw, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LocationReportViewModel } from '@/dataHelper/report.dataHelper';

type TabType = 'views' | 'favorites' | 'ratings';

interface LocationReportTablesProps {
    data: LocationReportViewModel['table'] | undefined;
    isLoading: boolean;
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    onPageChange: (page: number) => void;
}

const tabs: { key: TabType; labelKey: string }[] = [
    { key: 'views',     labelKey: 'table.tab_views'     },
    { key: 'favorites', labelKey: 'table.tab_favorites' },
    { key: 'ratings',   labelKey: 'table.tab_ratings'   },
];

const LocationReportTables: React.FC<LocationReportTablesProps> = ({
    data,
    isLoading,
    activeTab,
    onTabChange,
    onPageChange,
}) => {
    const { t } = useTranslation('location_report');

    const items = data?.items ?? [];
    const pagination = data?.pagination;

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0">
            {/* Toolbar */}
            <div className="px-[24px] py-[16px] border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-[#F8FAFC]/50 shrink-0">
                <div>
                    <h3 className="text-[15px] font-black text-[#0F172A] leading-tight">{t('table.title')}</h3>
                    <p className="text-[11px] font-bold text-[#94A3B8] mt-1">{t('table.subtitle')}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 px-6 pt-4 pb-2 border-b border-[#E2E8F0] bg-[#F8FAFC]/30 shrink-0">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        id={`location-tab-${tab.key}`}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            activeTab === tab.key
                                ? 'bg-[#14b8a6]/10 border-[#14b8a6]/20 text-[#14b8a6]'
                                : 'bg-white border-[#E2E8F0] text-[#0F172A]/70 hover:bg-slate-50'
                        }`}
                    >
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-left text-sm">
                    <thead>
                        <tr className="bg-[#F8FAFC]/60 border-b border-[#E2E8F0]">
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[80px]">{t('table.header_rank')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{t('table.header_name')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest hidden lg:table-cell">{t('table.header_category')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest hidden md:table-cell">{t('table.header_district')}</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-right">
                                {activeTab === 'views'     ? t('table.header_views')     : ''}
                                {activeTab === 'favorites' ? t('table.header_favorites') : ''}
                                {activeTab === 'ratings'   ? t('table.header_rating')    : ''}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-center hidden md:table-cell w-[120px]">{t('table.header_status')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <RefreshCw size={24} className="animate-spin text-[#14b8a6]" />
                                        <span className="text-sm font-bold text-slate-400">Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <MapPin size={32} className="text-slate-200" />
                                        <p className="text-sm font-black text-slate-500">{t('table.no_data_title')}</p>
                                        <p className="text-xs font-bold text-slate-400 max-w-sm">{t('table.no_data_desc')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            items.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-[#14b8a6]/5 transition-colors group/row">
                                    <td className="px-6 py-4 text-xs font-black text-[#94A3B8]">
                                        {((pagination?.currentPage ?? 1) - 1) * (pagination?.perPage ?? 10) + idx + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-[#0F172A] line-clamp-1">{item.name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-[#94A3B8] hidden lg:table-cell">{item.categoryName}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-[#94A3B8] hidden md:table-cell">{item.district}</td>
                                    <td className="px-6 py-4 text-right text-sm font-extrabold text-[#0F172A]">
                                        {activeTab === 'views'     ? item.views.toLocaleString('vi-VN')     : ''}
                                        {activeTab === 'favorites' ? item.favorites.toLocaleString('vi-VN') : ''}
                                        {activeTab === 'ratings'   ? item.rating.toFixed(1)                 : ''}
                                    </td>
                                    <td className="px-6 py-4 text-center hidden md:table-cell">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                            item.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                                        }`}>
                                            {item.status === 'active' ? t('table.status_active') : t('table.status_inactive')}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!isLoading && pagination && pagination.lastPage > 1 && (
                <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F8FAFC]/50 shrink-0">
                    <span className="text-[12px] font-bold text-[#94A3B8]">
                        {t('table.pagination_showing', {
                            from: ((pagination.currentPage - 1) * pagination.perPage) + 1,
                            to: Math.min(pagination.currentPage * pagination.perPage, pagination.total),
                            total: pagination.total,
                        })}
                    </span>
                    <div className="flex gap-1.5 items-center">
                        <button type="button" onClick={() => onPageChange(pagination.currentPage - 1)} disabled={pagination.currentPage <= 1}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 cursor-pointer select-none">
                            {t('table.btn_prev')}
                        </button>
                        <button type="button" onClick={() => onPageChange(pagination.currentPage + 1)} disabled={pagination.currentPage >= pagination.lastPage}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 cursor-pointer select-none">
                            {t('table.btn_next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationReportTables;
