import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { categoryApi } from '@/api/categoryApi';
import type { PaginationParams } from '@/types/api';
import type { CategoryInput } from '@/types/category';
import { getLocalizedApiErrorMessage } from '@/utils/apiError';

/**
 * Query keys for categories
 */
const categoryKeys = {
    all: ['categories'] as const,
    lists: () => [...categoryKeys.all, 'list'] as const,
    list: (params: PaginationParams) => [...categoryKeys.lists(), params] as const,
    details: () => [...categoryKeys.all, 'detail'] as const,
    detail: (id: number) => [...categoryKeys.details(), id] as const,
};

/**
 * Hook for fetching categories list
 */
export const useCategoriesQuery = (params: PaginationParams) => {
    return useQuery({
        queryKey: categoryKeys.list(params),
        queryFn: () => categoryApi.getList(params),
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Hook for category mutations (CRUD)
 */
export const useCategoryMutations = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    const invalidateLists = () => {
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: (data: CategoryInput) => categoryApi.create(data),
        onSuccess: () => {
            invalidateLists();
            toast.success(t('categories.messages.create_success'));
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('messages.create_error'), error));
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CategoryInput }) => 
            categoryApi.update(id, data),
        onSuccess: (_, variables) => {
            invalidateLists();
            queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
            toast.success(t('categories.messages.update_success'));
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('messages.update_error'), error));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => categoryApi.delete(id),
        onSuccess: () => {
            invalidateLists();
            toast.success(t('categories.messages.delete_success'));
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('categories.messages.delete_error'), error));
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: 'active' | 'inactive' }) => 
            categoryApi.patchStatus(id, status),
        onSuccess: () => {
            invalidateLists();
            toast.success(t('categories.messages.status_update_success'));
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('messages.update_error'), error));
        },
    });

    const reorderMutation = useMutation({
        mutationFn: (items: { id: number; sort_order: number }[]) => categoryApi.reorder(items),
        onSuccess: () => {
            invalidateLists();
            toast.success(t('categories.messages.update_success'));
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('messages.update_error'), error));
        },
    });

    return {
        createMutation,
        updateMutation,
        deleteMutation,
        statusMutation,
        reorderMutation,
    };
};
