import { useState, useEffect, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RotateCcw, X, CalendarCheck } from 'lucide-react';
import type { PromotionFilters, PromotionStatus } from '@/types/promotion.types';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import { TextInput } from '@/components/ui/TextInput';

interface Props {
    filters: PromotionFilters;
    onFilterChange: (filters: PromotionFilters) => void;
}

const PromotionFilter = ({ filters, onFilterChange }: Props) => {
    const { t } = useTranslation('promotions');
    const searchId = useId();
    const [localSearch, setLocalSearch] = useState(filters.search || '');

    // Debounce search - 300ms
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== (filters.search || '')) {
                onFilterChange({ ...filters, search: localSearch });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch, filters, onFilterChange]);

    const handleChange = <K extends keyof PromotionFilters>(key: K, value: PromotionFilters[K]) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleReset = () => {
        setLocalSearch('');
        onFilterChange({
            search: '',
            status: '',
            valid_now: false,
            sort_by: 'created_at',
            sort_dir: 'desc',
        });
    };

    const activeFilters = [
        filters.status && {
            key: 'status',
            label: `${t('fields.status')}: ${t(`status.${filters.status}`)}`
        },
        filters.valid_now && {
            key: 'valid_now',
            label: t('labels.filter_valid_now')
        }
    ].filter(Boolean) as { key: keyof PromotionFilters; label: string }[];

    const hasActiveFilters = activeFilters.length > 0 || localSearch !== '';

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-[24px] mb-[24px]">
            <div className="flex flex-wrap gap-[12px] items-center">
                {/* Search input */}
                <div className="flex-1 min-w-[280px]">
                    <label htmlFor={searchId} className="sr-only">
                        {t('actions.search_placeholder')}
                    </label>
                    <TextInput
                        id={searchId}
                        type="search"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder={t('actions.search_placeholder')}
                        leftIcon={<Search className="text-text-secondary transition-colors duration-150 group-focus-within:text-[#14b8a6]" size={18} />}
                        containerClassName="group"
                        className="h-12 rounded-2xl border-[#E2E8F0] bg-slate-50 py-0 text-[14px] font-medium text-[#1E293B] placeholder:text-text-secondary focus:border-[#14b8a6] focus:bg-white"
                    />
                </div>

                {/* Status select */}
                <CustomSelect
                    options={[
                        { value: '', label: t('status.all') },
                        { value: 'active', label: t('status.active') },
                        { value: 'inactive', label: t('status.inactive') },
                        { value: 'expired', label: t('status.expired') },
                    ]}
                    value={[
                        { value: '', label: t('status.all') },
                        { value: 'active', label: t('status.active') },
                        { value: 'inactive', label: t('status.inactive') },
                        { value: 'expired', label: t('status.expired') },
                    ].find(opt => opt.value === (filters.status || ''))}
                    onChange={(opt) => handleChange('status', (opt as Option)?.value as PromotionStatus | '')}
                    className="w-[200px]"
                />

                {/* Valid now checkbox/toggle */}
                <button
                    onClick={() => handleChange('valid_now', !filters.valid_now)}
                    className={`flex items-center gap-2 h-[48px] px-4 rounded-xl border text-[14px] font-bold transition-all active:scale-95 shadow-sm ${
                        filters.valid_now 
                            ? 'bg-[#dff7f4] border-[#14b8a6] text-[#0f766e]' 
                            : 'bg-white border-[#E2E8F0] text-slate-500 hover:text-slate-900'
                    }`}
                >
                    <CalendarCheck size={18} />
                    {t('labels.filter_valid_now')}
                </button>

                {/* Reset button */}
                {hasActiveFilters && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 h-[48px] px-4 rounded-xl text-[14px] font-bold text-[#64748B] border border-[#E2E8F0] bg-white hover:text-[#EF4444] hover:border-[#EF4444] transition-all active:scale-95 shadow-sm"
                    >
                        <RotateCcw size={16} />
                        {t('actions.cancel')}
                    </button>
                )}
            </div>

            {/* Active filter tags */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-150">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Đang lọc theo:</span>
                    {activeFilters.map((tag) => (
                        <div
                            key={tag.key}
                            className="inline-flex items-center gap-1.5 px-[10px] py-[4px] bg-[#dff7f4] text-[#0f766e] border border-[#ccfbf1] rounded-full text-[12px] font-medium transition-all hover:bg-[#ccfbf1]"
                        >
                            {tag.label}
                            <button
                                onClick={() => handleChange(tag.key, tag.key === 'valid_now' ? false : '')}
                                className="hover:bg-[#14b8a6]/10 rounded-full transition-colors p-0.5"
                                title="Xóa lọc"
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

export default PromotionFilter;
