import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourCategoryApi } from '@/api/tourCategoryApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { CategoryListParams, RawTourCategory } from '@/dataHelper/tourCategory.dataHelper';
import { getLocalizedApiErrorMessage } from '@/utils/apiError';

/**
 * Query Keys Factory
 */
export const tourCategoryKeys = {
    all: ['tour-categories'] as const,
    lists: () => [...tourCategoryKeys.all, 'list'] as const,
    list: (params: CategoryListParams) => [...tourCategoryKeys.lists(), params] as const,
    details: () => [...tourCategoryKeys.all, 'detail'] as const,
    detail: (id: number) => [...tourCategoryKeys.details(), id] as const,
};

/**
 * Hook to fetch tour categories
 */
export const useTourCategoriesQuery = (params: CategoryListParams = {}) => {
    return useQuery({
        queryKey: tourCategoryKeys.list(params),
        queryFn: () => tourCategoryApi.getCategories(params),
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Hook for Category Mutations (CRUD)
 */
export const useTourCategoryMutations = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('tour');

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: tourCategoryKeys.lists() });
    };

    // Create
    const createMutation = useMutation({
        mutationFn: (data: Partial<RawTourCategory>) => tourCategoryApi.createCategory(data),
        onSuccess: () => {
            toast.success(t('categories.messages.create_success'));
            invalidate();
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('categories.messages.create_error'), error));
        }
    });

    // Update
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<RawTourCategory> }) => 
            tourCategoryApi.updateCategory(id, data),
        onSuccess: () => {
            toast.success(t('categories.messages.update_success'));
            invalidate();
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('categories.messages.update_error'), error));
        }
    });

    // Update Status
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => 
            tourCategoryApi.updateStatus(id, status),
        onSuccess: () => {
            toast.success(t('categories.messages.update_success'));
            invalidate();
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('categories.messages.update_error'), error));
        }
    });

    // Delete
    const deleteMutation = useMutation({
        mutationFn: (id: number) => tourCategoryApi.deleteCategory(id),
        onSuccess: () => {
            toast.success(t('categories.messages.delete_success'));
            invalidate();
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('categories.messages.delete_error'), error));
        }
    });

    // Reorder Bulk
    const reorderMutation = useMutation({
        mutationFn: (items: { id: number; sort_order: number }[]) => tourCategoryApi.reorderCategories(items),
        onSuccess: () => {
            toast.success(t('categories.messages.update_success'));
            invalidate();
        },
        onError: (error: unknown) => {
            toast.error(getLocalizedApiErrorMessage(t('categories.messages.update_error'), error));
        }
    });

    return {
        createMutation,
        updateMutation,
        statusMutation,
        deleteMutation,
        reorderMutation
    };
};
