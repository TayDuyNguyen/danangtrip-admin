import type { User } from '@/types';

/**
 * Login request interface
 * (Interface để lưu trữ thông tin yêu cầu đăng nhập)
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Login response interface
 * (Interface để lưu trữ thông tin phản hồi đăng nhập)
 */
export interface LoginResponse {
    token: string;
    user: User;
}

/**
 * Register request interface
 * (Interface để lưu trữ thông tin yêu cầu đăng ký)
 */
export interface RegisterRequest {
    username: string;
    full_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string | null;
}

/**
 * Register response interface
 * (Interface để lưu trữ thông tin phản hồi đăng ký)
 */
export interface RegisterResponse {
    user: User;
}

/**
 * Refresh token response interface
 * (Interface để lưu trữ thông tin phản hồi refresh token)
 */
export interface RefreshTokenResponse extends LoginResponse { }
