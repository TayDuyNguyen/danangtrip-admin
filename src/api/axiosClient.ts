import { API_ENDPOINTS } from "@/constants";
import { ROUTES } from "@/routes/routes";
import { useUserStore } from "@/store/useUserStore";
import { type ApiResponse, type ErrorResponse, type User } from "@/types";
import { clearTokens, getAccessToken, getLanguage, getTokenExpiryMs, setAccessToken } from "@/utils";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import i18next from "i18next";


/**
 * Creates a pre-configured axios instance with base URL, default headers and timeout
 * (Tạo một axios instance với base URL, headers mặc định và timeout)
 */
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
})

/**
 * Queue management — holds pending requests while token is being refreshed
 * (Quản lý hàng đợi — giữ các request đang chờ trong khi token đang được làm mới)
 */
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void, reject: (e: unknown) => void }> = [];
let isRedirecting = false;

/**
 * Processes all queued requests after token refresh completes or fails
 * (Xử lý tất cả các request trong hàng đợi sau khi refresh token thành công hoặc thất bại)
 */
const processQueus = (error: Error | null, token: string | null = null) => {
    // Resolve or reject each queued request based on refresh result
    // (Resolve hoặc reject từng request trong hàng đợi dựa trên kết quả refresh)
    failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve(token));
    failedQueue = [];
}

/**
 * Clears tokens, resets user state and redirects to login page
 * (Xóa token, reset trạng thái user và chuyển hướng về trang đăng nhập)
 */
const handleLogout = (onRedirect?: () => void) => {
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

    // Redirect to login page
    // (Chuyển hướng về trang đăng nhập)
    if (onRedirect) {
        onRedirect();
    } else {
        window.location.replace(ROUTES.LOGIN);
    }
}

/**
 * Attempts to obtain a new access token using the stored token
 * (Cố gắng lấy access token mới bằng cách sử dụng token đã lưu)
 */
const refreshAccessToken = async (): Promise<string | null> => {
    try {
        // Check if token exists before making the request
        // (Kiểm tra token có tồn tại trước khi gửi request)
        const accessToken = getAccessToken();
        if (!accessToken) return null;

        const response = await axios.post<ApiResponse<{ token: string, user: User }>>(
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
}

/**
 * Applies common headers (Accept-Language, FormData) to a request config
 * (Gắn các header chung vào config request)
 */
const applyCommonHeaders = (config: InternalAxiosRequestConfig) => {
    // Set Accept-Language header from stored language preference
    // (Đặt header Accept-Language từ ngôn ngữ đã lưu)
    config.headers["Accept-Language"] = getLanguage() || "vi";

    // Remove Content-Type for FormData so browser sets the correct boundary
    // (Xóa Content-Type với FormData để trình duyệt tự đặt boundary đúng)
    if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
    }
    return config;
}

/**
 * Request interceptor — attaches auth token and language header to every outgoing request
 * (Interceptor request — gắn token xác thực và header ngôn ngữ vào mỗi request gửi đi)
 */
axiosClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        // Proactive refresh: if token expires within 10 minutes, refresh before sending
        // (Refresh chủ động: nếu token hết hạn trong 10 phút, refresh trước khi gửi)
        if (token && getTokenExpiryMs(token) < 5 * 60 * 1000 && !isRefreshing) {
            isRefreshing = true;
            try {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    processQueus(null, newToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                } else {
                    // Refresh failed — logout and block the request
                    // (Refresh thất bại — đăng xuất và chặn request)
                    processQueus(new Error('Refresh failed'), null);
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
            })
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

        // Handle network errors or server unreachable
        if (!error.response) {
            toast.error(i18next.t('translation.network_error', 'Kết nối mạng thất bại'));
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        // Handle 401 Unauthorized — attempt token refresh
        if (status === 401 || data?.code === 401) {
            if(originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGIN)){
                return Promise.reject(error);
            }
            if (originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)) {
                handleLogout();
                return Promise.reject(error);
            }

            if (originalRequest?._retry) {
                handleLogout();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers!.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                }).catch((error) => Promise.reject(error));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();
                if (!newToken) {
                    throw new Error('Refresh failed');
                }

                processQueus(null, newToken);
                originalRequest.headers!.Authorization = `Bearer ${newToken}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueus(refreshError as Error, null);
                handleLogout();
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }
        
        // --- GLOBAL ERROR TOASTS ---
        if (status === 403) {
            toast.warning(i18next.t('translation.permission_denied', 'Bạn không có quyền thực hiện hành động này'));
        }
        
        if (status >= 500) {
            toast.error(i18next.t('translation.server_error', 'Lỗi hệ thống, vui lòng thử lại sau'));
        }

        return Promise.reject(error);
    }

);
export default axiosClient;