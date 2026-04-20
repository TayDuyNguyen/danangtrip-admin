/**
 * Generates a URL-safe slug from a string, with special handling for Vietnamese characters.
 */
export const slugifyVietnamese = (text: string | null | undefined): string => {
    if (!text) return '';

    return text
        .toLowerCase()
        .normalize('NFD') // Decompose combined characters into base + accent
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[đĐ]/g, 'd') // Handle the specific Vietnamese 'đ'
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-') // Replace multiple - with single -
        .trim();
};
