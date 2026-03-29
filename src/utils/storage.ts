const ACCESS_TOKEN_KEY = 'access_token';

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
 * Clear access token from localStorage
 * (Hàm để xóa access token khỏi localStorage)
 */
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
};
