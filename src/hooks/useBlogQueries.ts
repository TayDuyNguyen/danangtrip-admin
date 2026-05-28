import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogApi } from "@/api/blogApi";
import { mapBlogPostList, mapBlogCategory, mapBlogPost } from "@/dataHelper/blog.mapper";
import type { BlogListFilters, CreateBlogPostPayload, UpdateBlogPostPayload, CreateBlogCategoryPayload } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import axiosClient from "@/api/axiosClient";
import { API_ENDPOINTS } from "@/constants";
import { mapApiErrorMessage } from "@/utils";

export const blogKeys = {
    all: ["blogs"] as const,
    lists: () => [...blogKeys.all, "list"] as const,
    list: (filters: BlogListFilters, page: number, limit: number) =>
        [...blogKeys.lists(), { ...filters, page, limit }] as const,
    categories: () => [...blogKeys.all, "categories"] as const,
    details: () => [...blogKeys.all, "detail"] as const,
    detail: (id: string | number) => [...blogKeys.details(), id] as const,
};

export const useAdminBlogPostsQuery = (
    filters: BlogListFilters,
    page: number,
    limit: number
) => {
    return useQuery({
        queryKey: blogKeys.list(filters, page, limit),
        queryFn: async () => {
            const response = await blogApi.getList({ ...filters, page, per_page: limit });
            if (!response.data) throw new Error("Empty response");
            return mapBlogPostList(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useAdminBlogPostQuery = (id: string | number | undefined) => {
    return useQuery({
        queryKey: blogKeys.detail(id || ""),
        queryFn: async () => {
            if (!id) throw new Error("No blog post ID provided");
            const response = await blogApi.getDetail(id);
            if (!response.data) throw new Error("Empty response");
            return mapBlogPost(response.data);
        },
        enabled: !!id,
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useBlogCategoriesQuery = () => {
    return useQuery({
        queryKey: blogKeys.categories(),
        queryFn: async () => {
            const response = await blogApi.getCategories();
            if (!response.data) throw new Error("Empty response");
            const data = response.data;
            return Array.isArray(data) ? data.map(mapBlogCategory) : [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useCreateBlogPostMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation("blog");

    return useMutation({
        mutationFn: (payload: CreateBlogPostPayload) => blogApi.create(payload),
        onSuccess: (response) => {
            const status = response.data?.status;
            if (status === "published") {
                toast.success(t("toast.publish_success"));
            } else {
                toast.success(t("toast.draft_success"));
            }
            queryClient.invalidateQueries({ queryKey: blogKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
        onError: () => {
            toast.error(t("toast.network_error"));
        },
    });
};

export const useUpdateBlogPostMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation("blog");

    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: UpdateBlogPostPayload }) =>
            blogApi.update(id, payload),
        onSuccess: () => {
            toast.success(t("toast.update_success"));
            queryClient.invalidateQueries({ queryKey: blogKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
        onError: () => {
            toast.error(t("toast.update_error"));
        },
    });
};

export const useCreateBlogCategoryMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation("blog");

    return useMutation({
        mutationFn: (payload: CreateBlogCategoryPayload) => blogApi.createCategory(payload),
        onSuccess: () => {
            toast.success(t("toast.category_create_success"));
            queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
        },
        onError: (err: unknown) => {
            toast.error(mapApiErrorMessage(t("toast.network_error"), err));
        },
    });
};

export const useUpdateBlogCategoryMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation("blog");

    return useMutation({
        mutationFn: ({ id, payload }: { id: number | string; payload: CreateBlogCategoryPayload }) =>
            blogApi.updateCategory(id, payload),
        onSuccess: () => {
            toast.success(t("toast.category_update_success"));
            queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
        },
        onError: (err: unknown) => {
            toast.error(mapApiErrorMessage(t("toast.network_error"), err));
        },
    });
};

export const useDeleteBlogCategoryMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation("blog");

    return useMutation({
        mutationFn: (id: number | string) => blogApi.deleteCategory(id),
        onSuccess: () => {
            toast.success(t("toast.category_delete_success"));
            queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
        },
        onError: (err: unknown) => {
            toast.error(mapApiErrorMessage(t("toast.network_error"), err));
        },
    });
};

export const useReorderBlogCategoriesMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation("blog");

    return useMutation({
        mutationFn: (items: Array<{ id: number; sort_order: number }>) => blogApi.reorderCategories(items),
        onSuccess: () => {
            toast.success(t("category.reorder.toast_success"));
            queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
        },
        onError: (err: unknown) => {
            toast.error(mapApiErrorMessage(t("category.reorder.toast_error"), err));
        },
    });
};

export const useBlogUploadMutations = () => {
    const { t } = useTranslation("blog");

    return {
        uploadImageMutation: useMutation({
            mutationFn: async (file: File) => {
                const formData = new FormData();
                formData.append("image", file);
                const res = await axiosClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return res.data; // contains url, public_id, asset_id
            },
            onError: () => {
                toast.error(t("toast.upload_error"));
            },
        }),
        deleteImageMutation: useMutation({
            mutationFn: (publicId: string) =>
                axiosClient.delete(API_ENDPOINTS.UPLOAD.DELETE, { data: { public_id: publicId } }),
        }),
    };
};

export const useBlogMutations = () => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: number | string) =>
            blogApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number | string; status: string }) =>
            blogApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    return {
        deleteMutation,
        updateStatusMutation,
    };
};
