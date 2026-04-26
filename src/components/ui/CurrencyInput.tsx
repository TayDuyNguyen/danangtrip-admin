import { type InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { cn, formatCurrency } from '@/utils';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: number | null;
    onChange?: (value: number | null) => void;
    invalid?: boolean;
}

/**
 * CurrencyInput Component
 * - Displays value formatted with thousand separators (vi-VN)
 * - Returns raw numeric value to parent via onChange
 * - Integrated with React Hook Form
 */
export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onChange, className, invalid, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState('');

        // Sync display value when external value changes
        useEffect(() => {
            setDisplayValue(formatCurrency(value));
        }, [value]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Remove everything except digits
            const rawValue = e.target.value.replace(/\D/g, '');
            
            if (rawValue === '') {
                setDisplayValue('');
                onChange?.(null);
                return;
            }

            const numValue = parseInt(rawValue, 10);
            
            // Limit to a reasonable number of digits for safety
            if (numValue > 999_999_999_999) return; 

            setDisplayValue(formatCurrency(numValue));
            onChange?.(numValue);
        };

        return (
            <input
                {...props}
                ref={ref}
                type="text"
                value={displayValue}
                onChange={handleChange}
                autoComplete="off"
                className={cn(
                    'flex h-11 w-full rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14b8a6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
                    invalid && 'border-red-500 focus-visible:ring-red-500 text-red-900',
                    className
                )}
            />
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';
