import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { landingPageApi } from '@/api/landingPageApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Paginator } from '@/types/api';
import type { LandingPage, CreateLandingPageInput, LandingPageFilters, LandingPageStatus } from '@/types/landingPage.types';

const QUERY_KEY = 'landing_pages';

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export const useLandingPages = (filters?: LandingPageFilters) => {
    return useQuery<Paginator<LandingPage>>({
        queryKey: [QUERY_KEY, filters],
        queryFn: async () => {
            const response = await landingPageApi.list(filters);
            return response.data as Paginator<LandingPage>;
        },
        placeholderData: (prev) => prev,
    });
};

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export const useCreateLandingPage = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('landing_pages');

    return useMutation({
        mutationFn: (data: CreateLandingPageInput) => landingPageApi.create(data),
        onSuccess: () => {
            toast.success(t('success.create', { defaultValue: 'Landing page created successfully.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
        onError: () => {
            toast.error(t('error.submit', { defaultValue: 'Failed to create landing page.' }));
        },
    });
};

export const useUpdateLandingPage = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('landing_pages');

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreateLandingPageInput> }) =>
            landingPageApi.update(id, data),
        onSuccess: (_res, { id }) => {
            toast.success(t('success.update', { defaultValue: 'Landing page updated successfully.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', id] });
        },
        onError: () => {
            toast.error(t('error.submit', { defaultValue: 'Failed to update landing page.' }));
        },
    });
};

export const useUpdateLandingPageStatus = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('landing_pages');

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: LandingPageStatus }) =>
            landingPageApi.updateStatus(id, status),
        onSuccess: () => {
            toast.success(t('success.status_update', { defaultValue: 'Landing page status updated successfully.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
        onError: () => {
            toast.error(t('error.submit', { defaultValue: 'Failed to update landing page status.' }));
        },
    });
};

export const useDeleteLandingPage = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('landing_pages');

    return useMutation({
        mutationFn: (id: number) => landingPageApi.delete(id),
        onSuccess: () => {
            toast.success(t('success.delete', { defaultValue: 'Landing page deleted successfully.' }));
            void queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        },
        onError: () => {
            toast.error(t('error.submit', { defaultValue: 'Failed to delete landing page.' }));
        },
    });
};
