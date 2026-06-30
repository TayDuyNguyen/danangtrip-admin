import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { chatbotApi } from '@/api/chatbotApi';
import { toast } from 'sonner';

type ChatbotStatsOptions = {
    /** When false, skips fetch and auto-refresh (inactive tab). */
    isActive?: boolean;
};

export const useChatbotStats = ({ isActive = true }: ChatbotStatsOptions = {}) => {
    return useQuery({
        queryKey: ['chatbot', 'stats'],
        queryFn: async () => {
            const response = await chatbotApi.getStats();
            return response.data;
        },
        enabled: isActive,
        refetchInterval: isActive ? 60 * 1000 : false,
        refetchIntervalInBackground: false,
    });
};

export const useChatbotLogs = (
    params: {
        intent?: string;
        cache_hit?: boolean | string;
        rating?: 'positive' | 'negative' | '';
        search?: string;
        page?: number;
    },
    options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ['chatbot', 'logs', params],
        queryFn: async () => {
            const response = await chatbotApi.getLogs(params);
            return response.data;
        },
        enabled: options?.enabled ?? true,
    });
};

export const useChatbotCache = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['chatbot', 'cache'],
        queryFn: async () => {
            const response = await chatbotApi.getCache();
            return response.data;
        },
        enabled: options?.enabled ?? true,
    });
};

export const useDeleteCache = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('chatbot');

    return useMutation({
        mutationFn: async (hash: string) => {
            await chatbotApi.deleteCache(hash);
        },
        onSuccess: () => {
            toast.success(t('settings.delete_cache_success'));
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'cache'] });
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(
                t('settings.delete_cache_error', {
                    message: error?.response?.data?.message || error?.message || String(err),
                })
            );
        },
    });
};

export const useClearAllCache = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('chatbot');

    return useMutation({
        mutationFn: async () => {
            await chatbotApi.clearAllCache();
        },
        onSuccess: () => {
            toast.success(t('settings.clear_all_success'));
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'cache'] });
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error(
                t('settings.clear_all_error', {
                    message: error?.response?.data?.message || error?.message || String(err),
                })
            );
        },
    });
};
