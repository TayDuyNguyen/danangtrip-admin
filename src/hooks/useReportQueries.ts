import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/api/reportApi';
import { mapRatingsReport, mapBookingsReport, mapRevenueReport } from '@/dataHelper/report.mapper';
import type { RatingsReportFilters, BookingsReportFilters, RevenueReportFilters } from '@/dataHelper/report.dataHelper';
import { prepareSpreadsheetDownload, downloadBlobFile } from '@/utils';
import { toast } from 'sonner';

export const reportKeys = {
    all: ['reports'] as const,
    ratingsReport: (params: RatingsReportFilters) => [...reportKeys.all, 'ratings', params] as const,
    bookingsReport: (params: BookingsReportFilters) => [...reportKeys.all, 'bookings', params] as const,
    revenueReport: (params: RevenueReportFilters) => [...reportKeys.all, 'revenue', params] as const,
};

/**
 * Query hook to fetch processed Ratings Report ViewModel
 */
export const useRatingsReportQuery = (params: RatingsReportFilters) => {
    return useQuery({
        queryKey: reportKeys.ratingsReport(params),
        queryFn: async () => {
            const response = await reportApi.getRatingsReport(params);
            return mapRatingsReport(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

/**
 * Query hook to fetch processed Bookings Report ViewModel
 */
export const useBookingsReportQuery = (params: BookingsReportFilters) => {
    return useQuery({
        queryKey: reportKeys.bookingsReport(params),
        queryFn: async () => {
            const response = await reportApi.getBookingsReport(params);
            return mapBookingsReport(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

/**
 * Query hook to fetch processed Revenue Report ViewModel.
 * Fetches trend, details, and payments list in parallel.
 */
export const useRevenueReportQuery = (params: RevenueReportFilters) => {
    const from = params.from || '';
    const to = params.to || '';
    
    return useQuery({
        queryKey: reportKeys.revenueReport(params),
        queryFn: async () => {
            const [trendRes, detailRes, paymentsRes] = await Promise.all([
                reportApi.getRevenueTrend({ period: 'day', from, to }),
                reportApi.getRevenueDetail({ from, to }),
                reportApi.getPaymentsList(params),
            ]);

            return mapRevenueReport(
                trendRes.data,
                detailRes.data,
                paymentsRes.data,
                { from, to }
            );
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

/**
 * Mutation and action hooks for Reports & Ratings Moderation
 */
export const useReportMutations = () => {
    const queryClient = useQueryClient();

    const exportMutation = useMutation({
        mutationFn: async ({ params, fallbackFilename }: { params: RatingsReportFilters; fallbackFilename: string }) => {
            const response = await reportApi.exportRatingsReport(params);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    const exportBookingsMutation = useMutation({
        mutationFn: async ({ params, fallbackFilename }: { params: BookingsReportFilters; fallbackFilename: string }) => {
            const response = await reportApi.exportBookingsReport(params);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    const exportRevenueMutation = useMutation({
        mutationFn: async ({ params, fallbackFilename }: { params: RevenueReportFilters; fallbackFilename: string }) => {
            const response = await reportApi.exportRevenueReport(params);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    const approveMutation = useMutation({
        mutationFn: (id: string | number) => reportApi.approveRating(id),
        onSuccess: () => {
            toast.success('Đã phê duyệt đánh giá thành công.');
            queryClient.invalidateQueries({ queryKey: reportKeys.all });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Sync dashboard pending ratings count
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi phê duyệt đánh giá.');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string | number) => reportApi.rejectRating(id),
        onSuccess: () => {
            toast.success('Đã từ chối đánh giá thành công.');
            queryClient.invalidateQueries({ queryKey: reportKeys.all });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Sync dashboard pending ratings count
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi từ chối đánh giá.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => reportApi.deleteRating(id),
        onSuccess: () => {
            toast.success('Đã xóa đánh giá vĩnh viễn.');
            queryClient.invalidateQueries({ queryKey: reportKeys.all });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Sync dashboard pending ratings count
        },
        onError: () => {
            toast.error('Có lỗi xảy ra khi xóa đánh giá.');
        }
    });

    return {
        exportMutation,
        exportBookingsMutation,
        exportRevenueMutation,
        approveMutation,
        rejectMutation,
        deleteMutation,
    };
};
