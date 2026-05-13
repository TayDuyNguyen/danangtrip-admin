import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import locationApi from '@/api/locationApi';
import { mapLocationListData, mapLocationToViewModel, mapRatingStats, mapRatingToViewModel } from '@/dataHelper/location.mapper';
import type { LocationFilters } from '@/dataHelper/location.dataHelper';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { PaginationParams } from '@/types';

import type { CreateLocationInput } from '@/validations/location.schema';

export const locationKeys = {
    all: ['locations'] as const,
    lists: () => [...locationKeys.all, 'list'] as const,
    list: (filters: LocationFilters) => [...locationKeys.lists(), filters] as const,
    stats: () => [...locationKeys.all, 'stats'] as const,
    filterCategories: () => [...locationKeys.all, 'filter-categories'] as const,
    filterDistricts: () => [...locationKeys.all, 'filter-districts'] as const,
    details: () => [...locationKeys.all, 'detail'] as const,
    detail: (id: string | number) => [...locationKeys.details(), id] as const,
    detailRaw: (id: string | number) => [...locationKeys.detail(id), 'raw'] as const,
    ratingStats: (id: string | number) => [...locationKeys.detail(id), 'rating-stats'] as const,
    ratings: (id: string | number, params?: PaginationParams) => [...locationKeys.detail(id), 'ratings', params] as const,
};

export const useLocationsQuery = (filters: LocationFilters) => {
    return useQuery({
        queryKey: locationKeys.list(filters),
        queryFn: async () => {
            const listRes = await locationApi.getLocations(filters);
            const listPayload = listRes.data;

            if (!listPayload) {
                throw new Error('Empty location list response');
            }

            return mapLocationListData(listPayload);
        },
        placeholderData: (previousData) => previousData,
    });
};

export const useLocationStatsQuery = () => {
    return useQuery({
        queryKey: locationKeys.stats(),
        queryFn: async () => {
            const res = await locationApi.getStats();
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useLocationCategoriesQuery = () => {
    return useQuery({
        queryKey: locationKeys.filterCategories(),
        queryFn: async () => {
            const res = await locationApi.getPublicCategories();
            return res.data ?? [];
        },
        staleTime: 30 * 60 * 1000,
    });
};

export const useLocationTagsQuery = () => {
    return useQuery({
        queryKey: [...locationKeys.all, 'tags'],
        queryFn: async () => {
            const res = await locationApi.getTags();
            return res.data ?? [];
        },
        staleTime: 30 * 60 * 1000,
    });
};

export const useLocationAmenitiesQuery = () => {
    return useQuery({
        queryKey: [...locationKeys.all, 'amenities'],
        queryFn: async () => {
            const res = await locationApi.getAmenities();
            return res.data ?? [];
        },
        staleTime: 30 * 60 * 1000,
    });
};

export const useCreateLocationMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    return useMutation({
        mutationFn: (data: CreateLocationInput) => locationApi.createLocation(data),
        onSuccess: () => {
            toast.success(t('messages.create_success'));
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
        },
        onError: () => {
            toast.error(t('messages.create_error'));
        },
    });
};

export const useLocationFilterDistrictsQuery = () => {
    return useQuery({
        queryKey: locationKeys.filterDistricts(),
        queryFn: async () => {
            const res = await locationApi.getAdminDistricts();
            return res.data ?? [];
        },
        staleTime: 30 * 60 * 1000,
    });
};

export const useLocationDetailQuery = (id: string | number | undefined) => {
    return useQuery({
        queryKey: locationKeys.detail(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Location ID is required');
            const res = await locationApi.getDetail(id);
            if (!res.data) throw new Error('Location not found');
            return mapLocationToViewModel(res.data);
        },
        enabled: !!id,
    });
};

export const useLocationDetailRawQuery = (id: string | number | undefined) => {
    return useQuery({
        queryKey: locationKeys.detailRaw(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Location ID is required');
            const res = await locationApi.getDetail(id);
            if (!res.data) throw new Error('Location not found');
            return res.data;
        },
        enabled: !!id,
    });
};

export const useLocationRatingStatsQuery = (id: string | number | undefined) => {
    return useQuery({
        queryKey: locationKeys.ratingStats(id || ''),
        queryFn: async () => {
            if (!id) throw new Error('Location ID is required');
            const res = await locationApi.getRatingStats(id);
            return mapRatingStats(res.data || {});
        },
        enabled: !!id,
    });
};

export const useLocationRatingsQuery = (id: string | number | undefined, params?: PaginationParams) => {
    return useQuery({
        queryKey: locationKeys.ratings(id || '', params),
        queryFn: async () => {
            if (!id) throw new Error('Location ID is required');
            const res = await locationApi.getRatings(id, params);
            const payload = res.data;
            if (!payload) throw new Error('Empty ratings response');
            
            return {
                ...payload,
                data: payload.data.map(mapRatingToViewModel),
            };
        },
        enabled: !!id,
    });
};

export const useUpdateLocationMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: Partial<CreateLocationInput> }) =>
            locationApi.updateLocation(id, data),
        onSuccess: (_data, variables) => {
            toast.success(t('messages.update_success'));
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.id) });
        },
        onError: () => {
            toast.error(t('messages.update_error'));
        },
    });
};

export const useDeleteLocationMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    return useMutation({
        mutationFn: (id: number) => locationApi.deleteLocation(id),
        onSuccess: (_data, id) => {
            toast.success(t('messages.delete_success'));
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
            queryClient.invalidateQueries({ queryKey: locationKeys.filterDistricts() });
            queryClient.invalidateQueries({ queryKey: locationKeys.detail(id) });
        },
        onError: () => {
            toast.error(t('messages.delete_error'));
        },
    });
};

export const useUpdateLocationFeaturedMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    return useMutation({
        mutationFn: ({ id, isFeatured }: { id: number; isFeatured: boolean }) =>
            locationApi.toggleFeatured(id, isFeatured),
        onSuccess: (_data, variables) => {
            toast.success(t('messages.update_success'));
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
            queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.id) });
        },
        onError: () => {
            toast.error(t('messages.update_error'));
        },
    });
};

export type BulkLocationAction = 'active' | 'inactive' | 'delete';

export const useBulkLocationActionsMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    return useMutation({
        mutationFn: async ({ ids, action }: { ids: number[]; action: BulkLocationAction }) => {
            if (action === 'delete') {
                const results = await Promise.allSettled(ids.map((id) => locationApi.deleteLocation(id)));
                const failed = results.filter((r) => r.status === 'rejected').length;
                if (failed > 0) {
                    throw new Error('partial');
                }
                return;
            }
            const results = await Promise.allSettled(ids.map((id) => locationApi.updateStatus(id, action)));
            const failed = results.filter((r) => r.status === 'rejected').length;
            if (failed > 0) {
                throw new Error('partial');
            }
        },
        onSuccess: (_data, variables) => {
            toast.success(
                variables.action === 'delete'
                    ? t('messages.bulk_delete_success')
                    : t('messages.bulk_update_success')
            );
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
            queryClient.invalidateQueries({ queryKey: locationKeys.filterDistricts() });
            variables.ids.forEach((id) => {
                queryClient.invalidateQueries({ queryKey: locationKeys.detail(id) });
            });
        },
        onError: (err) => {
            toast.error(err instanceof Error && err.message === 'partial' ? t('messages.bulk_partial_error') : t('messages.update_error'));
        },
    });
};

export const useLocationUploadMutations = () => {
    const { t } = useTranslation('location');

    return {
        uploadThumbnailMutation: useMutation({
            mutationFn: async (file: File) => {
                const formData = new FormData();
                formData.append('image', file);
                const res = await axiosClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                return res.data;
            },
            onError: () => toast.error(t('messages.upload_error')),
        }),
        uploadGalleryMutation: useMutation({
            mutationFn: async (files: File[]) => {
                const results = await Promise.all(
                    files.map(async (file) => {
                        const formData = new FormData();
                        formData.append('image', file);
                        const res = await axiosClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        return res.data;
                    })
                );
                return results;
            },
            onError: () => toast.error(t('messages.upload_error')),
        }),
        deleteImageMutation: useMutation({
            mutationFn: (publicId: string) =>
                axiosClient.delete(API_ENDPOINTS.UPLOAD.DELETE, { data: { public_id: publicId } }),
        }),
    };
};
