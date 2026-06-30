import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RotateCcw } from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/Button';
import type { LocationFilters } from '@/dataHelper/location.dataHelper';
import { useLocationCategoriesQuery, useLocationFilterDistrictsQuery } from '@/hooks/useLocationQueries';

interface LocationFilterProps {
    filters: LocationFilters;
    onFilterChange: (key: keyof LocationFilters, value: string | number | null | undefined) => void;
    onReset: () => void;
}

const LocationFilter = ({ filters, onFilterChange, onReset }: LocationFilterProps) => {
    const { t } = useTranslation(['location', 'common']);
    const { data: categories = [], isLoading: catLoading } = useLocationCategoriesQuery();
    const { data: districts = [], isLoading: distLoading } = useLocationFilterDistrictsQuery();

    const statusOptions: Option[] = useMemo(
        () => [
            { value: 'all', label: t('filters.status') },
            { value: 'active', label: t('status.active') },
            { value: 'inactive', label: t('status.inactive') },
        ],
        [t]
    );

    const priceOptions: Option[] = useMemo(
        () => [
            { value: 'all', label: t('filters.price_level') },
            { value: 'free', label: t('priceLevels.free') },
            { value: 'low', label: t('priceLevels.low') },
            { value: 'medium', label: t('priceLevels.medium') },
            { value: 'high', label: t('priceLevels.high') },
        ],
        [t]
    );

    const categoryOptions: Option[] = useMemo(() => {
        const base: Option[] = [{ value: 'all', label: t('filters.category') }];
        const fromApi = categories.map((c: { id: number; name: string }) => ({ value: String(c.id), label: c.name }));
        return [...base, ...fromApi];
    }, [categories, t]);

    const districtOptions: Option[] = useMemo(() => {
        const base: Option[] = [{ value: 'all', label: t('filters.district') }];
        const fromApi = districts.map((d) => ({ value: d, label: d }));
        return [...base, ...fromApi];
    }, [districts, t]);

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
                        value={categoryOptions.find((opt) => opt.value === String(filters.category_id))}
                        onChange={(opt) => onFilterChange('category_id', opt?.value)}
                        placeholder={t('filters.category')}
                        size="md"
                        isDisabled={catLoading}
                    />
                </div>

                <div className="w-[160px]">
                    <CustomSelect
                        options={districtOptions}
                        value={districtOptions.find((opt) => opt.value === filters.district)}
                        onChange={(opt) => onFilterChange('district', opt?.value)}
                        placeholder={t('filters.district')}
                        size="md"
                        isDisabled={distLoading}
                    />
                </div>

                <div className="w-[140px]">
                    <CustomSelect
                        options={priceOptions}
                        value={priceOptions.find((opt) => opt.value === filters.price_level)}
                        onChange={(opt) => onFilterChange('price_level', opt?.value)}
                        placeholder={t('filters.price_level')}
                        size="md"
                    />
                </div>

                <div className="w-[140px]">
                    <CustomSelect
                        options={statusOptions}
                        value={statusOptions.find((opt) => opt.value === filters.status)}
                        onChange={(opt) => onFilterChange('status', opt?.value)}
                        placeholder={t('filters.status')}
                        size="md"
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={onReset}
                        aria-label={t('common:actions.reset')}
                        title={t('location:actions.reset')}
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
