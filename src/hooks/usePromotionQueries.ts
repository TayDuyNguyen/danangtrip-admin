import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '@/api/promotionsApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Paginator } from '@/types/api';
import type { Promotion, PromotionFormInput, PromotionFilters, PromotionStatus } from '@/types/promotion.types';

const QUERY_KEY = 'promotions';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export const usePromotions = (filters?: PromotionFilters) => {
    return useQuery<Paginator<Promotion>>({
        queryKey: [QUERY_KEY, filters],
        queryFn: async () => {
            const response = await promotionsApi.list(filters);
            return response.data as Paginator<Promotion>;
        },
        placeholderData: (prev) => prev,
        retry: false,
    });
};

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export const useCreatePromotion = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('promotions');

    return useMutation({
        mutationFn: (data: PromotionFormInput) => promotionsApi.create(data),
        onSuccess: () => {
            toast.success(t('actions.create_success', { defaultValue: 'Promotion created successfully.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
        onError: () => {
            toast.error(t('actions.create_failed', { defaultValue: 'Failed to create promotion.' }));
        },
    });
};

export const useUpdatePromotion = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('promotions');

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<PromotionFormInput> }) =>
            promotionsApi.update(id, data),
        onSuccess: (_res, { id }) => {
            toast.success(t('actions.update_success', { defaultValue: 'Promotion updated successfully.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', id] });
        },
        onError: () => {
            toast.error(t('actions.update_failed', { defaultValue: 'Failed to update promotion.' }));
        },
    });
};

export const useUpdatePromotionStatus = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('promotions');

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: PromotionStatus }) =>
            promotionsApi.updateStatus(id, status),
        onSuccess: () => {
            toast.success(t('actions.status_updated', { defaultValue: 'Status updated.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
        onError: () => {
            toast.error(t('actions.status_failed', { defaultValue: 'Failed to update status.' }));
        },
    });
};

export const useDeletePromotion = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('promotions');

    return useMutation({
        mutationFn: (id: number) => promotionsApi.delete(id),
        onSuccess: () => {
            toast.success(t('actions.delete_success', { defaultValue: 'Promotion deleted.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
        onError: () => {
            toast.error(t('actions.delete_failed', { defaultValue: 'Failed to delete promotion.' }));
        },
    });
};
