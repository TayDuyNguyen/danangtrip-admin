import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { userApi } from "@/api/userApi";
import { mapUserList, mapUserItem } from "@/dataHelper/user.mapper";
import type { UserListFilters, UserBookingListResponse, UserRatingListResponse } from "@/dataHelper";
import { prepareSpreadsheetDownload, downloadBlobFile, readSpreadsheetErrorMessage } from "@/utils";

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (filters: UserListFilters, page: number, limit: number) =>
        [...userKeys.lists(), { ...filters, page, limit }] as const,
    details: () => [...userKeys.all, "detail"] as const,
    detail: (id: number | string) => [...userKeys.details(), id] as const,
    bookingsList: (id: number | string, page: number, limit: number) =>
        [...userKeys.all, "bookings", id, { page, limit }] as const,
    ratingsList: (id: number | string, page: number, limit: number) =>
        [...userKeys.all, "ratings", id, { page, limit }] as const,
};

export const useAdminUsersQuery = (
    filters: UserListFilters,
    page: number,
    limit: number
) => {
    return useQuery({
        queryKey: userKeys.list(filters, page, limit),
        queryFn: async () => {
            const response = await userApi.getList({ ...filters, page, per_page: limit });
            if (!response.data) throw new Error("Empty response");
            return mapUserList(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useAdminUserDetailQuery = (id: number | string) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: async () => {
            const response = await userApi.getDetail(id);
            if (!response.data) throw new Error("Empty response");
            return mapUserItem(response.data);
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useUserBookingsQuery = (id: number | string, page: number, limit: number) => {
    return useQuery<UserBookingListResponse>({
        queryKey: userKeys.bookingsList(id, page, limit),
        queryFn: async () => {
            const response = await userApi.getBookings(id, { page, per_page: limit });
            const paginator = response.data;
            if (!paginator) throw new Error("Empty response");
            return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: (paginator.data || []).map((b: any) => ({
                    id: b.id,
                    booking_code: b.booking_code,
                    final_amount: b.final_amount,
                    booking_status: b.booking_status,
                    created_at: b.created_at,
                    tour_schedule: b.items?.[0] ? {
                        tour: {
                            name: b.items[0].tour?.name || '—'
                        }
                    } : undefined
                })),
                meta: {
                    total: Number(paginator.total || 0),
                    current_page: Number(paginator.current_page || 1),
                    last_page: Number(paginator.last_page || 1),
                    per_page: Number(paginator.per_page || limit),
                }
            };
        },
        enabled: !!id,
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useUserRatingsQuery = (id: number | string, page: number, limit: number) => {
    return useQuery<UserRatingListResponse>({
        queryKey: userKeys.ratingsList(id, page, limit),
        queryFn: async () => {
            const response = await userApi.getRatings(id, { page, per_page: limit });
            const paginator = response.data;
            if (!paginator) throw new Error("Empty response");
            return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: (paginator.data || []).map((r: any) => ({
                    id: r.id,
                    rating: Number(r.score ?? r.rating ?? 0),
                    comment: r.comment,
                    status: r.status,
                    created_at: r.created_at,
                    tour: r.tour,
                    location: r.location,
                })),
                meta: {
                    total: Number(paginator.total || 0),
                    current_page: Number(paginator.current_page || 1),
                    last_page: Number(paginator.last_page || 1),
                    per_page: Number(paginator.per_page || limit),
                }
            };
        },
        enabled: !!id,
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useUserMutations = () => {
    const queryClient = useQueryClient();

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: number | string; role: string }) =>
            userApi.updateRole(id, { role }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number | string; status: string }) =>
            userApi.updateStatus(id, { status }),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            // Invalidate dashboard stats since banned users affect active users count
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number | string) =>
            userApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const exportMutation = useMutation({
        mutationFn: async (params: UserListFilters & { fallbackFilename: string }) => {
            const { fallbackFilename, ...exportParams } = params;
            try {
                const response = await userApi.export(exportParams);
                const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
                if (!prepared.ok) throw new Error(prepared.error);
                downloadBlobFile(prepared.blob, prepared.filename);
            } catch (error) {
                if (isAxiosError(error) && error.response?.data instanceof Blob) {
                    const message = await readSpreadsheetErrorMessage(error.response.data);
                    if (message) throw new Error(message);
                }
                throw error;
            }
        },
    });

    const createUserMutation = useMutation({
        mutationFn: (data: unknown) => userApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: unknown }) =>
            userApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    return {
        updateRoleMutation,
        updateStatusMutation,
        deleteMutation,
        exportMutation,
        createUserMutation,
        updateUserMutation,
    };
};
