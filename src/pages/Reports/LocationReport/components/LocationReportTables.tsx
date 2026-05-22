import React from 'react';
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
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-slate-50">
                <h3 className="text-sm font-black text-slate-700">{t('table.title')}</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{t('table.subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-3">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        id={`location-tab-${tab.key}`}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                            activeTab === tab.key
                                ? 'bg-teal-500/10 border-teal-500/20 text-teal-600'
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        {t(tab.labelKey)}
                    </button>
                ))}
            </div>

            {/* Table content */}
            <div className="overflow-x-auto mt-3">
                {isLoading ? (
                    <div className="p-5 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                        <p className="text-sm font-black text-slate-500 mt-3">{t('table.no_data_title')}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1.5">{t('table.no_data_desc')}</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-5 py-3 text-left text-[11px] font-black text-slate-400 uppercase">{t('table.header_rank')}</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black text-slate-400 uppercase">{t('table.header_name')}</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black text-slate-400 uppercase hidden lg:table-cell">{t('table.header_category')}</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black text-slate-400 uppercase hidden md:table-cell">{t('table.header_district')}</th>
                                <th className="px-5 py-3 text-right text-[11px] font-black text-slate-400 uppercase">
                                    {activeTab === 'views'     ? t('table.header_views')     : ''}
                                    {activeTab === 'favorites' ? t('table.header_favorites') : ''}
                                    {activeTab === 'ratings'   ? t('table.header_rating')    : ''}
                                </th>
                                <th className="px-5 py-3 text-center text-[11px] font-black text-slate-400 uppercase hidden md:table-cell">{t('table.header_status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors duration-100 cursor-pointer"
                                >
                                    <td className="px-5 py-3 text-xs font-black text-slate-300">{((pagination?.currentPage ?? 1) - 1) * (pagination?.perPage ?? 10) + idx + 1}</td>
                                    <td className="px-5 py-3">
                                        <p className="text-sm font-black text-slate-700 line-clamp-1">{item.name}</p>
                                    </td>
                                    <td className="px-5 py-3 text-xs font-bold text-slate-500 hidden lg:table-cell">{item.categoryName}</td>
                                    <td className="px-5 py-3 text-xs font-bold text-slate-500 hidden md:table-cell">{item.district}</td>
                                    <td className="px-5 py-3 text-right text-sm font-black text-slate-700">
                                        {activeTab === 'views'     ? item.views.toLocaleString('vi-VN')     : ''}
                                        {activeTab === 'favorites' ? item.favorites.toLocaleString('vi-VN') : ''}
                                        {activeTab === 'ratings'   ? item.rating.toFixed(1)                 : ''}
                                    </td>
                                    <td className="px-5 py-3 text-center hidden md:table-cell">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black ${
                                            item.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                                        }`}>
                                            {item.status === 'active' ? t('table.status_active') : t('table.status_inactive')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {!isLoading && pagination && pagination.lastPage > 1 && (
                <div className="px-5 py-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">
                        {t('table.pagination_showing', {
                            from:  ((pagination.currentPage - 1) * pagination.perPage) + 1,
                            to:    Math.min(pagination.currentPage * pagination.perPage, pagination.total),
                            total: pagination.total,
                        })}
                    </p>
                    <div className="flex gap-1.5">
                        <button
                            type="button"
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-black border border-slate-100 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {t('table.btn_prev')}
                        </button>
                        <button
                            type="button"
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.lastPage}
                            className="px-3 py-1.5 rounded-lg text-xs font-black border border-slate-100 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {t('table.btn_next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationReportTables;
