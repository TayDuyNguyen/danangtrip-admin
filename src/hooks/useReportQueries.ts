import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/api/reportApi';
import locationApi from '@/api/locationApi';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { mapRatingsReport, mapBookingsReport, mapRevenueReport, mapLocationsReport, mapUsersReport } from '@/dataHelper/report.mapper';
import type { RatingsReportFilters, BookingsReportFilters, RevenueReportFilters, LocationReportFilters, UsersReportFilters, UsersExportFilters } from '@/dataHelper/report.dataHelper';
import { prepareSpreadsheetDownload, downloadBlobFile } from '@/utils';
import { toast } from 'sonner';

export const reportKeys = {
    all: ['reports'] as const,
    ratingsReport: (params: RatingsReportFilters) => [...reportKeys.all, 'ratings', params] as const,
    bookingsReport: (params: BookingsReportFilters) => [...reportKeys.all, 'bookings', params] as const,
    revenueReport: (params: RevenueReportFilters) => [...reportKeys.all, 'revenue', params] as const,
    locationsReport: (params: { from?: string; to?: string }) => [...reportKeys.all, 'locations', params] as const,
    usersReport: (params: UsersReportFilters) => [...reportKeys.all, 'users', params] as const,
};

/**
 * Query hook to fetch processed Ratings Report ViewModel
 */
export const useRatingsReportQuery = (params: RatingsReportFilters & { date_from?: string; date_to?: string }) => {
    const reportParams = {
        ...params,
        from: params.from || params.date_from,
        to: params.to || params.date_to,
    };
    return useQuery({
        queryKey: reportKeys.ratingsReport(reportParams),
        queryFn: async () => {
            const response = await reportApi.getRatingsReport(reportParams);
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
 * Query hook to fetch processed Locations Report ViewModel.
 * Fetches stats, distribution, and paginated locations (table) in parallel.
 */
export const useLocationsReportQuery = (
    reportParams: { from?: string; to?: string },
    tableParams: LocationReportFilters & { sort_by?: string; sort_order?: string }
) => {
    const from = reportParams.from || '';
    const to = reportParams.to || '';

    return useQuery({
        queryKey: [...reportKeys.locationsReport(reportParams), tableParams],
        queryFn: async () => {
            let locationsResData;
            if (tableParams.sort_by === 'favorite_count') {
                const topRes = await reportApi.getTopLocations({ limit: tableParams.per_page });
                locationsResData = {
                    data: topRes.data ?? [],
                    current_page: 1,
                    last_page: 1,
                    per_page: tableParams.per_page || 10,
                    total: (topRes.data ?? []).length,
                };
            } else {
                const locRes = await axiosClient.get(API_ENDPOINTS.LOCATIONS.LIST, {
                    params: {
                        page: tableParams.page,
                        per_page: tableParams.per_page,
                        category_id: tableParams.category_id !== 'all' ? tableParams.category_id : undefined,
                        district: tableParams.district !== 'all' ? tableParams.district : undefined,
                        status: tableParams.status !== 'all' ? tableParams.status : undefined,
                        sort_by: tableParams.sort_by,
                        sort_order: tableParams.sort_order,
                    }
                });
                locationsResData = locRes.data;
            }

            const [statsRes, distRes] = await Promise.all([
                locationApi.getStats(),
                reportApi.getLocationsReport({ from, to }),
            ]);

            return mapLocationsReport(
                statsRes.data,
                distRes.data,
                locationsResData,
            );
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

/**
 * Query hook to fetch processed Users Report ViewModel
 */
export const useUsersReportQuery = (params: UsersReportFilters, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: reportKeys.usersReport(params),
        queryFn: async () => {
            const response = await reportApi.getUsersReport(params);
            return mapUsersReport(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
        enabled: options?.enabled ?? true,
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

    const exportLocationsMutation = useMutation({
        mutationFn: async ({ params, fallbackFilename }: { params: LocationReportFilters; fallbackFilename: string }) => {
            const response = await reportApi.exportLocationsReport(params);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    const exportUsersMutation = useMutation({
        mutationFn: async ({ params, fallbackFilename }: { params: UsersExportFilters; fallbackFilename: string }) => {
            const response = await reportApi.exportUsersReport(params);
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
        exportLocationsMutation,
        exportUsersMutation,
        approveMutation,
        rejectMutation,
        deleteMutation,
    };
};

