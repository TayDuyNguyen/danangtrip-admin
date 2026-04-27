import { API_ENDPOINTS } from '@/constants';
import axiosClient from './axiosClient';
import type { 
    RawTourCategory, 
    TourCategory, 
    CategoryListParams
} from '@/dataHelper/tourCategory.dataHelper';
import { tourCategoryMapper } from '@/dataHelper/tourCategory.dataHelper';

/**
 * Service to handle category related API calls
 * (Service xử lý các cuộc gọi API liên quan đến danh mục)
 */
export const tourCategoryApi = {
    /**
     * Get all tour categories
     * (Lấy danh sách tất cả danh mục tour)
     */
    getCategories: async (params?: CategoryListParams) => {
        // Filter out empty params to avoid backend validation issues (Rule §14.5)
        const cleanParams: Record<string, unknown> = { ...params };
        if (!cleanParams.search) delete cleanParams.search;
        if (!cleanParams.status) delete cleanParams.status;

        const response = await axiosClient.get(API_ENDPOINTS.TOURS.ADMIN_CATEGORIES, { params: cleanParams });
        return tourCategoryMapper.normalizeListResponse(response.data);
    },

    /**
     * Create a new category
     * (Tạo danh mục mới)
     */
    createCategory: async (data: Partial<RawTourCategory>): Promise<TourCategory> => {
        const response = await axiosClient.post('/admin/tour-categories', data);
        return tourCategoryMapper.toViewModel(response.data as RawTourCategory);
    },

    /**
     * Update an existing category
     * (Cập nhật danh mục hiện có)
     */
    updateCategory: async (id: number, data: Partial<RawTourCategory>): Promise<TourCategory> => {
        const response = await axiosClient.put(API_ENDPOINTS.TOURS.ADMIN_CATEGORY(id), data);
        return tourCategoryMapper.toViewModel(response.data as RawTourCategory);
    },

    /**
     * Update category status specifically
     * (Cập nhật riêng trạng thái danh mục)
     */
    updateStatus: async (id: number, status: string): Promise<TourCategory> => {
        const response = await axiosClient.patch(`/admin/tour-categories/${id}/status`, { status });
        return tourCategoryMapper.toViewModel(response.data as RawTourCategory);
    },

    /**
     * Delete a category
     * (Xóa danh mục)
     */
    deleteCategory: async (id: number): Promise<void> => {
        await axiosClient.delete(API_ENDPOINTS.TOURS.ADMIN_CATEGORY(id));
    },

    /**
     * Reorder categories bulk
     * (Sắp xếp lại thứ tự danh mục hàng loạt)
     */
    reorderCategories: async (items: { id: number; sort_order: number }[]): Promise<void> => {
        await axiosClient.patch(API_ENDPOINTS.TOURS.ADMIN_CATEGORIES_REORDER, { items });
    }
};
