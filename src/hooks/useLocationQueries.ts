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
};

export const useLocationsQuery = (filters: LocationFilters) => {
    return useQuery({
        queryKey: locationKeys.list(filters),
        queryFn: async () => {
            const [listRes, statsRes] = await Promise.all([
                locationApi.getLocations(filters),
                locationApi.getStats()
            ]);
            
            return mapLocationListData(listRes.data, statsRes.data);
        },
        placeholderData: (previousData) => previousData,
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
        },
        onError: () => {
            toast.error(t('messages.delete_error'));
        }
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
        },
        onError: () => {
            toast.error(t('messages.update_error'));
        }
    });
};

export const useBulkUpdateLocationStatusMutation = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('location');

    return useMutation({
        mutationFn: ({ ids, status }: { ids: number[]; status: string }) => 
            locationApi.bulkUpdateStatus(ids, status),
        onSuccess: () => {
            toast.success(t('messages.bulk_update_success'));
            queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
        },
        onError: () => {
            toast.error(t('messages.update_error'));
        }
    });
};
