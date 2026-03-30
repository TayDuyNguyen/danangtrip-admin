import { useUserStore } from "@/store";
import { getAccessToken, setAccessToken } from "./storage";
import { authApi } from "@/api";
import type { RefreshTokenResponse } from "@/dataHelper";
import type { ApiResponse } from "@/types";

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

/**
 * Attempts to obtain a new access token using the stored refresh token
 * (Cố gắng lấy access token mới bằng cách sử dụng refresh token đã lưu)
 */
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        // Check if token exists before making the request
        // (Kiểm tra token có tồn tại trước khi gửi request)
        const accessToken = getAccessToken();
        if (!accessToken) return null;

        const response = (await authApi.refreshToken()) as ApiResponse<RefreshTokenResponse>

        const { token, user } = response?.data || {};

        if (token) {
            // Persist the new access token to localStorage
            // (Lưu access token mới vào localStorage)
            setAccessToken(token);

            // Sync updated user info into global store if provided
            // (Đồng bộ thông tin user mới vào global store nếu có)
            if (user) {
                useUserStore.getState().setUser(user, token);
            }
            return token;
        }
        return null;
    } catch {
        return null;
    }
};