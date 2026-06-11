import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/api/bookingApi';
import { 
    mapBookingList, 
    mapBookingStatusCounts,
    mapBookingDetail
} from '@/dataHelper/booking.mapper';
import type { 
    BookingListFilters 
} from '@/dataHelper/booking.dataHelper';
import { 
    prepareSpreadsheetDownload, 
    downloadBlobFile,
    getContentDispositionHeader,
    parseContentDispositionFilename,
    sanitizeDownloadFilename
} from '@/utils';

export const bookingKeys = {
    all: ['bookings'] as const,
    lists: () => [...bookingKeys.all, 'list'] as const,
    list: (filters: BookingListFilters, page: number, limit: number) => 
        ([...bookingKeys.lists(), { ...filters, page, limit }] as const),
    stats: (params?: Record<string, unknown>) => [...bookingKeys.all, 'stats', params || {}] as const,
    detail: (id: string | number) => [...bookingKeys.all, 'detail', id] as const,
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

export const useAdminBookingDetailQuery = (id: number | string) => {
    return useQuery({
        queryKey: bookingKeys.detail(id),
        queryFn: async () => {
            const response = await bookingApi.getDetail(id);
            return mapBookingDetail(response.data);
        },
        enabled: !!id,
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useBookingMutations = () => {
    const queryClient = useQueryClient();

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, reason }: { id: number | string; status: string; reason?: string }) =>
            bookingApi.updateStatus(id, { booking_status: status, cancellation_reason: reason }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
            // Invalidate detail query as well to sync detail screen
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
            // Also invalidate dashboard stats since bookings affect them
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    const confirmPaymentMutation = useMutation({
        mutationFn: (id: number | string) =>
            bookingApi.confirmPayment(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
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

    const getInvoiceMutation = useMutation({
        mutationFn: async ({ id, fallbackFilename }: { id: number | string; fallbackFilename: string }) => {
            const response = await bookingApi.getInvoice(id);
            const blob = response.data;
            if (!(blob instanceof Blob)) {
                throw new Error('Invalid PDF response');
            }
            const cd = getContentDispositionHeader(response.headers as Record<string, unknown>);
            const fromHeader = parseContentDispositionFilename(cd);
            const filename = fromHeader ? sanitizeDownloadFilename(fromHeader) : fallbackFilename;
            downloadBlobFile(blob, filename);
        },
    });

    return {
        updateStatusMutation,
        confirmPaymentMutation,
        exportMutation,
        getInvoiceMutation,
    };
};

