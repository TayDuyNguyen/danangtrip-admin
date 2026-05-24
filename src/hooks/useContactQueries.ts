import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactApi } from "@/api/contactApi";
import { mapContactList, mapContactItem } from "@/dataHelper/contact.mapper";
import type { ContactListFilters } from "@/dataHelper";
import { prepareSpreadsheetDownload, downloadBlobFile } from "@/utils";

export const contactKeys = {
    all: ["contacts"] as const,
    lists: () => [...contactKeys.all, "list"] as const,
    list: (filters: ContactListFilters, page: number, limit: number) =>
        [...contactKeys.lists(), { ...filters, page, limit }] as const,
    details: () => [...contactKeys.all, "detail"] as const,
    detail: (id: number | string) => [...contactKeys.details(), id] as const,
};

export const useAdminContactsQuery = (
    filters: ContactListFilters,
    page: number,
    limit: number
) => {
    return useQuery({
        queryKey: contactKeys.list(filters, page, limit),
        queryFn: async () => {
            const response = await contactApi.getList({ ...filters, page, per_page: limit });
            if (!response.data) throw new Error("Empty response");
            return mapContactList(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useContactDetailQuery = (id: number | string) => {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: contactKeys.detail(id),
        queryFn: async () => {
            const response = await contactApi.getDetail(id);
            if (!response.data) throw new Error("Empty response");
            const item = mapContactItem(response.data);
            
            // Proactive list update if the contact was unread
            // If it was 'new', it gets marked as 'read' on the server.
            // We invalidate the list so the badges stay updated.
            if (response.data.status === 'new') {
                queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
                queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            }
            
            return item;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useContactMutations = () => {
    const queryClient = useQueryClient();

    const replyMutation = useMutation({
        mutationFn: ({ id, reply }: { id: number | string; reply: string }) =>
            contactApi.reply(id, { reply }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: contactKeys.all });
            queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number | string) =>
            contactApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contactKeys.all });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const exportMutation = useMutation({
        mutationFn: async (params: ContactListFilters & { fallbackFilename: string }) => {
            const { fallbackFilename, ...exportParams } = params;
            const response = await contactApi.export(exportParams);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    return {
        replyMutation,
        deleteMutation,
        exportMutation,
    };
};
