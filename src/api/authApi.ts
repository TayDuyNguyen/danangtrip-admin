import { API_ENDPOINTS } from '@/constant';
import type { LoginRequest, LoginResponse, RefreshTokenResponse, RegisterRequest, RegisterResponse } from '@/dataHelper';
import type { ApiResponse } from '@/types';
import axiosClient from './axiosClient';

export const authApi = {
    login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
        axiosClient.post(API_ENDPOINTS.AUTH.LOGIN, data),

    register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> =>
        axiosClient.post(API_ENDPOINTS.AUTH.REGISTER, data),

    logout: (): Promise<ApiResponse> =>
        axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT),

    refreshToken: (): Promise<ApiResponse<RefreshTokenResponse>> =>
        axiosClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN),
};
