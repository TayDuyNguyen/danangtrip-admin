import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatbotApi } from '@/api/chatbotApi';
import { toast } from 'sonner';

export const useChatbotStats = () => {
    return useQuery({
        queryKey: ['chatbot', 'stats'],
        queryFn: async () => {
            const response = await chatbotApi.getStats();
            return response.data;
        },
        refetchInterval: 60 * 1000, // Autorefresh every 60s
    });
};

export const useChatbotLogs = (params: {
    intent?: string;
    cache_hit?: boolean | string;
    rating?: 'positive' | 'negative' | '';
    search?: string;
    page?: number;
}) => {
    return useQuery({
        queryKey: ['chatbot', 'logs', params],
        queryFn: async () => {
            const response = await chatbotApi.getLogs(params);
            return response.data;
        },
    });
};

export const useChatbotCache = () => {
    return useQuery({
        queryKey: ['chatbot', 'cache'],
        queryFn: async () => {
            const response = await chatbotApi.getCache();
            return response.data;
        },
    });
};

export const useDeleteCache = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (hash: string) => {
            await chatbotApi.deleteCache(hash);
        },
        onSuccess: () => {
            toast.success('Xóa cache thành công!');
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'cache'] });
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error('Lỗi khi xóa cache: ' + (error?.response?.data?.message || error?.message || String(err)));
        },
    });
};

export const useClearAllCache = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await chatbotApi.clearAllCache();
        },
        onSuccess: () => {
            toast.success('Dọn dẹp toàn bộ cache thành công!');
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'cache'] });
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            toast.error('Lỗi khi xóa toàn bộ cache: ' + (error?.response?.data?.message || error?.message || String(err)));
        },
    });
};
