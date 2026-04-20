import type { FieldErrors } from 'react-hook-form';

/**
 * Scrolls to the first domestic validation error in a form
 * @param errors The errors object from react-hook-form
 * @param fieldOrder An array of field names in display order
 * @param dataAttribute The data-attribute used to identify fields in the DOM
 */
export const scrollToFirstError = <T extends Record<string, unknown>>(
    errors: FieldErrors<T>,
    fieldOrder: (keyof T | string)[],
    dataAttribute: string = 'data-tour-field'
): void => {
    for (const key of fieldOrder) {
        if (errors[key as string]) {
            const element = document.querySelector(`[${dataAttribute}="${String(key)}"]`);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                return;
            }
        }
    }
};
