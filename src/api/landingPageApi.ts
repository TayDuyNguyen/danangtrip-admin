import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { ApiResponse, Paginator } from '@/types/api';
import type { LandingPage, LandingPageFilters, CreateLandingPageInput, LandingPageStatus } from '@/types/landingPage.types';

/**
 * Service API for Landing Pages management.
 * (Dịch vụ API cho Quản lý Landing Pages)
 */
export const landingPageApi = {
    /**
     * Get paginated landing pages list with filters.
     */
    list: async (filters?: LandingPageFilters): Promise<ApiResponse<Paginator<LandingPage>>> => {
        return axiosClient.get(API_ENDPOINTS.LANDING_PAGES.LIST, { params: filters });
    },

    /**
     * Get landing page detail by ID.
     */
    get: async (id: number): Promise<ApiResponse<LandingPage>> => {
        return axiosClient.get(API_ENDPOINTS.LANDING_PAGES.DETAIL(id));
    },

    /**
     * Create a new landing page.
     */
    create: async (data: CreateLandingPageInput): Promise<ApiResponse<LandingPage>> => {
        return axiosClient.post(API_ENDPOINTS.LANDING_PAGES.CREATE, data);
    },

    /**
     * Update a landing page.
     */
    update: async (id: number, data: Partial<CreateLandingPageInput>): Promise<ApiResponse<LandingPage>> => {
        return axiosClient.put(API_ENDPOINTS.LANDING_PAGES.UPDATE(id), data);
    },

    /**
     * Toggle landing page draft/published status.
     */
    updateStatus: async (id: number, status: LandingPageStatus): Promise<ApiResponse<null>> => {
        return axiosClient.patch(API_ENDPOINTS.LANDING_PAGES.PATCH_STATUS(id), { status });
    },

    /**
     * Delete a landing page.
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
        return axiosClient.delete(API_ENDPOINTS.LANDING_PAGES.DELETE(id));
    },
};
