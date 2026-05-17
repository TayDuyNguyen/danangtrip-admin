import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type {
    AdminRawBookingListResponse,
    AdminRawBookingStatusCounts,
    AdminRawBookingItem,
    BookingListFilters,
} from "@/dataHelper/booking.dataHelper";
import type { ApiResponse } from "@/types";
import type { AxiosResponse } from "axios";

export const bookingApi = {
    getList: (params: BookingListFilters & { page?: number; per_page?: number }): Promise<ApiResponse<AdminRawBookingListResponse>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.LIST, { params }),

    getStatusCounts: (params?: { date_from?: string; date_to?: string; search?: string }): Promise<ApiResponse<AdminRawBookingStatusCounts>> =>
        axiosClient.get(API_ENDPOINTS.BOOKINGS.STATUS_COUNTS, { params }),

    updateStatus: (id: number | string, data: { booking_status: string; cancellation_reason?: string }): Promise<ApiResponse<AdminRawBookingItem>> =>
        axiosClient.patch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), data),

    export: (params: BookingListFilters): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.EXPORT.BOOKINGS, {
            params,
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,
};
