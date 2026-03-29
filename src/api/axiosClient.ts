import { ROUTERS } from "@/routes/routes";
import { API_ENDPOINTS } from "@/constant";
import { getLanguageStorage, useUserStore } from "@/store";
import { getAccessToken, setAccessToken, clearTokens, getTokenExpiryMs } from "@/utils";
import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ErrorResponse, ApiResponse } from "@/types/index";
import type { User } from "@/types/user";

/**
 * Creates a pre-configured axios instance with base URL, default headers and timeout
 * (Tạo một axios instance với base URL, headers mặc định và timeout)
 */
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 15000
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
const processQueue = (error: Error | null, token: string | null = null) => {
    // Resolve or reject each queued request based on refresh result
    // (Resolve hoặc reject từng request trong hàng đợi dựa trên kết quả refresh)
    failedQueue.forEach((prom) =>
        error ? prom.reject(error) : prom.resolve(token)
    );
    failedQueue = [];
};

/**
 * Clears tokens, resets user state and redirects to login page
 * (Xóa token, reset trạng thái user và chuyển hướng về trang đăng nhập)
 */
const handleLogout = () => {
    // Prevent multiple redirects if already redirecting
    // (Ngăn chuyển hướng nhiều lần nếu đang trong quá trình redirect)
    if (isRedirecting) return;
    isRedirecting = true;

    // Clear stored tokens from localStorage
    // (Xóa token đã lưu khỏi localStorage)
    clearTokens();

    // Reset user state in global store
    // (Reset trạng thái user trong global store)
    useUserStore.getState().logout();

    window.location.href = ROUTERS.LOGIN;
};

/**
 * Attempts to obtain a new access token using the stored refresh token
 * (Cố gắng lấy access token mới bằng cách sử dụng refresh token đã lưu)
 */
const refreshAccessToken = async (): Promise<string | null> => {
    try {
        // Check if token exists before making the request
        // (Kiểm tra token có tồn tại trước khi gửi request)
        const accessToken = getAccessToken();
        if (!accessToken) return null;

        const response = await axios.post<ApiResponse<{ token: string; user: User }>>(
            `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const { token, user } = response.data?.data || {};

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

/**
 * Applies common headers (Accept-Language, FormData) to a request config
 * (Gắn các header chung vào config request)
 */
const applyCommonHeaders = (config: InternalAxiosRequestConfig) => {
    // Set Accept-Language header from stored language preference
    // (Đặt header Accept-Language từ ngôn ngữ đã lưu)
    config.headers["Accept-Language"] = getLanguageStorage();

    // Remove Content-Type for FormData so browser sets the correct boundary
    // (Xóa Content-Type với FormData để trình duyệt tự đặt boundary đúng)
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
};

/**
 * Request interceptor — attaches auth token and language header to every outgoing request
 * (Interceptor request — gắn token xác thực và header ngôn ngữ vào mỗi request gửi đi)
 */
axiosClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();

        // Proactive refresh: if token expires within 10 minutes, refresh before sending
        // (Refresh chủ động: nếu token hết hạn trong 10 phút, refresh trước khi gửi)
        if (token && getTokenExpiryMs(token) < 600_000 && !isRefreshing) {
            isRefreshing = true;
            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    processQueue(null, newToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    // Refresh failed — logout and block the request
                    // (Refresh thất bại — đăng xuất và chặn request)
                    processQueue(new Error('Refresh failed'), null);
                    handleLogout();
                    return Promise.reject(new Error('Session expired'));
                }
            } finally {
                isRefreshing = false;
            }
        } else if (isRefreshing) {
            // Another refresh is in progress — wait for it to finish
            // (Đang có refresh khác chạy — chờ cho đến khi xong)
            await new Promise<string | null>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((newToken) => {
                if (newToken && config.headers) {
                    config.headers.Authorization = `Bearer ${newToken}`
                }
            });
        } else {
            // Attach Bearer token if available
            // (Gắn Bearer token nếu có)
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return applyCommonHeaders(config);
    },
    (error) => Promise.reject(error)
);

/**
 * Response interceptor — unwraps response data and handles token refresh on 401
 * (Interceptor response — unwrap dữ liệu trả về và xử lý refresh token khi gặp lỗi 401)
 */
axiosClient.interceptors.response.use(
    (response) => {
        // Return the actual data payload from the server response
        // (Trả về dữ liệu thực tế từ response của server)
        return response.data;
    },
    async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Reject immediately on network errors (no response received)
        // (Reject ngay lập tức với lỗi mạng — không nhận được response)
        if (!error.response) {
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        // Handle 401 Unauthorized — attempt token refresh
        // (Xử lý lỗi 401 Unauthorized — thử làm mới token)
        if (status === 401 || data?.code === 401) {

            // Prevent infinite loop if the refresh endpoint itself returns 401
            // (Tránh vòng lặp vô hạn nếu chính endpoint refresh trả về 401)
            if (originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)) {
                handleLogout();
                return Promise.reject(error);
            }

            // Already retried once and still failing — force logout
            // (Đã thử lại một lần mà vẫn lỗi — buộc đăng xuất)
            if (originalRequest?._retry) {
                handleLogout();
                return Promise.reject(error);
            }

            // Queue concurrent requests while a refresh is already in progress
            // (Đưa các request đồng thời vào hàng đợi trong khi đang refresh)
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        // Retry the original request with the new token
                        // (Thử lại request gốc với token mới)
                        originalRequest.headers!.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();

                if (!newToken) {
                    throw new Error('Refresh failed');
                }

                // Unblock all queued requests with the new token
                // (Mở khóa tất cả request trong hàng đợi với token mới)
                processQueue(null, newToken);
                originalRequest.headers!.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // Fail all queued requests and logout
                // (Từ chối tất cả request trong hàng đợi và đăng xuất)
                processQueue(refreshError as Error, null);
                handleLogout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other common HTTP errors
        // (Xử lý các lỗi HTTP phổ biến khác)
        if (status === 403) { /* Forbidden — user lacks permission (Người dùng không có quyền truy cập) */ }
        if (status === 422) { /* Validation Error — invalid request data (Dữ liệu request không hợp lệ) */ }
        if (status >= 500) { /* Server Error — unexpected server failure (Lỗi server không mong muốn) */ }

        return Promise.reject(error);
    }
);

export default axiosClient;
