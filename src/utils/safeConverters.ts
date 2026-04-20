/**
 * Universal helpers for safe data conversion
 * (Các helper chức năng chuyển đổi dữ liệu an toàn)
 */

export const toNumberSafe = (val: unknown, fallback = 0): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
};

export const toArraySafe = <T>(input: unknown): T[] => {
    if (Array.isArray(input)) return input as T[];
    if (input && typeof input === 'object') {
        const obj = input as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as T[];
        if (Array.isArray(obj.items)) return obj.items as T[];
        if (Array.isArray(obj.stats)) return obj.stats as T[];
    }
    return [];
};

export const toDateLabelSafe = (val: unknown): string => {
    const str = String(val || '');
    if (str.match(/^\d+$/)) {
        return `Th.${str}`; // For numeric months
    }
    return str;
};
