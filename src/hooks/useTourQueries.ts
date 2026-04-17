import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tourApi } from '@/api/tourApi';
import type { TourFilters } from '@/dataHelper/tour.dataHelper';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types';

/**
 * Key factory for tour queries
 */
export const tourKeys = {
    all: ['tours'] as const,
    lists: () => [...tourKeys.all, 'list'] as const,
    list: (filters: TourFilters, page: number) => [...tourKeys.lists(), { filters, page }] as const,
    details: () => [...tourKeys.all, 'detail'] as const,
    detail: (id: string) => [...tourKeys.details(), id] as const,
};

/**
 * Hook for fetching tours list
 */
export const useToursQuery = (filters: TourFilters, page: number = 1) => {
    return useQuery({
        queryKey: tourKeys.list(filters, page),
        queryFn: () => tourApi.getTours(filters, page),
        placeholderData: (previousData) => previousData,
    });
};

/**
 * Hook for tour mutations (delete, etc.)
 */
export const useTourMutations = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('tour');

    const deleteMutation = useMutation({
        mutationFn: (id: string) => tourApi.deleteTour(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tourKeys.lists() });
            toast.success(t('delete_success'));
        },
        onError: (error: AxiosError<ErrorResponse>) => {
            const serverMsg = error.response?.data?.message || t('delete_error');
            toast.error(serverMsg);
        }
    });

    return {
        deleteMutation
    };
};
