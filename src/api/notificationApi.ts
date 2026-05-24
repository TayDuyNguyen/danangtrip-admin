import axiosClient from "./axiosClient";
import { API_ENDPOINTS } from "@/constants";
import type { NotificationListFilters, RawNotificationListResponse } from "@/types";
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
};
export default notificationApi;
