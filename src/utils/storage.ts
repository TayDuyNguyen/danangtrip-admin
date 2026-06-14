import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";
const LANGUAGE_KEY = "language";
const ADMIN_PREFERENCES_KEY = "danangtrip_admin_preferences";

export type AdminFontSize = "small" | "medium" | "large";

export interface AdminPreferences {
    notificationsEnabled: boolean;
    saveLoginLocation: boolean;
    fontSize: AdminFontSize;
}

const DEFAULT_ADMIN_PREFERENCES: AdminPreferences = {
    notificationsEnabled: true,
    saveLoginLocation: true,
    fontSize: "medium",
};

/**
 * Get access token from cookies or localStorage
 * (Hàm để lấy access token từ cookies hoặc localStorage)
 */
export const getAccessToken = () => {
    if (typeof window === "undefined") return null;
    return Cookies.get(ACCESS_TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Set access token to cookies and/or localStorage based on remember parameter
 * (Hàm để lưu access token vào cookies và/hoặc localStorage dựa trên tham số remember)
 */
export const setAccessToken = (token: string, remember?: boolean) => {
    if (typeof window === "undefined") return;

    const shouldRemember = remember !== undefined
        ? remember
        : localStorage.getItem("remember_me") === "true";

    if (shouldRemember) {
        Cookies.set(ACCESS_TOKEN_KEY, token, { expires: 14, path: "/" });
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        localStorage.setItem("remember_me", "true");
    } else {
        Cookies.set(ACCESS_TOKEN_KEY, token, { path: "/" }); // Session cookie
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.setItem("remember_me", "false");
    }
};

/**
 * Remove access token from cookies and localStorage
 * (Hàm để xóa access token khỏi cookies và localStorage)
 */
export const clearTokens = () => {
    if (typeof window === "undefined") return;
    Cookies.remove(ACCESS_TOKEN_KEY, { path: "/" });
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem("remember_me");
};

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

export const getAdminPreferences = (): AdminPreferences => {
    try {
        const rawPreferences = localStorage.getItem(ADMIN_PREFERENCES_KEY);
        if (!rawPreferences) {
            return DEFAULT_ADMIN_PREFERENCES;
        }

        const parsedPreferences = JSON.parse(rawPreferences) as Partial<AdminPreferences>;

        return {
            ...DEFAULT_ADMIN_PREFERENCES,
            ...parsedPreferences,
            fontSize: ["small", "medium", "large"].includes(parsedPreferences.fontSize ?? "")
                ? parsedPreferences.fontSize as AdminFontSize
                : DEFAULT_ADMIN_PREFERENCES.fontSize,
        };
    } catch {
        return DEFAULT_ADMIN_PREFERENCES;
    }
};

export const setAdminPreferences = (preferences: AdminPreferences) => {
    localStorage.setItem(ADMIN_PREFERENCES_KEY, JSON.stringify(preferences));
};

export const applyAdminFontSize = (fontSize: AdminFontSize) => {
    document.documentElement.dataset.adminFontSize = fontSize;
};
