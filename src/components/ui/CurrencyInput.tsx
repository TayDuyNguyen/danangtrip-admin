import { type InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { cn, formatCurrency } from '@/utils';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: number | null;
    onChange?: (value: number | null) => void;
    invalid?: boolean;
}

const MAX_CURRENCY_VALUE = 999_999_999_999;

const onlyDigits = (value: string) => value.replace(/\D/g, '');
const NAVIGATION_KEYS = new Set(['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

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
            setDisplayValue(value == null ? '' : formatCurrency(value));
        }, [value]);

        const emitValue = (rawValue: string) => {
            if (rawValue === '') {
                setDisplayValue('');
                onChange?.(null);
                return;
            }

            const numValue = parseInt(rawValue, 10);
            if (numValue > MAX_CURRENCY_VALUE) return;

            const nextDisplayValue = formatCurrency(numValue);
            setDisplayValue(nextDisplayValue);
            onChange?.(numValue);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            emitValue(onlyDigits(e.target.value));
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.ctrlKey || e.metaKey || e.altKey || NAVIGATION_KEYS.has(e.key)) return;
            if (/^\d$/.test(e.key)) return;

            e.preventDefault();
        };

        return (
            <input
                {...props}
                ref={ref}
                type="text"
                inputMode="numeric"
                lang="en"
                autoCorrect="off"
                value={displayValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className={cn(
                    'flex h-11 w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14b8a6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
                    invalid && 'border-red-500 focus-visible:ring-red-500 text-red-900',
                    className
                )}
            />
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';
