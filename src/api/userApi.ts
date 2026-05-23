import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type {
    RawUserItem,
    RawUserListResponse,
    UserListFilters,
} from "@/dataHelper";
import type { ApiResponse } from "@/types";
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

    updateRole: (id: number | string, data: { role: string }): Promise<ApiResponse<RawUserItem>> =>
        axiosClient.patch(API_ENDPOINTS.USERS.UPDATE_ROLE(id), data),

    updateStatus: (id: number | string, data: { status: string }): Promise<ApiResponse<RawUserItem>> =>
        axiosClient.patch(API_ENDPOINTS.USERS.UPDATE_STATUS(id), data),

    delete: (id: number | string): Promise<ApiResponse<null>> =>
        axiosClient.delete(API_ENDPOINTS.USERS.DELETE(id)),

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
