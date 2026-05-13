import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { ApiResponse, PaginationParams } from '@/types/api';
import type { RawCategory, CategoryInput } from '@/types/category';
import { categoryMapper } from '@/dataHelper/category.mapper';

function unwrapApiData<T>(payload: T | ApiResponse<T>): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as ApiResponse<T>).data as T;
    }

    return payload as T;
}

/**
 * API service for Categories
 */
export const categoryApi = {
    /**
     * Get list of categories for admin
     */
    getList: async (params?: PaginationParams) => {
        const cleanParams: Record<string, unknown> = { ...params };

        if (!cleanParams.q) delete cleanParams.q;
        if (!cleanParams.search) delete cleanParams.search;
        if (!cleanParams.status) delete cleanParams.status;

        const response = await axiosClient.get(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORIES, { params: cleanParams });
        const payload = unwrapApiData<Record<string, unknown>>(response as unknown as Record<string, unknown>);
        return categoryMapper.normalizeListResponse(payload);
    },

    /**
     * Get category detail
     */
    getDetail: async (id: number): Promise<RawCategory> => {
        const response = await axiosClient.get<ApiResponse<RawCategory>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORY(id)) as unknown as ApiResponse<RawCategory>;
        return unwrapApiData<RawCategory>(response);
    },

    /**
     * Create new category
     */
    create: async (data: CategoryInput): Promise<RawCategory> => {
        const response = await axiosClient.post<ApiResponse<RawCategory>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORIES, data) as unknown as ApiResponse<RawCategory>;
        return unwrapApiData<RawCategory>(response);
    },

    /**
     * Update category
     */
    update: async (id: number, data: CategoryInput): Promise<RawCategory> => {
        const response = await axiosClient.put<ApiResponse<RawCategory>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORY(id), data) as unknown as ApiResponse<RawCategory>;
        return unwrapApiData<RawCategory>(response);
    },

    /**
     * Delete category
     */
    delete: async (id: number): Promise<void> => {
        await axiosClient.delete<ApiResponse<void>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORY(id));
    },

    /**
     * Patch category status
     */
    patchStatus: async (id: number, status: 'active' | 'inactive'): Promise<RawCategory> => {
        const response = await axiosClient.patch<ApiResponse<RawCategory>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORY_STATUS(id), { status }) as unknown as ApiResponse<RawCategory>;
        return unwrapApiData<RawCategory>(response);
    },

    reorder: async (items: { id: number; sort_order: number }[]): Promise<void> => {
        await axiosClient.patch(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORIES_REORDER, { items });
    },
};
