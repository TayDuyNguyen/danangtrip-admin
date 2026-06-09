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
 * Remove access token from localStorage
 * (Hàm để xóa access token khỏi localStorage)
 */
export const clearTokens = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

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
