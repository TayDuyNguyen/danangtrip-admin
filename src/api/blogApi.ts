import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type {
    BlogListFilters,
    RawBlogPostListResponse,
    RawBlogCategory,
    ApiResponse,
    CreateBlogPostPayload,
    UpdateBlogPostPayload,
    CreateBlogCategoryPayload,
    RawBlogPost
} from "@/types";

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

    create: (payload: CreateBlogPostPayload): Promise<ApiResponse<RawBlogPost>> =>
        axiosClient.post(API_ENDPOINTS.BLOG.CREATE, payload),

    checkSlug: (slug: string): Promise<ApiResponse<{ exists: boolean }>> =>
        axiosClient.get(API_ENDPOINTS.BLOG.CHECK_SLUG, { params: { slug } }),

    getDetail: (id: number | string): Promise<ApiResponse<RawBlogPost>> =>
        axiosClient.get(API_ENDPOINTS.BLOG.DETAIL(id)),

    update: (id: number | string, payload: UpdateBlogPostPayload): Promise<ApiResponse<RawBlogPost>> =>
        axiosClient.put(API_ENDPOINTS.BLOG.UPDATE(id), payload),

    createCategory: (payload: CreateBlogCategoryPayload): Promise<ApiResponse<RawBlogCategory>> =>
        axiosClient.post(API_ENDPOINTS.BLOG.CREATE_CATEGORY, payload),

    reorderCategories: (items: Array<{ id: number; sort_order: number }>): Promise<ApiResponse<null>> =>
        axiosClient.patch(API_ENDPOINTS.BLOG.REORDER_CATEGORIES, { items }),

    updateCategory: (id: number | string, payload: CreateBlogCategoryPayload): Promise<ApiResponse<RawBlogCategory>> =>
        axiosClient.put(API_ENDPOINTS.BLOG.UPDATE_CATEGORY(id), payload),

    deleteCategory: (id: number | string): Promise<ApiResponse<null>> =>
        axiosClient.delete(API_ENDPOINTS.BLOG.DELETE_CATEGORY(id)),

    updateStatus: (id: number | string, status: string): Promise<ApiResponse<void>> =>
        axiosClient.patch(API_ENDPOINTS.BLOG.PATCH_STATUS(id), { status }),

    delete: (id: number | string): Promise<ApiResponse<null>> =>
        axiosClient.delete(API_ENDPOINTS.BLOG.DELETE(id)),
};
