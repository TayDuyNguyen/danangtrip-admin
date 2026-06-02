import { useTranslation } from 'react-i18next';
import { Search, Globe, Activity } from 'lucide-react';
import type { LandingPageType, LandingPageStatus } from '@/types/landingPage.types';
import { TextInput } from '@/components/ui/TextInput';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';

interface LandingPageFilterProps {
    search: string;
    onSearchChange: (value: string) => void;
    pageType: LandingPageType | '';
    onPageTypeChange: (value: LandingPageType | '') => void;
    status: LandingPageStatus | '';
    onStatusChange: (value: LandingPageStatus | '') => void;
}

const LandingPageFilter = ({
    search,
    onSearchChange,
    pageType,
    onPageTypeChange,
    status,
    onStatusChange
}: LandingPageFilterProps) => {
    const { t } = useTranslation('landing_pages');

    const pageTypeOptions: Option[] = [
        { value: '', label: t('filter.all_types') },
        { value: 'destination', label: t('types.destination') },
        { value: 'tour_line', label: t('types.tour_line') },
        { value: 'promotion', label: t('types.promotion') }
    ];

    const statusOptions: Option[] = [
        { value: '', label: t('filter.all_statuses') },
        { value: 'draft', label: t('status.draft') },
        { value: 'published', label: t('status.published') }
    ];

    const currentPageTypeOpt = pageTypeOptions.find(o => o.value === pageType) || pageTypeOptions[0];
    const currentStatusOpt = statusOptions.find(o => o.value === status) || statusOptions[0];

    return (
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            {/* Search Input */}
            <div className="flex-1">
                <TextInput
                    placeholder={t('filter.search_placeholder')}
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                    leftIcon={<Search size={18} className="text-slate-400" />}
                    className="w-full bg-slate-50 font-medium border-slate-200 focus:border-[#14b8a6] rounded-2xl h-[52px]"
                />
            </div>

            {/* Page Type Filter */}
            <div className="w-full md:w-56">
                <CustomSelect
                    options={pageTypeOptions}
                    value={currentPageTypeOpt}
                    onChange={(opt) => onPageTypeChange(opt ? (opt.value as LandingPageType | '') : '')}
                    leftIcon={<Globe size={18} />}
                />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-56">
                <CustomSelect
                    options={statusOptions}
                    value={currentStatusOpt}
                    onChange={(opt) => onStatusChange(opt ? (opt.value as LandingPageStatus | '') : '')}
                    leftIcon={<Activity size={18} />}
                />
            </div>
        </div>
    );
};

export default LandingPageFilter;

