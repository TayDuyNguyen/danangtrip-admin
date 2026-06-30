import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { ApiResponse, Paginator } from '@/types/api';
import type { Promotion, PromotionFormInput, PromotionFilters, PromotionStatus } from '@/types/promotion.types';

/**
 * Service API for Promotions management.
 * (Dịch vụ API cho Quản lý Khuyến mãi / Mã giảm giá)
 */
export const promotionsApi = {
    /**
     * Get paginated promotions list with filters.
     */
    list: async (filters?: PromotionFilters): Promise<ApiResponse<Paginator<Promotion>>> => {
        return axiosClient.get(API_ENDPOINTS.PROMOTIONS.LIST, { params: filters });
    },

    /**
     * Get promotion detail by ID.
     */
    get: async (id: number): Promise<ApiResponse<Promotion>> => {
        return axiosClient.get(API_ENDPOINTS.PROMOTIONS.DETAIL(id));
    },

    /**
     * Create a new promotion.
     */
    create: async (data: PromotionFormInput): Promise<ApiResponse<Promotion>> => {
        return axiosClient.post(API_ENDPOINTS.PROMOTIONS.CREATE, data);
    },

    /**
     * Update a promotion.
     */
    update: async (id: number, data: Partial<PromotionFormInput>): Promise<ApiResponse<Promotion>> => {
        return axiosClient.put(API_ENDPOINTS.PROMOTIONS.UPDATE(id), data);
    },

    /**
     * Toggle promotion active/inactive status.
     */
    updateStatus: async (id: number, status: PromotionStatus): Promise<ApiResponse<null>> => {
        return axiosClient.patch(API_ENDPOINTS.PROMOTIONS.PATCH_STATUS(id), { status });
    },

    /**
     * Delete a promotion.
     */
    delete: async (id: number): Promise<ApiResponse<null>> => {
        return axiosClient.delete(API_ENDPOINTS.PROMOTIONS.DELETE(id));
    },
};

