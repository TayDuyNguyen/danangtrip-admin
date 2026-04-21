import { API_ENDPOINTS } from "@/constants";
import { apiClientEnv } from "@/config/env";
import { ROUTES } from "@/routes/routes";
import { useUserStore } from "@/store/useUserStore";
import { type ApiResponse, type ErrorResponse, type User } from "@/types";
import { clearTokens, getAccessToken, getLanguage, getTokenExpiryMs, setAccessToken } from "@/utils";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import i18next from "i18next";

const normalizeBaseForFailover = (url: string | undefined): string => {
    if (!url) return "";
    return url.trim().replace(/\/+$/, "");
};

/**
 * Sticky active API base (primary or last successful failover).
 */
let currentBaseUrl = apiClientEnv.baseChain[0] ?? "";

/**
 * Creates a pre-configured axios instance with base URL, default headers and timeout
 * (Tạo một axios instance với base URL, headers mặc định và timeout)
 */
const axiosClient = axios.create({
    baseURL: currentBaseUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: apiClientEnv.timeoutMs,
});

/**
 * Queue management — holds pending requests while token is being refreshed
 * (Quản lý hàng đợi — giữ các request đang chờ trong khi token đang được làm mới)
 */
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (e: unknown) => void }> = [];
let isRedirecting = false;

/**
 * Processes all queued requests after token refresh completes or fails
 * (Xử lý tất cả các request trong hàng đợi sau khi refresh token thành công hoặc thất bại)
 */
const processQueus = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
    failedQueue = [];
};

/**
 * Clears tokens, resets user state and redirects to login page
 * (Xóa token, reset trạng thái user và chuyển hướng về trang đăng nhập)
 */
const handleLogout = (onRedirect?: () => void) => {
    if (isRedirecting) return;

    // Check if we are still in bootstrap phase to avoid aggressive redirects
    const isAuthReady = useUserStore.getState().authReady;

    isRedirecting = true;
    clearTokens();
    useUserStore.getState().logout();

    if (onRedirect) {
        onRedirect();
    } else if (isAuthReady) {
        // Only redirect standard window if auth bootstrap is finished
        window.location.replace(ROUTES.LOGIN);
    }
};

/**
 * Attempts to obtain a new access token using the HttpOnly cookie (silent refresh)
 * (Cố gắng lấy access token mới bằng cookie HttpOnly - refresh thầm lặng)
 */
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        // We dont send Authorization header here, backend relies on refresh_token cookie
        const response = await axios.post<ApiResponse<{ token: string; user: User }>>(
            `${currentBaseUrl}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            {},
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
                timeout: apiClientEnv.timeoutMs,
            }
        );

        const { token, user } = response.data?.data || {};

        if (token) {
            setAccessToken(token);
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

/**
 * Applies common headers (Accept-Language, FormData) to a request config
 */
const applyCommonHeaders = (config: InternalAxiosRequestConfig) => {
    config.headers["Accept-Language"] = getLanguage() || "vi";

    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
};

/**
 * Request interceptor — attaches auth token and handles proactive refresh
 */
axiosClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const isAbsoluteUrl = typeof config.url === "string" && /^https?:\/\//i.test(config.url);
        if (!isAbsoluteUrl) {
            config.baseURL = currentBaseUrl;
        }

        const token = getAccessToken();

        // Proactive refresh: if token expires within 5 minutes, refresh before sending
        if (token && getTokenExpiryMs(token) < 5 * 60 * 1000 && !isRefreshing) {
            isRefreshing = true;
            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    processQueus(null, newToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    processQueus(new Error("Refresh failed"), null);
                    handleLogout();
                    return Promise.reject(new Error("Session expired"));
                }
            } finally {
                isRefreshing = false;
            }
        } else if (isRefreshing) {
            // Wait for existing refresh to complete
            return new Promise<string | null>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                if (token) config.headers.Authorization = `Bearer ${token}`;
                return config;
            });
        } else {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return applyCommonHeaders(config);
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor — handles token refresh on 401 and client-side API failover
 */
axiosClient.interceptors.response.use(
    (response) => {
        if (response.config.responseType === "blob") {
            return response as unknown;
        }
        return response.data;
    },
    async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

        if (!error.response && !axios.isCancel(error)) {
            if (originalRequest?.__isFailoverRetry) {
                return Promise.reject(error);
            }
            if (!originalRequest) {
                toast.error(i18next.t("translation:network_error"));
                return Promise.reject(error);
            }

            const failedNorm =
                normalizeBaseForFailover(originalRequest?.baseURL) ||
                normalizeBaseForFailover(currentBaseUrl);
            const candidates = apiClientEnv.baseChain.filter(
                (b) => normalizeBaseForFailover(b) !== failedNorm
            );

            for (const base of candidates) {
                try {
                    const res = await axiosClient.request({
                        ...originalRequest,
                        baseURL: base,
                        __isFailoverRetry: true,
                    });
                    currentBaseUrl = base;
                    axiosClient.defaults.baseURL = base;
                    return res;
                } catch {
                    /* try next base */
                }
            }

            toast.error(i18next.t("translation:network_error"));
            return Promise.reject(error);
        }

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const { status, data } = error.response!;

        // Handle 401 Unauthorized
        if (status === 401 || data?.code === 401) {
            // Skip for login or refresh endpoints to avoid loops
            if (
                originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
                originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
            ) {
                return Promise.reject(error);
            }

            // Don't retry more than once
            if (originalRequest?._retry) {
                handleLogout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers!.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((refreshErr) => Promise.reject(refreshErr));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                if (!newToken) throw new Error("Refresh failed");

                processQueus(null, newToken);
                originalRequest.headers!.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch (refreshErr) {
                processQueus(refreshErr as Error, null);
                handleLogout();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        if (status === 403) {
            toast.warning(i18next.t("translation:permission_denied"));
        }

        if (status >= 500) {
            toast.error(i18next.t("translation:server_error"));
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
