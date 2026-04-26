import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    invalid?: boolean;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
    { className, invalid, ...props },
    ref
) {
    return (
        <textarea
            ref={ref}
            className={twMerge(
                'w-full px-4 py-3 bg-slate-50 border rounded-xl transition-all resize-none text-sm',
                'focus:outline-none focus:border-[#14b8a6] focus:bg-white',
                invalid ? 'border-red-300 bg-red-50/40' : 'border-slate-200',
                className
            )}
            {...props}
        />
    );
});
