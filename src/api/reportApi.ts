import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants';
import type { 
    RawRatingsReport, 
    RatingsReportFilters, 
    RawBookingsReport, 
    BookingsReportFilters,
    RevenueReportFilters,
    RawRevenueTrendResponse,
    RawTourRevenueDetail,
    RawRevenueReportItem,
    RawLocationReportItem,
    LocationReportFilters,
    RawUsersReport,
    UsersReportFilters,
    UsersExportFilters
} from '@/dataHelper/report.dataHelper';
import type { ApiResponse, RawLocation } from '@/types';
import type { AxiosResponse } from 'axios';

type RatingsReportRequestParams<T> = T & Pick<RatingsReportFilters, 'status' | 'type'>;

const sanitizeRatingsReportParams = <T extends object>(params: RatingsReportRequestParams<T>) => ({
    ...params,
    status: params.status !== 'all' ? params.status : undefined,
    type: params.type !== 'all' ? params.type : undefined,
});

type BookingsReportRequestParams<T> = T & Pick<BookingsReportFilters, 'status' | 'payment_status'>;

const sanitizeBookingsReportParams = <T extends object>(params: BookingsReportRequestParams<T>) => ({
    ...params,
    status: params.status !== 'all' ? params.status : undefined,
    payment_status: params.payment_status !== 'all' ? params.payment_status : undefined,
});

type RevenueReportRequestParams<T> = T & Pick<RevenueReportFilters, 'payment_gateway'>;

const sanitizeRevenueReportParams = <T extends object>(params: RevenueReportRequestParams<T>) => ({
    ...params,
    payment_gateway: params.payment_gateway !== 'all' ? params.payment_gateway : undefined,
});

export const reportApi = {
    getRatingsReport: (params: RatingsReportFilters): Promise<ApiResponse<RawRatingsReport>> =>
        axiosClient.get(API_ENDPOINTS.REPORTS.RATINGS, { params: sanitizeRatingsReportParams(params) }),

    exportRatingsReport: (params: RatingsReportFilters): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.EXPORT.RATINGS, {
            params: sanitizeRatingsReportParams(params),
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,

    getBookingsReport: (params: BookingsReportFilters): Promise<ApiResponse<RawBookingsReport>> =>
        axiosClient.get(API_ENDPOINTS.REPORTS.BOOKINGS, { params: sanitizeBookingsReportParams(params) }),

    exportBookingsReport: (params: BookingsReportFilters): Promise<AxiosResponse<Blob>> => {
        const { from, to, status, payment_status } = params;
        return axiosClient.get(API_ENDPOINTS.EXPORT.BOOKINGS, {
            params: sanitizeBookingsReportParams({
                date_from: from,
                date_to: to,
                status,
                payment_status,
            }),
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>;
    },

    getRevenueTrend: (params: { period?: string; from?: string; to?: string }): Promise<ApiResponse<RawRevenueTrendResponse>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.REVENUE, { params }),

    getRevenueDetail: (params: { from?: string; to?: string }): Promise<ApiResponse<RawTourRevenueDetail[]>> =>
        axiosClient.get(API_ENDPOINTS.REPORTS.REVENUE_DETAIL, { params }),

    getPaymentsList: (params: RevenueReportFilters): Promise<ApiResponse<{
        data: RawRevenueReportItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    }>> => {
        const { from, to, payment_gateway, page, per_page } = params;
        return axiosClient.get(API_ENDPOINTS.PAYMENTS.LIST, {
            params: sanitizeRevenueReportParams({
                date_from: from,
                date_to: to,
                payment_gateway,
                page,
                per_page,
            })
        });
    },

    exportRevenueReport: (params: RevenueReportFilters): Promise<AxiosResponse<Blob>> => {
        const { from, to, payment_gateway } = params;
        return axiosClient.get(API_ENDPOINTS.EXPORT.PAYMENTS, {
            params: sanitizeRevenueReportParams({
                date_from: from,
                date_to: to,
                payment_gateway,
            }),
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>;
    },

    approveRating: (id: string | number): Promise<ApiResponse<unknown>> =>
        axiosClient.patch(API_ENDPOINTS.RATINGS.APPROVE(id)),

    rejectRating: (id: string | number): Promise<ApiResponse<unknown>> =>
        axiosClient.patch(API_ENDPOINTS.RATINGS.REJECT(id)),

    deleteRating: (id: string | number): Promise<ApiResponse<unknown>> =>
        axiosClient.delete(API_ENDPOINTS.RATINGS.DELETE(id)),

    getLocationsReport: (params: { from?: string; to?: string }): Promise<ApiResponse<RawLocationReportItem[]>> =>
        axiosClient.get(API_ENDPOINTS.REPORTS.LOCATIONS, { params }),

    exportLocationsReport: (params: LocationReportFilters): Promise<AxiosResponse<Blob>> => {
        const { category_id, district, status } = params;
        return axiosClient.get(API_ENDPOINTS.EXPORT.LOCATIONS, {
            params: {
                category_id,
                district,
                status,
            },
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>;
    },

    getTopLocations: (params?: { limit?: number }): Promise<ApiResponse<RawLocation[]>> =>
        axiosClient.get(API_ENDPOINTS.DASHBOARD.TOP_LOCATIONS, { params }),

    getUsersReport: (params: UsersReportFilters): Promise<ApiResponse<RawUsersReport>> =>
        axiosClient.get(API_ENDPOINTS.REPORTS.USERS, { params }),

    exportUsersReport: (params: UsersExportFilters): Promise<AxiosResponse<Blob>> => {
        const { role, status } = params;
        return axiosClient.get(API_ENDPOINTS.EXPORT.USERS, {
            params: {
                role: role !== 'all' ? role : undefined,
                status: status !== 'all' ? status : undefined,
            },
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>;
    },
};
