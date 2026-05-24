import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notificationApi";
import { mapNotificationList } from "@/dataHelper/notification.mapper";
import type { NotificationListFilters } from "@/types";

export const notificationKeys = {
    all: ["notifications"] as const,
    lists: () => [...notificationKeys.all, "list"] as const,
    list: (filters: NotificationListFilters, page: number, limit: number) =>
        [...notificationKeys.lists(), { ...filters, page, limit }] as const,
};

export const useAdminNotificationsQuery = (
    filters: NotificationListFilters,
    page: number,
    limit: number
) => {
    return useQuery({
        queryKey: notificationKeys.list(filters, page, limit),
        queryFn: async () => {
            const response = await notificationApi.getList({ ...filters, page, per_page: limit });
            if (!response.data) throw new Error("Empty response");
            return mapNotificationList(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useNotificationMutations = () => {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: number | string) =>
            notificationApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const sendMutation = useMutation({
        mutationFn: (data: {
            user_id: number;
            type: string;
            title: string;
            content: string;
            data?: Record<string, unknown> | null;
        }) => notificationApi.send(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const sendAllMutation = useMutation({
        mutationFn: (data: {
            type: string;
            title: string;
            content: string;
            data?: Record<string, unknown> | null;
        }) => notificationApi.sendAll(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    return {
        deleteMutation,
        sendMutation,
        sendAllMutation,
    };
};
