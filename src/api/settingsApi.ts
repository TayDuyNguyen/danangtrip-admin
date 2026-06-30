import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { ApiResponse } from '@/types/api';

/**
 * Service API for Website settings configurations.
 */
export const settingsApi = {
    /**
     * Retrieve all configurations for admin management screen.
     */
    getAdminSettings: async (): Promise<ApiResponse<unknown>> => {
        return axiosClient.get(API_ENDPOINTS.SETTINGS.GET);
    },

    /**
     * Save/update configurations.
     */
    updateSettings: async (settings: import('@/types/settings.types').WebsiteSettings): Promise<ApiResponse<void>> => {
        return axiosClient.put(API_ENDPOINTS.SETTINGS.UPDATE, { settings });
    },

    /**
     * Partial update — only merges the provided setting groups (e.g. chatbot only).
     */
    updateSettingGroups: async (
        groups: Record<string, Record<string, unknown>>
    ): Promise<ApiResponse<void>> => {
        return axiosClient.put(API_ENDPOINTS.SETTINGS.UPDATE, { settings: groups });
    },
};
