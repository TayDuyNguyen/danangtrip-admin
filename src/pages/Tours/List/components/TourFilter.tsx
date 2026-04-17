import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RotateCcw, X } from 'lucide-react';
import type { TourFilters, TourCategory } from '@/dataHelper/tour.dataHelper';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';

interface Props {
    filters: TourFilters;
    onFilterChange: (filters: TourFilters) => void;
    categories: TourCategory[];
}

const TourFilter = ({ filters, onFilterChange, categories }: Props) => {
    const { t } = useTranslation('tour');
    const [localSearch, setLocalSearch] = useState(filters.q);

    // Debounce search — 300ms as per spec
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.q) {
                onFilterChange({ ...filters, q: localSearch });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch, filters, onFilterChange]);

    const handleChange = (key: keyof TourFilters, value: string | number) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleReset = () => {
        setLocalSearch('');
        onFilterChange({
            q: '',
            tour_category_id: 'all',
            status: 'all',
            type: 'all',
            sort: 'created_at',
            order: 'desc'
        });
    };

    const activeFilters = [
        filters.tour_category_id !== 'all' && {
            key: 'tour_category_id',
            label: `${t('filters.category_label')}: ${categories.find(c => c.id.toString() === filters.tour_category_id.toString())?.name || filters.tour_category_id}`
        },
        filters.status !== 'all' && {
            key: 'status',
            label: `${t('filters.status_label')}: ${t(`status.${filters.status}`, filters.status)}`
        },
        filters.type !== 'all' && { key: 'type', label: `${t('filters.all_types')}: ${t(`filters.${filters.type}`)}` },
    ].filter(Boolean) as { key: keyof TourFilters; label: string }[];

    const hasActiveFilters = activeFilters.length > 0 || localSearch !== '';

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-[24px] mb-[24px]">
            <div className="flex flex-wrap gap-[12px] items-center">
                {/* Search input — flex-1 min-280px */}
                <div className="flex-1 min-w-[280px] relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] transition-all group-focus-within:text-[#0066CC]" size={18} />
                    <input
                        type="text"
                        placeholder={t('filters.search_placeholder')}
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className="w-full pl-12 pr-4 h-[48px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] focus:ring-0 focus:bg-white focus:border-[#0066CC] text-[14px] text-[#1E293B] font-medium outline-none transition-all placeholder:text-[#94A3B8]"
                    />
                </div>

                {/* Select Danh mục — 200px */}
                <CustomSelect
                    options={[
                        { value: 'all', label: t('filters.all_categories') },
                        ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    value={{ 
                        value: filters.tour_category_id, 
                        label: filters.tour_category_id === 'all' 
                            ? t('filters.all_categories') 
                            : categories.find(c => c.id === filters.tour_category_id)?.name || filters.tour_category_id 
                    } as Option}
                    onChange={(opt) => handleChange('tour_category_id', (opt as Option)?.value)}
                    className="w-[200px]"
                    isSearchable={true}
                />

                {/* Select Trạng thái — 160px */}
                <CustomSelect
                    options={[
                        { value: 'all', label: t('filters.all_status') },
                        { value: 'active', label: t('status.active') },
                        { value: 'inactive', label: t('status.inactive') },
                        { value: 'sold_out', label: t('status.sold_out') }
                    ]}
                    value={[
                        { value: 'all', label: t('filters.all_status') },
                        { value: 'active', label: t('status.active') },
                        { value: 'inactive', label: t('status.inactive') },
                        { value: 'sold_out', label: t('status.sold_out') }
                    ].find(opt => opt.value === filters.status)}
                    onChange={(opt) => handleChange('status', (opt as Option)?.value)}
                    className="w-[160px]"
                />

                {/* Select Loại — 160px */}
                <CustomSelect
                    options={[
                        { value: 'all', label: t('filters.all_types') },
                        { value: 'featured', label: t('filters.featured') },
                        { value: 'hot', label: t('filters.hot') },
                        { value: 'normal', label: t('filters.normal') }
                    ]}
                    value={[
                        { value: 'all', label: t('filters.all_types') },
                        { value: 'featured', label: t('filters.featured') },
                        { value: 'hot', label: t('filters.hot') },
                        { value: 'normal', label: t('filters.normal') }
                    ].find(opt => opt.value === filters.type)}
                    onChange={(opt) => handleChange('type', (opt as Option)?.value)}
                    className="w-[160px]"
                />

                {/* Button Lọc */}
                <button
                    className="h-[48px] px-6 bg-[#0066CC] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#0052A3] transition-all active:scale-95 shadow-sm"
                >
                    {t('filters.button_apply')}
                </button>

                {/* Button Đặt lại — Chỉ hiện khi có filter active */}
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 h-[48px] px-4 rounded-[10px] text-[14px] font-bold text-[#64748B] border border-[#E2E8F0] bg-white hover:text-[#EF4444] hover:border-[#EF4444] transition-all active:scale-95 shadow-sm"
                    >
                        <RotateCcw size={16} />
                        {t('filters.button_reset')}
                    </button>
                )}
            </div>

            {/* Row 2 — Active filter tags (chỉ hiện khi có filter) */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#F1F5F9] animate-in slide-in-from-top-2 duration-300">
                    <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mr-1">{t('filters.active_filtering')}</span>
                    {activeFilters.map((tag) => (
                        <div
                            key={tag.key}
                            className="inline-flex items-center gap-1.5 px-[10px] py-[4px] bg-[#EFF6FF] text-[#0066CC] border border-[#B3D9FF] rounded-full text-[12px] font-medium transition-all hover:bg-[#DEEBFF]"
                        >
                            {tag.label}
                            <button
                                onClick={() => handleChange(tag.key, 'all')}
                                className="hover:bg-[#0066CC]/10 rounded-full transition-colors p-0.5"
                                title={t('common:actions.remove')}
                            >
                                <X size={13} strokeWidth={3} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TourFilter;
