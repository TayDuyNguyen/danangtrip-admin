import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/api/bookingApi';
import { 
    mapBookingList, 
    mapBookingStatusCounts 
} from '@/dataHelper/booking.mapper';
import type { 
    BookingListFilters 
} from '@/dataHelper/booking.dataHelper';
import { prepareSpreadsheetDownload, downloadBlobFile } from '@/utils';

export const bookingKeys = {
    all: ['bookings'] as const,
    lists: () => [...bookingKeys.all, 'list'] as const,
    list: (filters: BookingListFilters, page: number, limit: number) => 
        ([...bookingKeys.lists(), { ...filters, page, limit }] as const),
    stats: (params?: Record<string, unknown>) => [...bookingKeys.all, 'stats', params || {}] as const,
};

export const useAdminBookingsQuery = (filters: BookingListFilters, page: number, limit: number) => {
    return useQuery({
        queryKey: bookingKeys.list(filters, page, limit),
        queryFn: async () => {
            const response = await bookingApi.getList({ ...filters, page, per_page: limit });
            return mapBookingList(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useAdminBookingStatsQuery = (params?: Record<string, unknown>) => {
    return useQuery({
        queryKey: bookingKeys.stats(params),
        queryFn: async () => {
            const response = await bookingApi.getStatusCounts(params);
            return mapBookingStatusCounts(response.data);
        },
        staleTime: 1000 * 60, // 1 minute
    });
};

export const useBookingMutations = () => {
    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, reason }: { id: number | string; status: string; reason?: string }) =>
            bookingApi.updateStatus(id, { booking_status: status, cancellation_reason: reason }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
            // Also invalidate dashboard stats since bookings affect them
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    const exportMutation = useMutation({
        mutationFn: async (params: BookingListFilters & { fallbackFilename: string }) => {
            const { fallbackFilename, ...exportParams } = params;
            const response = await bookingApi.export(exportParams);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    return {
        updateStatusMutation,
        exportMutation,
    };
};
