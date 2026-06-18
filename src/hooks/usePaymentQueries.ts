import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@/api/paymentApi";
import { mapPaymentList, mapPaymentItem } from "@/dataHelper/payment.mapper";
import type { PaymentListFilters } from "@/dataHelper";
import { prepareSpreadsheetDownload, downloadBlobFile } from "@/utils";

export const paymentKeys = {
    all: ["payments"] as const,
    lists: () => [...paymentKeys.all, "list"] as const,
    list: (filters: PaymentListFilters, page: number, limit: number) =>
        [...paymentKeys.lists(), { ...filters, page, limit }] as const,
    details: () => [...paymentKeys.all, "detail"] as const,
    detail: (id: number | string) => [...paymentKeys.details(), id] as const,
};

export const useAdminPaymentsQuery = (
    filters: PaymentListFilters,
    page: number,
    limit: number
) => {
    return useQuery({
        queryKey: paymentKeys.list(filters, page, limit),
        queryFn: async () => {
            const response = await paymentApi.getList({ ...filters, page, per_page: limit });
            if (!response.data) throw new Error("Empty response");
            return mapPaymentList(response.data);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useAdminPaymentDetailQuery = (id: number | string, enabled = true) => {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: async () => {
            const response = await paymentApi.getDetail(id);
            if (!response.data) throw new Error("Payment not found");
            return mapPaymentItem(response.data);
        },
        staleTime: 1000 * 60, // 1 minute
        enabled: !!id && enabled,
    });
};

export const usePaymentMutations = () => {
    const queryClient = useQueryClient();

    const refundMutation = useMutation({
        mutationFn: ({ id, ...data }: {
            id: number | string;
            refund_reason: string;
            refund_bank_code: string;
            refund_account_no: string;
            refund_account_name: string;
            transfer_reference: string;
            approved_amount?: number;
        }) => paymentApi.refund(id, data),
        onSuccess: () => {
            // Invalidate payments list and details
            queryClient.invalidateQueries({ queryKey: paymentKeys.all });
            // Invalidate dashboard stats since refunds affect revenue
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const exportMutation = useMutation({
        mutationFn: async (params: PaymentListFilters & { fallbackFilename: string }) => {
            const { fallbackFilename, ...exportParams } = params;
            const response = await paymentApi.export(exportParams);
            const prepared = await prepareSpreadsheetDownload(response, fallbackFilename);
            if (!prepared.ok) throw new Error(prepared.error);
            downloadBlobFile(prepared.blob, prepared.filename);
        },
    });

    return {
        refundMutation,
        exportMutation,
    };
};
