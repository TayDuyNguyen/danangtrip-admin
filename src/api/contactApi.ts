import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type { 
    ContactListFilters, 
    RawContactItem, 
    RawContactListResponse 
} from "@/dataHelper";
import type { ApiResponse } from "@/types";
import type { AxiosResponse } from "axios";

export const contactApi = {
    getList: (params: ContactListFilters): Promise<ApiResponse<RawContactListResponse>> => {
        const { q, status, ...rest } = params;
        return axiosClient.get(API_ENDPOINTS.CONTACTS.LIST, {
            params: {
                ...rest,
                q: q || undefined,
                status: status || undefined,
            },
        });
    },

    getDetail: (id: number | string): Promise<ApiResponse<RawContactItem>> =>
        axiosClient.get(API_ENDPOINTS.CONTACTS.DETAIL(id)),

    reply: (id: number | string, data: { reply: string }): Promise<ApiResponse<null>> =>
        axiosClient.post(API_ENDPOINTS.CONTACTS.REPLY(id), data),

    delete: (id: number | string): Promise<ApiResponse<null>> =>
        axiosClient.delete(API_ENDPOINTS.CONTACTS.DELETE(id)),

    export: (params: ContactListFilters): Promise<AxiosResponse<Blob>> => {
        const { q, status, ...rest } = params;
        return axiosClient.get(API_ENDPOINTS.CONTACTS.EXPORT, {
            params: {
                ...rest,
                q: q || undefined,
                status: status || undefined,
            },
            responseType: 'blob',
        }) as Promise<AxiosResponse<Blob>>;
    },
};
