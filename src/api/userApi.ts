import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type {
    RawUserItem,
    RawUserListResponse,
    UserListFilters,
    UserBookingItem,
    UserRatingItem,
} from "@/dataHelper";
import type { ApiResponse, Paginator } from "@/types";
import type { AxiosResponse } from "axios";

export const userApi = {
    getList: (params: UserListFilters & { page?: number; per_page?: number }): Promise<ApiResponse<RawUserListResponse>> => {
        const { q, role, status, ...rest } = params;
        return axiosClient.get(API_ENDPOINTS.USERS.LIST, {
            params: {
                ...rest,
                q: q || undefined,
                role: role || undefined,
                status: status || undefined,
            },
        });
    },

    create: (data: unknown): Promise<ApiResponse<RawUserItem>> =>
        axiosClient.post(API_ENDPOINTS.USERS.LIST, data),

    update: (id: number | string, data: unknown): Promise<ApiResponse<RawUserItem>> =>
        axiosClient.put(API_ENDPOINTS.USERS.UPDATE(id), data),

    updateRole: (id: number | string, data: { role: string }): Promise<ApiResponse<RawUserItem>> =>
        axiosClient.patch(API_ENDPOINTS.USERS.UPDATE_ROLE(id), data),

    updateStatus: (id: number | string, data: { status: string }): Promise<ApiResponse<RawUserItem>> =>
        axiosClient.patch(API_ENDPOINTS.USERS.UPDATE_STATUS(id), data),

    delete: (id: number | string): Promise<ApiResponse<null>> =>
        axiosClient.delete(API_ENDPOINTS.USERS.DELETE(id)),

    getDetail: (id: number | string): Promise<ApiResponse<RawUserItem>> =>
        axiosClient.get(API_ENDPOINTS.USERS.DETAIL(id)),

    getBookings: (id: number | string, params: { page?: number; per_page?: number }): Promise<ApiResponse<Paginator<UserBookingItem>>> =>
        axiosClient.get(API_ENDPOINTS.USERS.BOOKINGS(id), { params }),

    getRatings: (id: number | string, params: { page?: number; per_page?: number }): Promise<ApiResponse<Paginator<UserRatingItem>>> =>
        axiosClient.get(API_ENDPOINTS.USERS.RATINGS(id), { params }),

    export: (params: UserListFilters): Promise<AxiosResponse<Blob>> => {
        const { q, role, status, ...rest } = params;
        return axiosClient.get(API_ENDPOINTS.EXPORT.USERS, {
            params: {
                ...rest,
                q: q || undefined,
                role: role || undefined,
                status: status || undefined,
            },
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>;
    },
};
