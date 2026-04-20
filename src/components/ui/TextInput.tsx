import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** RHF / Yup error state — border + light red background */
    invalid?: boolean;
}

/**
 * Shared admin text input (Tour forms and other screens).
 * Use with react-hook-form: `{...register('field')}` or `ref` + controlled props.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { className, invalid, ...props },
    ref
) {
    return (
        <input
            ref={ref}
            className={twMerge(
                'w-full px-4 py-3 bg-slate-50 border rounded-xl transition-all',
                'focus:outline-none focus:border-[#0066CC] focus:bg-white',
                invalid ? 'border-red-300 bg-red-50/40' : 'border-slate-200',
                className
            )}
            {...props}
        />
    );
});
