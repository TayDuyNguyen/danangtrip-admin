import React from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocationCategoriesQuery, useLocationFilterDistrictsQuery } from '@/hooks/useLocationQueries';
import type { LocationReportFilters } from '@/dataHelper/report.dataHelper';

type LocalFilters = Omit<LocationReportFilters, 'page' | 'per_page'>;

interface LocationReportFilterBarProps {
    filters: LocalFilters;
    onFilterChange: (updated: Partial<LocalFilters>) => void;
    onApply: () => void;
    onReset: () => void;
    isSubmitting?: boolean;
}

const LocationReportFilterBar: React.FC<LocationReportFilterBarProps> = ({
    filters,
    onFilterChange,
    onApply,
    onReset,
    isSubmitting = false,
}) => {
    const { t } = useTranslation(['location_report', 'common']);

    // Dropdown data from existing location query hooks (reuse cache)
    const { data: categories = [], isLoading: catsLoading } = useLocationCategoriesQuery();
    const { data: districts  = [], isLoading: distsLoading } = useLocationFilterDistrictsQuery();

    const applyQuickRange = (range: '7days' | '30days' | '3months' | 'thisyear') => {
        const today    = new Date();
        let fromDate   = new Date();

        if      (range === '7days')    { fromDate.setDate(today.getDate() - 7); }
        else if (range === '30days')   { fromDate.setDate(today.getDate() - 30); }
        else if (range === '3months')  { fromDate.setMonth(today.getMonth() - 3); }
        else if (range === 'thisyear') { fromDate = new Date(today.getFullYear(), 0, 1); }

        const fmt = (d: Date) => d.toISOString().split('T')[0];
        onFilterChange({ from: fmt(fromDate), to: fmt(today) });
    };

    const inputCls = `
        w-full px-3 py-2.5 text-sm font-bold text-slate-700 bg-white/70 border border-slate-100
        rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300
        transition-all duration-150 placeholder:text-slate-300
    `.replace(/\s+/g, ' ').trim();

    return (
        <div className="bg-white/85 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-xs mb-6 transition-all duration-300">
            <div className="flex flex-col gap-6">
                {/* Input Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Date From */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-teal-500" />
                            {t('location_report:filter.from_date')}
                        </label>
                        <input
                            id="location-filter-from"
                            type="date"
                            value={filters.from || ''}
                            onChange={e => onFilterChange({ from: e.target.value })}
                            className={inputCls}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Date To */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={13} className="text-teal-500" />
                            {t('location_report:filter.to_date')}
                        </label>
                        <input
                            id="location-filter-to"
                            type="date"
                            value={filters.to || ''}
                            onChange={e => onFilterChange({ to: e.target.value })}
                            className={inputCls}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t('location_report:filter.category')}
                        </label>
                        <select
                            id="location-filter-category"
                            value={String(filters.category_id ?? 'all')}
                            onChange={e => onFilterChange({ category_id: e.target.value })}
                            className={inputCls}
                            disabled={isSubmitting || catsLoading}
                        >
                            <option value="all">{t('location_report:filter.category_all')}</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* District */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t('location_report:filter.district')}
                        </label>
                        <select
                            id="location-filter-district"
                            value={filters.district || 'all'}
                            onChange={e => onFilterChange({ district: e.target.value })}
                            className={inputCls}
                            disabled={isSubmitting || distsLoading}
                        >
                            <option value="all">{t('location_report:filter.district_all')}</option>
                            {districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Bottom row: quick ranges + action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Quick range pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-black text-slate-400 uppercase">
                            {t('location_report:filter.quick_filters')}
                        </span>
                        {(['7days', '30days', '3months', 'thisyear'] as const).map(r => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => applyQuickRange(r)}
                                disabled={isSubmitting}
                                className="px-3 py-1 rounded-lg text-xs font-black bg-slate-50 border border-slate-100 text-slate-500 hover:bg-teal-50 hover:border-teal-100 hover:text-teal-600 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {t(`location_report:filter.range_${r}`)}
                            </button>
                        ))}
                    </div>

                    {/* Apply / Reset buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            id="location-filter-reset"
                            type="button"
                            onClick={onReset}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={13} />
                            {t('location_report:filter.btn_reset')}
                        </button>
                        <button
                            id="location-filter-apply"
                            type="button"
                            onClick={onApply}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black bg-teal-500 text-white hover:bg-teal-600 shadow-xs shadow-teal-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Filter size={13} />
                            {isSubmitting ? '...' : t('location_report:filter.btn_apply')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationReportFilterBar;
