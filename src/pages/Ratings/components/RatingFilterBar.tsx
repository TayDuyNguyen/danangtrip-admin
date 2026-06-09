import { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from 'react-i18next';
import type { RatingsListFilters } from '@/dataHelper/rating.dataHelper';
import { TextInput } from '@/components/ui/TextInput';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';

interface RatingFilterBarProps {
    filters: RatingsListFilters;
    onFilterChange: (newFilters: RatingsListFilters) => void;
    onReset: () => void;
    onExport: () => void;
    isExporting?: boolean;
}

const RatingFilterBar: React.FC<RatingFilterBarProps> = ({ 
    filters, 
    onFilterChange, 
    onReset,
}) => {
    const { t } = useTranslation(['ratings', 'common']);
    
    // Local search state to allow debouncing
    const [prevSearch, setPrevSearch] = useState(filters.search || '');
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const debouncedSearch = useDebounce(searchValue, 300);

    // Sync local search state with parent filters during render (e.g., when reset is clicked)
    if ((filters.search || '') !== prevSearch) {
        setPrevSearch(filters.search || '');
        setSearchValue(filters.search || '');
    }

    // Handle debounced search change
    useEffect(() => {
        if (debouncedSearch !== (filters.search || '')) {
            onFilterChange({ search: debouncedSearch, page: 1 });
        }
    }, [debouncedSearch, filters.search, onFilterChange]);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const handleSelectChange = (field: keyof RatingsListFilters, val?: string) => {
        const normalized = !val || val === 'all' ? 'all' : val;
        if (field === 'score') {
            const score = normalized === 'all' ? undefined : Number(normalized);
            onFilterChange({ [field]: score, page: 1 });
        } else {
            const finalVal = normalized === 'all' ? undefined : normalized;
            onFilterChange({ [field]: finalVal, page: 1 });
        }
    };

    const typeOptions = [
        { value: 'all', label: t('filter.type_all', 'Tất cả dịch vụ') },
        { value: 'location', label: t('filter.type_location', 'Địa điểm') },
        { value: 'tour', label: t('filter.type_tour', 'Tour du lịch') },
    ];

    const managementStatusOptions = [
        { value: 'all', label: t('filter.status_all_management', 'Tất cả trạng thái') },
        { value: 'new', label: t('filter.read_status_new', 'Mới') },
        { value: 'viewed', label: t('filter.read_status_viewed', 'Đã xem') },
        { value: 'hidden', label: t('filter.status_hidden', 'Đã ẩn') },
    ];

    const scoreOptions = [
        { value: 'all', label: t('filter.score_all', 'Tất cả điểm sao') },
        { value: '5', label: '★★★★★ 5 sao' },
        { value: '4', label: '★★★★☆ 4 sao' },
        { value: '3', label: '★★★☆☆ 3 sao' },
        { value: '2', label: '★★☆☆☆ 2 sao' },
        { value: '1', label: '★☆☆☆☆ 1 sao' },
    ];

    const currentType = typeOptions.find(opt => opt.value === (filters.type || 'all')) || typeOptions[0];
    const currentScore = scoreOptions.find(opt => opt.value === String(filters.score || 'all')) || scoreOptions[0];
    const managementStatus = filters.status === 'rejected'
        ? 'hidden'
        : filters.is_new === true
            ? 'new'
            : filters.is_new === false
                ? 'viewed'
                : 'all';
    const currentManagementStatus = managementStatusOptions.find((option) => option.value === managementStatus)
        || managementStatusOptions[0];

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Box (col-span-2) */}
                <TextInput
                    value={searchValue}
                    onChange={handleSearchInputChange}
                    placeholder={t('filter.search_placeholder', 'Tìm theo tên khách hàng, nội dung nhận xét...')}
                    leftIcon={<Search size={18} />}
                    containerClassName="col-span-1 lg:col-span-2"
                    className="w-full bg-slate-50 border-slate-100 rounded-xl py-2.5 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#14B8A6] focus:bg-white transition-all duration-200"
                />

                {/* Service Type Dropdown */}
                <CustomSelect
                    options={typeOptions}
                    value={currentType}
                    onChange={(opt) => handleSelectChange('type', (opt as Option | null)?.value?.toString())}
                    isClearable={false}
                    menuPortalTarget={document.body}
                    size="md"
                />

                {/* Management status */}
                <CustomSelect
                    options={managementStatusOptions}
                    value={currentManagementStatus}
                    onChange={(opt) => {
                        const value = (opt as Option | null)?.value?.toString();
                        onFilterChange({
                            status: value === 'hidden' ? 'rejected' : 'all',
                            is_new: value === 'new' ? true : value === 'viewed' ? false : undefined,
                            page: 1,
                        });
                    }}
                    isClearable={false}
                    menuPortalTarget={document.body}
                    size="md"
                />

                {/* Score Dropdown */}
                <CustomSelect
                    options={scoreOptions}
                    value={currentScore}
                    onChange={(opt) => handleSelectChange('score', (opt as Option | null)?.value?.toString())}
                    isClearable={false}
                    menuPortalTarget={document.body}
                    size="md"
                />
            </div>

            {/* Sub Filter Row: Reset Action */}
            <div className="border-t border-slate-50 pt-4 flex flex-col sm:flex-row sm:items-center justify-end gap-4">
                {/* Reset Filters */}
                <div>
                    {(searchValue || filters.type !== 'all' || filters.status !== 'all' || filters.is_new !== undefined || filters.score !== undefined) && (
                        <button
                            onClick={onReset}
                            className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-900 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-500 transition-all duration-200 cursor-pointer"
                        >
                            <RotateCcw size={15} />
                            <span>{t('actions.reset', 'Làm mới')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingFilterBar;
