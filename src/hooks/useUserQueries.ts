import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { mapUserList } from "@/dataHelper/user.mapper";
import type { UserListFilters } from "@/dataHelper";
import { prepareSpreadsheetDownload, downloadBlobFile } from "@/utils";

export const userKeys = {
    all: ["users"] as const,
    lists: () => [...userKeys.all, "list"] as const,
    list: (filters: UserListFilters, page: number, limit: number) =>
        [...userKeys.lists(), { ...filters, page, limit }] as const,
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

export const useUserMutations = () => {
    const queryClient = useQueryClient();

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: number | string; role: string }) =>
            userApi.updateRole(id, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number | string; status: string }) =>
            userApi.updateStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
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
            const response = await userApi.export(exportParams);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    return {
        updateRoleMutation,
        updateStatusMutation,
        deleteMutation,
        exportMutation,
    };
};
