import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RotateCcw } from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/Button';
import type { LocationFilters } from '@/dataHelper/location.dataHelper';

interface LocationFilterProps {
    filters: LocationFilters;
    onFilterChange: (key: keyof LocationFilters, value: string | number | null | undefined) => void;
    onReset: () => void;
}

const LocationFilter = ({ filters, onFilterChange, onReset }: LocationFilterProps) => {
    const { t } = useTranslation('location');

    const statusOptions: Option[] = [
        { value: 'all', label: t('filters.status') },
        { value: 'active', label: t('status.active') },
        { value: 'inactive', label: t('status.inactive') },
    ];

    const priceOptions: Option[] = [
        { value: 'all', label: t('filters.price_level') },
        { value: 'free', label: 'Miễn phí' },
        { value: 'low', label: '$ (Thấp)' },
        { value: 'medium', label: '$$ (Trung bình)' },
        { value: 'high', label: '$$$ (Cao)' },
    ];

    const categoryOptions: Option[] = [
        { value: 'all', label: t('filters.category') },
        { value: '1', label: 'Bãi biển' },
        { value: '2', label: 'Di tích' },
        { value: '3', label: 'Vui chơi' },
    ];

    const districtOptions: Option[] = [
        { value: 'all', label: t('filters.district') },
        { value: '1', label: 'Hải Châu' },
        { value: '2', label: 'Sơn Trà' },
        { value: '3', label: 'Ngũ Hành Sơn' },
    ];

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[280px]">
                    <TextInput
                        placeholder={t('filters.placeholder')}
                        value={filters.q}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterChange('q', e.target.value)}
                        leftIcon={<Search size={18} />}
                        className="bg-slate-50 border-slate-100 h-[52px]"
                    />
                </div>
                
                <div className="w-[160px]">
                    <CustomSelect
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === filters.category_id)}
                        onChange={(opt) => onFilterChange('category_id', opt?.value)}
                        placeholder={t('filters.category')}
                        size="md"
                    />
                </div>

                <div className="w-[160px]">
                    <CustomSelect
                        options={districtOptions}
                        value={districtOptions.find(opt => opt.value === filters.district_id)}
                        onChange={(opt) => onFilterChange('district_id', opt?.value)}
                        placeholder={t('filters.district')}
                        size="md"
                    />
                </div>

                <div className="w-[140px]">
                    <CustomSelect
                        options={priceOptions}
                        value={priceOptions.find(opt => opt.value === filters.price_level)}
                        onChange={(opt) => onFilterChange('price_level', opt?.value)}
                        placeholder={t('filters.price_level')}
                        size="md"
                    />
                </div>

                <div className="w-[140px]">
                    <CustomSelect
                        options={statusOptions}
                        value={statusOptions.find(opt => opt.value === filters.status)}
                        onChange={(opt) => onFilterChange('status', opt?.value)}
                        placeholder={t('filters.status')}
                        size="md"
                    />
                </div>

                <div className="flex gap-2">
                    <Button 
                        variant="ghost" 
                        onClick={onReset}
                        className="h-[52px] px-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                    >
                        <RotateCcw size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default memo(LocationFilter);
