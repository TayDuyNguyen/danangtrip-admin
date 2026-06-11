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

const toBookingRequestParams = (params: BookingRequestParams) => {
    const { date_from, date_to, sort, order, ...rest } = params;

    return {
        ...rest,
        from_date: date_from || undefined,
        to_date: date_to || undefined,
        sort_by: sort,
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

    getInvoice: (id: number | string): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.INVOICE(id), {
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,
};

