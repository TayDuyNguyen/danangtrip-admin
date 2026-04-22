import type { AxiosResponse } from "axios";
import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type {
    RawDashboardStats,
    RawRevenueResponse,
    RawBookingTrendResponse,
    RawUserGrowthResponse,
    RawTopTour,
    RawBookingsResponse,
    RawBookingStatusCounts,
    RevenueParams,
    BookingTrendParams,
    UserGrowthParams,
    TopToursParams,
    BookingsParams,
    BookingsExportParams,
    BookingStatusCountsParams,
} from "@/dataHelper/dashboard.dataHelper";
import type { ApiResponse } from "@/types";

/**
 * Dashboard API — JSON endpoints return ApiResponse; bookings export returns AxiosResponse<Blob>.
 */
export const dashboardApi = {
    getStats: (): Promise<ApiResponse<RawDashboardStats>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.STATS),

    getBookingStatusCounts: (params?: BookingStatusCountsParams): Promise<ApiResponse<RawBookingStatusCounts>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.BOOKING_STATUS_COUNTS, { params }),

    getRevenue: (params: RevenueParams): Promise<ApiResponse<RawRevenueResponse>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.REVENUE, { params }),

    getBookingTrend: (params: BookingTrendParams): Promise<ApiResponse<RawBookingTrendResponse>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.BOOKING_TREND, { params }),

    getUserGrowth: (params: UserGrowthParams): Promise<ApiResponse<RawUserGrowthResponse>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.USER_GROWTH, { params }),

    getTopTours: (params: TopToursParams): Promise<ApiResponse<RawTopTour[]>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.TOP_TOURS, { params }),

    getBookings: (params: BookingsParams): Promise<ApiResponse<RawBookingsResponse>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.BOOKINGS, { params }),

    getBookingsExport: (params: BookingsExportParams): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.EXPORT.BOOKINGS, {
            params,
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,

    // Fallback methods for missing stats
    getPendingRatingsFallback: (): Promise<ApiResponse> =>
        axiosClient.get(API_ENDPOINTS.RATINGS.LIST, { params: { status: 'pending', per_page: 1 } }),

    getNewContactsFallback: (): Promise<ApiResponse> =>
        axiosClient.get(API_ENDPOINTS.CONTACTS.LIST, { params: { status: 'new', per_page: 1 } }),
};