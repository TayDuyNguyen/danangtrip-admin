import React, { useMemo } from 'react';
import { Calendar, Filter, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocationCategoriesQuery, useLocationFilterDistrictsQuery } from '@/hooks/useLocationQueries';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
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
    const categoryOptions: Option[] = useMemo(
        () => [
            { value: 'all', label: t('location_report:filter.category_all') },
            ...categories.map((category) => ({ value: category.id, label: category.name })),
        ],
        [categories, t]
    );
    const districtOptions: Option[] = useMemo(
        () => [
            { value: 'all', label: t('location_report:filter.district_all') },
            ...districts.map((district) => ({ value: district, label: district })),
        ],
        [districts, t]
    );
    const selectedCategory = categoryOptions.find((option) => String(option.value) === String(filters.category_id ?? 'all')) ?? categoryOptions[0];
    const selectedDistrict = districtOptions.find((option) => option.value === (filters.district || 'all')) ?? districtOptions[0];

    const getQuickRangeDates = (range: '7days' | '30days' | '3months' | 'thisyear') => {
        const today    = new Date();
        let fromDate   = new Date();

        if      (range === '7days')    { fromDate.setDate(today.getDate() - 7); }
        else if (range === '30days')   { fromDate.setDate(today.getDate() - 30); }
        else if (range === '3months')  { fromDate.setMonth(today.getMonth() - 3); }
        else if (range === 'thisyear') { fromDate = new Date(today.getFullYear(), 0, 1); }

        const fmt = (d: Date) => d.toISOString().split('T')[0];
        return { from: fmt(fromDate), to: fmt(today) };
    };

    const applyQuickRange = (range: '7days' | '30days' | '3months' | 'thisyear') => {
        onFilterChange(getQuickRangeDates(range));
    };

    const isQuickRangeActive = (range: '7days' | '30days' | '3months' | 'thisyear') => {
        const rangeDates = getQuickRangeDates(range);
        return filters.from === rangeDates.from && filters.to === rangeDates.to;
    };

    const quickRangeButtonClass = (range: '7days' | '30days' | '3months' | 'thisyear') =>
        `px-3.5 py-1.5 rounded-lg text-xs font-black border transition-all duration-150 cursor-pointer disabled:opacity-50 ${
            isQuickRangeActive(range)
                ? 'bg-[#14b8a6] border-[#14b8a6] text-white shadow-xs'
                : 'bg-[#F8FAFC] border-[#F1F5F9] hover:bg-[#14b8a6]/5 hover:border-[#14b8a6]/30 text-[#0F172A]/70 hover:text-[#14b8a6]'
        }`;

    const inputCls = `
        w-full px-3 py-2.5 text-sm font-bold text-[#0F172A] bg-[#F8FAFC] border border-[#F1F5F9]
        rounded-xl focus:outline-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20 focus:border-[#14b8a6]
        transition-all duration-150 placeholder:text-slate-300
    `.replace(/\s+/g, ' ').trim();

    return (
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/20 via-slate-200/25 to-slate-100/10 shadow-xs hover:shadow-md hover:from-[#14b8a6]/30 transition-all duration-300 mb-6">
            <div className="bg-white rounded-[23px] p-6">
                <div className="flex flex-col gap-6">
                    {/* Input Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Date From */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#14b8a6]" />
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
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#14b8a6]" />
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
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('location_report:filter.category')}
                            </label>
                            <CustomSelect
                                inputId="location-filter-category"
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={(option) => onFilterChange({ category_id: (option as Option).value })}
                                isDisabled={isSubmitting || catsLoading}
                                size="sm"
                            />
                        </div>

                        {/* District */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-black text-[#94A3B8] uppercase tracking-widest">
                                {t('location_report:filter.district')}
                            </label>
                            <CustomSelect
                                inputId="location-filter-district"
                                options={districtOptions}
                                value={selectedDistrict}
                                onChange={(option) => onFilterChange({ district: String((option as Option).value) })}
                                isDisabled={isSubmitting || distsLoading}
                                size="sm"
                            />
                        </div>
                    </div>

                    {/* Bottom row: quick ranges + action buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F1F5F9] pt-4">
                        {/* Quick range pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black text-[#94A3B8] uppercase tracking-wider mr-1">
                                {t('location_report:filter.quick_filters')}
                            </span>
                            {(['7days', '30days', '3months', 'thisyear'] as const).map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => applyQuickRange(r)}
                                    disabled={isSubmitting}
                                    className={quickRangeButtonClass(r)}
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
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-[#E2E8F0] hover:border-[#14b8a6] hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] text-[#0F172A]/80 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <RefreshCw size={13} />
                                {t('location_report:filter.btn_reset')}
                            </button>
                            <button
                                id="location-filter-apply"
                                type="button"
                                onClick={onApply}
                                disabled={isSubmitting}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#14b8a6] hover:bg-[#0f766e] text-white shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                            >
                                <Filter size={13} />
                                {isSubmitting ? '...' : t('location_report:filter.btn_apply')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationReportFilterBar;
