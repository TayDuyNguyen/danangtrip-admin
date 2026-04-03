import { authApi } from '@/api';
import type { LoginRequest, LoginResponse, RefreshTokenResponse, RegisterRequest, RegisterResponse } from '@/dataHelper';
import { useUserStore } from '@/store';
import type { ApiResponse } from '@/types';
import { setAccessToken } from '@/utils';
import { useMutation } from '@tanstack/react-query';

/**
 * Login query
 * (Query để đăng nhập)
 */
export const useLoginQuery = () => {
    return useMutation<ApiResponse<LoginResponse>, Error, LoginRequest>({
        mutationFn: authApi.login,
        onSuccess: (res) => {
            if (res.data?.token) {
                setAccessToken(res.data.token);
            }
            if (res.data?.user) {
                useUserStore.setState({ user: res.data.user });
            }

            // toast.success
        },
        onError: () => {
            // toast.error
        },
    });
}

/**
 * Register query
 * (Query để đăng ký)
 */
export const useRegisterQuery = () => {
    return useMutation<ApiResponse<RegisterResponse>, Error, RegisterRequest>({
        mutationFn: authApi.register,
        onSuccess: () => {
            // toast.success
        },
        onError: () => {
            // toast.error
        },
    });
}

/**
 * Logout query
 * (Query để đăng xuất)
 */
export const useLogoutQuery = () => {
    return useMutation<ApiResponse, Error>({
        mutationFn: authApi.logout,
        onSuccess: () => {
            // toast.success
        },
        onError: () => {
            // toast.error
        },
    });
}

/**
 * Refresh token query
 * (Query để refresh token)
 */
export const useRefreshTokenQuery = () => {
    return useMutation<ApiResponse<RefreshTokenResponse>, Error>({
        mutationFn: authApi.refreshToken,
        onSuccess: (res) => {
            if (res.data?.token) {
                setAccessToken(res.data.token);
            }
            if (res.data?.user) {
                useUserStore.setState({ user: res.data.user });
            }
            // toast.success
        },
        onError: () => {
            // toast.error
        },
    });
}
