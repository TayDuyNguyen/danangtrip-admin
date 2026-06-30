import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsApi';
import { mapRawSettingsToViewModel } from '@/dataHelper/settings.mapper';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { WebsiteSettings } from '@/types/settings.types';

export const useSettings = (options?: { enabled?: boolean }) => {
    return useQuery<WebsiteSettings>({
        queryKey: ['settings'],
        queryFn: async () => {
            const response = await settingsApi.getAdminSettings();
            return mapRawSettingsToViewModel(response.data as Record<string, Record<string, unknown>>);
        },
        staleTime: 10 * 60 * 1000,
        enabled: options?.enabled ?? true,
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('settings');

    return useMutation({
        mutationFn: async (settings: WebsiteSettings) => {
            const response = await settingsApi.updateSettings(settings);
            return response;
        },
        onSuccess: () => {
            toast.success(t('actions.save_success'));
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
        onError: () => {
            toast.error(t('actions.save_failed'));
        },
    });
};

export const useUpdateSettingGroups = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('settings');

    return useMutation({
        mutationFn: async (groups: Record<string, Record<string, unknown>>) => {
            return settingsApi.updateSettingGroups(groups);
        },
        onSuccess: () => {
            toast.success(t('actions.save_success'));
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
        onError: () => {
            toast.error(t('actions.save_failed'));
        },
    });
};
