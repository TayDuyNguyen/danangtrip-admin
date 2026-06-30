import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { ApiResponse, PaginationParams } from '@/types/api';
import type { RawCategory, CategoryInput } from '@/types/category';
import { categoryMapper } from '@/dataHelper/category.mapper';

function asRecord(payload: unknown): Record<string, unknown> {
    return payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
}

function unwrapApiData<T>(payload: unknown): T {
    const obj = asRecord(payload);
    if ('data' in obj && obj.data !== undefined) {
        return obj.data as T;
    }
    return obj as T;
}

function unwrapCategoryPayload(payload: unknown): RawCategory {
    const data = unwrapApiData<Record<string, unknown> | null>(payload);
    if (!data || typeof data !== 'object') {
        return {} as RawCategory;
    }
    if ('category' in data && data.category && typeof data.category === 'object') {
        return data.category as RawCategory;
    }
    return data as unknown as RawCategory;
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
        const payload = unwrapApiData<Record<string, unknown>>(response);
        return categoryMapper.normalizeListResponse(payload);
    },

    /**
     * Get category detail
     */
    getDetail: async (id: number): Promise<RawCategory> => {
        const response = await axiosClient.get<ApiResponse<RawCategory>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORY(id));
        return unwrapCategoryPayload(response);
    },

    /**
     * Create new category
     */
    create: async (data: CategoryInput): Promise<RawCategory> => {
        const response = await axiosClient.post<ApiResponse<RawCategory>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORIES, data);
        return unwrapCategoryPayload(response);
    },

    /**
     * Update category
     */
    update: async (id: number, data: CategoryInput): Promise<RawCategory> => {
        const response = await axiosClient.put<ApiResponse<RawCategory>>(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORY(id), data);
        return unwrapCategoryPayload(response);
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
        const response = await axiosClient.patch<ApiResponse<RawCategory>>(
            API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORY_STATUS(id),
            { status }
        );
        return unwrapCategoryPayload(response);
    },

    reorder: async (items: { id: number; sort_order: number }[]): Promise<void> => {
        await axiosClient.patch(API_ENDPOINTS.LOCATIONS.ADMIN_CATEGORIES_REORDER, { items });
    },
};
