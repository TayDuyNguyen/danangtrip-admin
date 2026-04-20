import { useQuery, useMutation } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import axiosClient from '@/api/axiosClient';
import { API_ENDPOINTS } from '@/constants';
import { prepareSpreadsheetDownload, downloadBlobFile } from '@/utils';
import {
    mapStats,
    mapRevenue,
    mapBookingTrend,
    mapUserGrowth,
    mapTopTours,
    mapBookings,
    mapBookingStatusCounts
} from '@/dataHelper/dashboard.mapper';
import type {
    DashboardStats,
    RevenueParams,
    BookingTrendParams,
    UserGrowthParams,
    TopToursParams,
    BookingsParams,
    BookingsExportParams,
    BookingStatusCountsParams,
} from '@/dataHelper/dashboard.dataHelper';

/**
 * Query keys for independent dashboard widgets
 */
export const dashboardKeys = {
    all: ['dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    bookingStatusCounts: (params?: BookingStatusCountsParams) =>
        [...dashboardKeys.all, 'bookingStatusCounts', params ?? {}] as const,
    revenue: (params: RevenueParams) => [...dashboardKeys.all, 'revenue', params] as const,
    bookingTrend: (params: BookingTrendParams) => [...dashboardKeys.all, 'bookingTrend', params] as const,
    userGrowth: (params: UserGrowthParams) => [...dashboardKeys.all, 'userGrowth', params] as const,
    topTours: (params: TopToursParams) => [...dashboardKeys.all, 'topTours', params] as const,
    bookings: (params: BookingsParams) => [...dashboardKeys.all, 'bookings', params] as const,
};

/**
 * Helper to fetch fallback counts for pending ratings and new contacts
 * if they are missing from the main stats response.
 */
const resolveStatsWithFallback = async (stats: DashboardStats): Promise<DashboardStats> => {
    if (stats.pending_ratings !== undefined && stats.new_contacts !== undefined) {
        return stats;
    }

    const [ratingsResult, contactsResult] = await Promise.allSettled([
        stats.pending_ratings === undefined
            ? axiosClient.get(API_ENDPOINTS.RATINGS.LIST, { params: { status: 'pending', per_page: 1 } })
            : Promise.resolve(null),
        stats.new_contacts === undefined
            ? axiosClient.get(API_ENDPOINTS.CONTACTS.LIST, { params: { status: 'new', per_page: 1 } })
            : Promise.resolve(null),
    ]);

    const getCount = (result: PromiseSettledResult<unknown>): number => {
        if (result.status === 'rejected') return 0; // Fallback to 0 if API request fails

        const responseData = (result.value as { data?: Record<string, unknown> })?.data;
        if (!responseData) return 0;

        // Unwrap nested { data: { data: ... } } if present
        const data = (responseData.data as Record<string, unknown>) || responseData;

        const total = data.total ?? (data.meta as Record<string, unknown>)?.total ?? (data.pagination as Record<string, unknown>)?.total ?? 0;
        return typeof total === 'number' ? total : 0;
    };

    return {
        ...stats,
        pending_ratings: stats.pending_ratings ?? getCount(ratingsResult),
        new_contacts: stats.new_contacts ?? getCount(contactsResult),
    };
};

/**
 * Independent Hooks
 */

export const useDashboardStatsQuery = (enabled = true) => {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: async () => {
            const response = await dashboardApi.getStats();
            const initialMap = mapStats(response.data as unknown);
            return resolveStatsWithFallback(initialMap);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled,
    });
};

export const useBookingStatusCountsQuery = (params?: BookingStatusCountsParams, enabled = true) => {
    return useQuery({
        queryKey: dashboardKeys.bookingStatusCounts(params),
        queryFn: async () => {
            const response = await dashboardApi.getBookingStatusCounts(params);
            return mapBookingStatusCounts(response.data);
        },
        staleTime: 1000 * 30,
        enabled,
    });
};

export const useRevenueQuery = (params: RevenueParams, enabled = true) => {
    return useQuery({
        queryKey: dashboardKeys.revenue(params),
        queryFn: async () => {
            const response = await dashboardApi.getRevenue(params);
            return mapRevenue(response.data as unknown);
        },
        staleTime: 1000 * 60 * 2,
        enabled,
    });
};

export const useBookingTrendQuery = (params: BookingTrendParams, enabled = true) => {
    return useQuery({
        queryKey: dashboardKeys.bookingTrend(params),
        queryFn: async () => {
            const response = await dashboardApi.getBookingTrend(params);
            return mapBookingTrend(response.data);
        },
        staleTime: 1000 * 60 * 2,
        enabled,
    });
};

export const useUserGrowthQuery = (params: UserGrowthParams, enabled = true) => {
    return useQuery({
        queryKey: dashboardKeys.userGrowth(params),
        queryFn: async () => {
            const response = await dashboardApi.getUserGrowth(params);
            return mapUserGrowth(response.data as unknown, params.year);
        },
        staleTime: 1000 * 60 * 10,
        enabled,
    });
};

export const useTopToursQuery = (params: TopToursParams, enabled = true) => {
    return useQuery({
        queryKey: dashboardKeys.topTours(params),
        queryFn: async () => {
            const response = await dashboardApi.getTopTours(params);
            return mapTopTours(response.data);
        },
        staleTime: 1000 * 60 * 5,
        enabled,
    });
};

export const useBookingsQuery = (params: BookingsParams, enabled = true) => {
    return useQuery({
        queryKey: dashboardKeys.bookings(params),
        queryFn: async () => {
            const response = await dashboardApi.getBookings(params);
            return mapBookings(response.data);
        },
        staleTime: 1000 * 30,
        enabled,
    });
};

/**
 * Mutation hook for exporting bookings as a spreadsheet.
 * Returns { mutate, isPending } — Page just calls mutate(params).
 */
export const useBookingsExportMutation = () => {
    return useMutation({
        mutationFn: async (params: BookingsExportParams & { fallbackFilename: string }) => {
            const { fallbackFilename, ...exportParams } = params;
            const response = await dashboardApi.getBookingsExport(exportParams);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });
};
