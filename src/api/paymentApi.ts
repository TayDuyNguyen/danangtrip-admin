import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type {
    AdminRawPaymentItem,
    AdminRawPaymentListResponse,
    PaymentListFilters,
} from "@/dataHelper";
import type { ApiResponse } from "@/types";
import type { AxiosResponse } from "axios";

export const paymentApi = {
    getList: (params: PaymentListFilters & { page?: number; per_page?: number }): Promise<ApiResponse<AdminRawPaymentListResponse>> =>
        axiosClient.get(API_ENDPOINTS.PAYMENTS.LIST, { params }),

    getDetail: (id: number | string): Promise<ApiResponse<AdminRawPaymentItem>> =>
        axiosClient.get(API_ENDPOINTS.PAYMENTS.DETAIL(id)),

    refund: (id: number | string, data: { refund_reason: string }): Promise<ApiResponse<AdminRawPaymentItem>> =>
        axiosClient.post(API_ENDPOINTS.PAYMENTS.REFUND(id), data),

    export: (params: PaymentListFilters): Promise<AxiosResponse<Blob>> =>
        axiosClient.get(API_ENDPOINTS.EXPORT.PAYMENTS, {
            params,
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>,
};
