import type { MultiValue } from 'react-select';
import CustomSelect from '@/components/ui/CustomSelect';
import type { Option } from '@/components/ui/CustomSelect';
import { useTranslation } from 'react-i18next';

interface TagSelectorProps {
    options: { id: number; name: string }[];
    value: number[];
    onChange: (ids: number[]) => void;
    label?: string;
    placeholder?: string;
    isLoading?: boolean;
    error?: string;
}

const TagSelector = ({
    options,
    value,
    onChange,
    label,
    placeholder,
    isLoading,
    error
}: TagSelectorProps) => {
    const { t } = useTranslation('location');

    const selectOptions: Option[] = options.map(opt => ({
        value: opt.id,
        label: opt.name
    }));

    const selectedValues = selectOptions.filter(opt => 
        value.includes(opt.value as number)
    );

    const handleChange = (newValue: MultiValue<Option>) => {
        const ids = Array.from(newValue).map(opt => opt.value as number);
        onChange(ids);
    };

    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-sm font-semibold text-slate-700 block mb-1">
                    {label}
                </label>
            )}
            
            <CustomSelect
                isMulti
                options={selectOptions}
                value={selectedValues}
                onChange={handleChange}
                placeholder={placeholder || t('form.basic.category_placeholder')}
                isLoading={isLoading}
                isSearchable
                closeMenuOnSelect={false}
            />
            
            {error && (
                <p className="text-xs text-red-500 font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {error}
                </p>
            )}
        </div>
    );
};

export default TagSelector;
