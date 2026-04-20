/**
 * Splits a value (string or array) into an array of sanitized, non-empty lines.
 * Useful for mapping multiline textareas or arrays of strings to clean API payloads.
 */
export const splitLines = (value: unknown): string[] => {
    if (value == null) return [];

    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    return [];
};
