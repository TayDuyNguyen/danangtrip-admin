/**
 * Parse JWT payload
 * (Hàm để giải mã payload JWT)
 */
export const parseJwtPayload = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload) as { exp?: number };
};

/**
 * Check if token is expired
 * (Hàm để kiểm tra nếu token đã hết hạn)
 */
export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;
    try {
        const payload = parseJwtPayload(token);
        if (!payload.exp) return true;
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
};

/**
 * Get token expiry time in milliseconds
 * (Hàm để lấy thời gian hết hạn token (với đơn vị là milisecond))
 */
export const getTokenExpiryMs = (token: string | null): number => {
    if (!token) return 0;
    try {
        const payload = parseJwtPayload(token);
        if (!payload.exp) return 0;
        return payload.exp * 1000 - Date.now();
    } catch {
        return 0;
    }
};
