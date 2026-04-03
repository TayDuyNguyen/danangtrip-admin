const ACCESS_TOKEN_KEY = "access_token";
const LANGUAGE_KEY = "language";

/**
 * Get access token from localStorage
 * (Hàm để lấy access token từ localStorage)
 */
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

/**
 * Set access token to localStorage
 * (Hàm để lưu access token vào localStorage)
 */
export const setAccessToken = (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token);

/**
 * Remove access token from localStorage
 * (Hàm để xóa access token khỏi localStorage)
 */
export const clearTokens = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

/**
 * Get language from localStorage
 * (Hàm để lấy ngôn ngữ từ localStorage)
 */
export const getLanguage = () => localStorage.getItem(LANGUAGE_KEY);

/**
 * Set language to localStorage
 * (Hàm để lưu ngôn ngữ vào localStorage)
 */
export const setLanguage = (language: string) => localStorage.setItem(LANGUAGE_KEY, language);

/**
 * Remove language from localStorage
 * (Hàm để xóa ngôn ngữ khỏi localStorage)
 */
export const clearLanguage = () => localStorage.removeItem(LANGUAGE_KEY);
