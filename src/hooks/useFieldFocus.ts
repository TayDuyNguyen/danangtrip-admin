import { useState, useCallback } from 'react';

/**
 * Hook quản lý trạng thái focus cho nhiều field trong một form.
 * 
 * @example
 * const { isFocused, getFocusProps } = useFieldFocus<'email' | 'password'>();
 * 
 * <Input isFocused={isFocused('email')} {...getFocusProps('email')} />
 */
const useFieldFocus = <T extends string>() => {
    const [focusedField, setFocusedField] = useState<T | null>(null);

    const isFocused = useCallback(
        (field: T) => focusedField === field,
        [focusedField]
    );

    /**
     * Trả về onFocus và onBlur handler cho một field cụ thể.
     * Truyền trực tiếp vào props của Input component.
     */
    const getFocusProps = useCallback((field: T) => ({
        onFocus: () => setFocusedField(field),
        onBlur: (e: React.FocusEvent<HTMLElement>) => {
            const nextFocused = e.relatedTarget as HTMLElement | null;
            // chỉ clear focus thự sự rời khỏi form 
            if (!nextFocused?.closest('[data-form-field]')) {
                // setFocusedField(null);
                setFocusedField(prev => prev === field ? null : prev);
            }
        },
    }), []);

    return { focusedField, isFocused, getFocusProps };
};

export default useFieldFocus;
