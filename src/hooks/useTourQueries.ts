import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourApi } from '@/api/tourApi';
import type { TourFilters, TourListData } from '@/dataHelper/tour.dataHelper';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types';

/**
 * Key factory for tour queries
 */
export const tourKeys = {
    all: ['tours'] as const,
    stats: () => [...tourKeys.all, 'stats'] as const,
    categories: () => [...tourKeys.all, 'categories'] as const,
    lists: () => [...tourKeys.all, 'list'] as const,
    list: (filters: TourFilters, page: number, limit: number) => [...tourKeys.lists(), { filters, page, limit }] as const,
    details: () => [...tourKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...tourKeys.details(), id] as const,
};

/**
 * Hook for fetching tours list
 */
export const useToursQuery = (filters: TourFilters, page: number = 1, limit: number = 10) => {
    return useQuery({
        queryKey: tourKeys.list(filters, page, limit),
        queryFn: () => tourApi.getTours(filters, page, limit),
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Hook for fetching tour categories
 */
export const useTourCategoriesQuery = (scope: 'public' | 'admin' = 'public') => {
    return useQuery({
        queryKey: [...tourKeys.categories(), scope],
        queryFn: () => tourApi.getTourCategories(scope),
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
};

/**
 * Hook for fetching tour stats
 */
export const useTourStatsQuery = () => {
    return useQuery({
        queryKey: tourKeys.stats(),
        queryFn: () => tourApi.getTourStats(),
    });
};

/**
 * Hook for fetching a single tour detail
 */
export const useTourDetailQuery = (id: string | number | undefined) => {
    return useQuery({
        queryKey: tourKeys.detail(id || ''),
        queryFn: () => tourApi.getTour(id!),
        enabled: !!id,
    });
};

/**
 * Hook for tour mutations
 */
export const useTourMutations = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('tour');

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: tourKeys.all });
    };

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string | number; status: 'active' | 'inactive' | 'sold_out' }) => tourApi.updateStatus(id, status),
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: tourKeys.lists() });
            const previousQueries = queryClient.getQueriesData<TourListData>({ queryKey: tourKeys.lists() });
            
            queryClient.setQueriesData<TourListData>(
                { queryKey: tourKeys.lists() },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map(tour => tour.id === newData.id ? { ...tour, status: newData.status } : tour)
                    };
                }
            );
            return { previousQueries };
        },
        onSuccess: () => {
            toast.success(t('messages.status_update_success'));
        },
        onError: (error: AxiosError<ErrorResponse>, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error(error.response?.data?.message || t('messages.status_update_error'));
        },
        onSettled: () => {
            invalidate();
        }
    });

    const featuredMutation = useMutation({
        mutationFn: ({ id, is_featured }: { id: string | number; is_featured: boolean }) => tourApi.toggleFeatured(id, is_featured),
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: tourKeys.lists() });
            const previousQueries = queryClient.getQueriesData<TourListData>({ queryKey: tourKeys.lists() });
            
            queryClient.setQueriesData<TourListData>(
                { queryKey: tourKeys.lists() },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map(tour => tour.id === newData.id ? { ...tour, is_featured: newData.is_featured } : tour)
                    };
                }
            );
            return { previousQueries };
        },
        onSuccess: () => {
            toast.success(t('messages.featured_update_success'));
        },
        onError: (error: AxiosError<ErrorResponse>, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error(error.response?.data?.message || t('messages.featured_update_error'));
        },
        onSettled: () => {
            invalidate();
        }
    });

    const hotMutation = useMutation({
        mutationFn: ({ id, is_hot }: { id: string | number; is_hot: boolean }) => tourApi.toggleHot(id, is_hot),
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: tourKeys.lists() });
            const previousQueries = queryClient.getQueriesData<TourListData>({ queryKey: tourKeys.lists() });
            
            queryClient.setQueriesData<TourListData>(
                { queryKey: tourKeys.lists() },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        data: old.data.map(tour => tour.id === newData.id ? { ...tour, is_hot: newData.is_hot } : tour)
                    };
                }
            );
            return { previousQueries };
        },
        onSuccess: () => {
            toast.success(t('messages.hot_update_success'));
        },
        onError: (error: AxiosError<ErrorResponse>, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error(error.response?.data?.message || t('messages.hot_update_error'));
        },
        onSettled: () => {
            invalidate();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => tourApi.deleteTour(id),
        onSuccess: () => {
            invalidate();
            toast.success(t('messages.delete_success'));
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || t('messages.delete_error'));
        }
    });

    const exportMutation = useMutation({
        mutationFn: (filters: Partial<TourFilters>) => tourApi.exportExcel(filters),
        onSuccess: () => {
            toast.success(t('messages.export_success'));
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || t('messages.export_error'));
        }
    });

    const updateTourMutation = useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) => tourApi.updateTour(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: tourKeys.detail(variables.id) });
            invalidate();
            toast.success(t('messages.update_success'));
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || t('messages.update_error'));
        }
    });

    const createTourMutation = useMutation({
        mutationFn: (data: Record<string, unknown>) => tourApi.createTour(data),
        onSuccess: () => {
            invalidate();
            toast.success(t('messages.create_success'));
        },
        onError: () => {
            // Error is handled contextually in the page component
        }
    });

    return {
        createTourMutation,
        updateTourMutation,
        statusMutation,
        featuredMutation,
        hotMutation,
        deleteMutation,
        exportMutation
    };
};

/**
 * Upload mutations for tour media (forms should use this instead of calling tourApi directly).
 */
export const useTourUploadMutations = () => {
    const { t } = useTranslation('tour');

    const uploadThumbnailMutation = useMutation({
        mutationFn: (file: File) => tourApi.uploadImage(file),
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || t('messages.upload_error'));
        }
    });

    const uploadGalleryMutation = useMutation({
        mutationFn: (files: File[]) => tourApi.uploadImages(files),
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || t('messages.upload_error'));
        }
    });

    const deleteImageMutation = useMutation({
        mutationFn: (public_id: string) => tourApi.deleteUploadedImage(public_id),
        onSuccess: () => {
            // Usually we don't need a toast for silent background cleanup,
            // but for explicit user action it can be helpful.
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            toast.error(error.response?.data?.message || t('messages.delete_error'));
        }
    });

    return { uploadThumbnailMutation, uploadGalleryMutation, deleteImageMutation };
};
