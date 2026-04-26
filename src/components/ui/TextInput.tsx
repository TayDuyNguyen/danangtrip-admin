import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** RHF / Yup error state — border + light red background */
    invalid?: boolean;
    leftIcon?: React.ReactNode;
    containerClassName?: string;
}

/**
 * Shared admin text input (Tour forms and other screens).
 * Use with react-hook-form: `{...register('field')}` or `ref` + controlled props.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
    { className, invalid, leftIcon, containerClassName, ...props },
    ref
) {
    return (
        <div className={twMerge("relative w-full", containerClassName)}>
            {leftIcon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {leftIcon}
                </div>
            )}
            <input
                ref={ref}
                className={twMerge(
                    'w-full px-4 py-3 bg-slate-50 border rounded-xl transition-all',
                    'focus:outline-none focus:border-[#14b8a6] focus:bg-white',
                    invalid ? 'border-red-300 bg-red-50/40' : 'border-slate-200',
                    leftIcon ? 'pl-11' : '',
                    className
                )}
                {...props}
            />
        </div>
    );
});
