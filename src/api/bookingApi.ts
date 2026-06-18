import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type {
    AdminRawBookingListResponse,
    AdminRawBookingStatusCounts,
    AdminRawBookingItem,
    BookingListFilters,
    RawBookingDetail,
} from "@/dataHelper/booking.dataHelper";
import type { ApiResponse } from "@/types";
import type { AxiosResponse } from "axios";

type BookingRequestParams = BookingListFilters & { page?: number; per_page?: number };

export interface AdminRefundPreview {
    paid_amount: number;
    refund_percent: number;
    refund_amount: number;
    cancellation_fee: number;
    policy_code: string;
    grace_period_applied: boolean;
}

const normalizeSortField = (sort?: string) => {
    if (!sort) return undefined;
    if (sort === 'amount') return 'total_amount';
    return sort;
};

const normalizePaymentStatusFilter = (status?: string) => {
    if (!status || status === 'all') return status;
    if (status === 'paid') return 'success';
    return status;
};

const toBookingRequestParams = (params: BookingRequestParams) => {
    const { date_from, date_to, sort, order, payment_status, ...rest } = params;

    return {
        ...rest,
        payment_status: normalizePaymentStatusFilter(payment_status),
        from_date: date_from || undefined,
        to_date: date_to || undefined,
        sort_by: normalizeSortField(sort),
        sort_order: order,
    };
};

export const bookingApi = {
    getList: (params: BookingListFilters & { page?: number; per_page?: number }): Promise<ApiResponse<AdminRawBookingListResponse>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.LIST, { params: toBookingRequestParams(params) }),

    getStatusCounts: (params?: Pick<BookingListFilters, 'user_id' | 'date_from' | 'date_to' | 'search'>): Promise<ApiResponse<AdminRawBookingStatusCounts>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.STATUS_COUNTS, { params: params ? toBookingRequestParams(params) : undefined }),

    updateStatus: (id: number | string, data: { booking_status: string; cancellation_reason?: string }): Promise<ApiResponse<AdminRawBookingItem>> =>
        axiosClient.patch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), data),

    confirmPayment: (id: number | string): Promise<ApiResponse<AdminRawBookingItem>> =>
        axiosClient.patch(API_ENDPOINTS.BOOKINGS.CONFIRM_PAYMENT(id)),

    export: (params: BookingListFilters): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.EXPORT.BOOKINGS, {
            params: toBookingRequestParams(params),
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,

    getDetail: (id: number | string): Promise<ApiResponse<RawBookingDetail>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.DETAIL(id)),

    getRefundPreview: (id: number | string): Promise<ApiResponse<AdminRefundPreview>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.REFUND_PREVIEW(id)),

    getInvoice: (id: number | string): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.INVOICE(id), {
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,
};

