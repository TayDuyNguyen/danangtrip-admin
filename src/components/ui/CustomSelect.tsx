import React from 'react';
import Select from 'react-select';
import type { Props as SelectProps, StylesConfig, GroupBase } from 'react-select';
import { twMerge } from 'tailwind-merge';
import { useTranslation } from 'react-i18next';


// Define the option type locally or import if available
export interface Option {
    value: string | number;
    label: string | React.ReactNode;
}

interface CustomSelectProps extends Omit<SelectProps<Option, false, GroupBase<Option>>, 'styles' | 'theme'> {
    containerClassName?: string;
    leftIcon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
    className, 
    containerClassName, 
    options,
    value,
    onChange,
    placeholder,
    isSearchable = false,
    leftIcon,
    size = 'md',
    ...props 
}) => {
    const { t } = useTranslation('common');
    const finalPlaceholder = placeholder ?? t('placeholder_select');
    

    const customStyles: StylesConfig<Option, false> = {
        control: (provided, state) => ({
            ...provided,
            minHeight: size === 'sm' ? '36px' : size === 'lg' ? '60px' : '52px',
            backgroundColor: '#F8FAFC',
            borderColor: state.isFocused ? '#0066CC' : '#E2E8F0',
            borderRadius: size === 'sm' ? '8px' : '16px',
            boxShadow: state.isFocused ? '0 0 0 4px rgba(0, 102, 204, 0.08)' : 'none',
            '&:hover': {
                borderColor: state.isFocused ? '#0066CC' : '#CBD5E1',
                backgroundColor: '#F1F5F9',
            },
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            borderWidth: '1px',
            paddingLeft: leftIcon ? (size === 'sm' ? '28px' : '32px') : '4px',
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: leftIcon ? '0 12px' : (size === 'sm' ? '0 8px' : '0 20px'),
        }),
        input: (provided) => ({
            ...provided,
            margin: '0',
            padding: '0',
            fontWeight: '600',
            color: '#1E293B',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#1E293B',
            fontSize: size === 'sm' ? '13px' : '14px',
            fontWeight: '700',
            fontFamily: 'Inter, sans-serif',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#94A3B8',
            fontSize: size === 'sm' ? '13px' : '14px',
            fontWeight: '500',
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: state.isFocused ? '#0066CC' : '#94A3B8',
            paddingRight: size === 'sm' ? '8px' : '12px',
            transition: 'transform 0.3s ease, color 0.2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
            '&:hover': {
                color: '#64748B',
            },
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            zIndex: 50,
            marginTop: '8px',
            padding: '4px',
            animation: 'fadeIn 0.2s ease-out',
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '0',
            '&::-webkit-scrollbar': {
                width: '6px',
            },
            '&::-webkit-scrollbar-track': {
                background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
                background: '#E2E8F0',
                borderRadius: '10px',
            },
        }),
        option: (provided, state) => {
            return {
                ...provided,
                backgroundColor: state.isSelected 
                    ? '#0066CC' 
                    : state.isFocused 
                        ? '#F8FAFC' 
                        : 'transparent',
                color: state.isSelected ? '#FFFFFF' : '#475569',
                fontSize: size === 'sm' ? '13px' : '14px',
                fontWeight: state.isSelected ? '700' : '500',
                padding: size === 'sm' ? '6px 10px' : '10px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                cursor: 'pointer',
                '&:active': {
                    backgroundColor: state.isSelected ? '#0066CC' : '#F1F5F9',
                },
                transition: 'all 0.15s ease',
            };
        },
        noOptionsMessage: (provided) => ({
            ...provided,
            fontSize: '13px',
            color: '#94A3B8',
            fontWeight: '500',
        }),
    };

    return (
        <div className={twMerge("min-w-0 font-inter relative", containerClassName)}>
            {leftIcon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400">
                    {leftIcon}
                </div>
            )}
            <Select
                options={options}
                value={value}
                onChange={onChange}
                placeholder={finalPlaceholder}
                isSearchable={isSearchable}
                styles={customStyles}
                className={className}
                unstyled={false} // We use styles object but can use classNames too
                {...props}
            />
            <style sx-only="true">{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default CustomSelect;
