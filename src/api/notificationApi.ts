import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type { NotificationListFilters, RawNotificationListResponse, RawNotificationItem } from "@/types";
import type { ApiResponse } from "@/types";

export const notificationApi = {
    getList: (params: NotificationListFilters & { page?: number; per_page?: number }): Promise<ApiResponse<RawNotificationListResponse>> => {
        const { q, type, is_read, user_id, sort_by, sort_order, ...rest } = params;
        return axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, {
            params: {
                ...rest,
                search: q || undefined,
                type: type || undefined,
                is_read: is_read !== undefined && is_read !== "" ? (is_read === "1" ? "1" : "0") : undefined,
                user_id: user_id || undefined,
                sort_by: sort_by || undefined,
                sort_order: sort_order || undefined,
            },
        });
    },

    delete: (id: number | string): Promise<ApiResponse<null>> =>
        axiosClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id)),

    send: (data: {
        user_id: number;
        type: string;
        title: string;
        content: string;
        data?: Record<string, unknown> | null;
    }): Promise<ApiResponse<RawNotificationItem>> =>
        axiosClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND, data),

    sendAll: (data: {
        type: string;
        title: string;
        content: string;
        data?: Record<string, unknown> | null;
    }): Promise<ApiResponse<null>> =>
        axiosClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND_ALL, data),
};
export default notificationApi;
