/**
 * Get language from storage
 * (Lấy ngôn ngữ từ storage)
 */
export const getLanguageStorage = () => {
    return localStorage.getItem('language') || 'vi';
};
