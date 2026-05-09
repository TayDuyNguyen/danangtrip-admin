import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import locationApi from '@/api/locationApi';
import { mapLocationListData } from '@/dataHelper/location.mapper';
import type { LocationFilters } from '@/dataHelper/location.dataHelper';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const locationKeys = {
    all: ['locations'] as const,
    lists: () => [...locationKeys.all, 'list'] as const,
    list: (filters: LocationFilters) => [...locationKeys.lists(), filters] as const,
    stats: () => [...locationKeys.all, 'stats'] as const,
    filterCategories: () => [...locationKeys.all, 'filter-categories'] as const,
    filterDistricts: () => [...locationKeys.all, 'filter-districts'] as const,
};

export const useLocationsQuery = (filters: LocationFilters) => {
    return useQuery({
        queryKey: locationKeys.list(filters),
        queryFn: async () => {
            const [listRes, statsRes] = await Promise.all([
                locationApi.getLocations(filters),
                locationApi.getStats(),
            ]);

            const listPayload = listRes.data;
            const statsPayload = statsRes.data;

            if (!listPayload) {
                throw new Error('Empty location list response');
            }

            return mapLocationListData(listPayload, statsPayload);
        },
        placeholderData: (previousData) => previousData,
    });
};

export const useLocationFilterCategoriesQuery = () => {
    return useQuery({
        queryKey: locationKeys.filterCategories(),
        queryFn: async () => {
            const res = await locationApi.getPublicCategories();
            return res.data ?? [];
        },
        staleTime: 30 * 60 * 1000,
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

export const useDeleteLocationMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    return useMutation({
        mutationFn: (id: number) => locationApi.deleteLocation(id),
        onSuccess: () => {
            toast.success(t('messages.delete_success'));
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
            queryClient.invalidateQueries({ queryKey: locationKeys.filterDistricts() });
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
        onSuccess: () => {
            toast.success(t('messages.update_success'));
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
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
        },
        onError: (err) => {
            toast.error(err instanceof Error && err.message === 'partial' ? t('messages.bulk_partial_error') : t('messages.update_error'));
        },
    });
};
