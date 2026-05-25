import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type { BlogListFilters, RawBlogPostListResponse, RawBlogCategory, ApiResponse } from "@/types";

export const blogApi = {
    getList: (params: BlogListFilters & { page?: number; per_page?: number }): Promise<ApiResponse<RawBlogPostListResponse>> => {
        const { search, category_id, status, sort, order, ...rest } = params;
        const normalizedSearch = typeof search === "string" ? search.trim() : "";

        return axiosClient.get(API_ENDPOINTS.BLOG.LIST, {
            params: {
                ...rest,
                search: normalizedSearch || undefined,
                category_id: category_id || undefined,
                status: status || undefined,
                sort: sort || undefined,
                order: order || undefined,
            },
        });
    },

    getCategories: (): Promise<ApiResponse<RawBlogCategory[]>> =>
        axiosClient.get(API_ENDPOINTS.BLOG.CATEGORIES),

    updateStatus: (id: number | string, status: string): Promise<ApiResponse<void>> =>
        axiosClient.patch(API_ENDPOINTS.BLOG.PATCH_STATUS(id), { status }),

    delete: (id: number | string): Promise<ApiResponse<null>> =>
        axiosClient.delete(API_ENDPOINTS.BLOG.DELETE(id)),
};

export default blogApi;
