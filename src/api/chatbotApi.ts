import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '@/constants/endpoints';
import type { ApiResponse } from '@/types/api';

export interface ChatbotStats {
    kpis: {
        total_messages: number;
        cache_hit_rate: number;
        avg_latency: number;
        total_cost: number;
        system_errors: number;
    };
    trends: {
        latency: { date: string; latency: number }[];
        cacheRate: { date: string; hitRate: number }[];
        cost: { date: string; cost: number; tokens: number }[];
        errors: { date: string; errors: number }[];
    };
    business: {
        topDestinations: { name: string; value: number }[];
        topTours: { name: string; value: number }[];
        intentDistribution: { name: string; value: number }[];
        unknownIntents: { id: number; question: string; created_at: string }[];
        negativeFeedbacks: {
            id: number;
            question: string;
            answer: string;
            intent: string;
            metadata: Record<string, unknown>;
            created_at: string;
        }[];
        clarification: {
            total_clarified_sessions: number;
            completed_sessions: number;
            completion_rate: number;
            drop_off_rate: number;
        };
    };
}

export interface ChatLog {
    id: number;
    session_id: string;
    question: string;
    answer: string;
    intent: string;
    cache_hit: boolean;
    tokens_used: number;
    created_at: string;
    metadata: {
        latency_ms?: number;
        ai_ok?: boolean;
        rating?: 'positive' | 'negative';
        reason?: string;
        session_slots?: Record<string, unknown>;
        understanding?: Record<string, unknown>;
        warnings?: string[];
        error?: string;
    };
}

export interface ChatCacheItem {
    id: number;
    question_hash: string;
    normalized_question: string;
    locale: string;
    intent: string;
    provider: string;
    model: string;
    expires_at: string | null;
    created_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export const chatbotApi = {
    getStats: async (): Promise<ApiResponse<ChatbotStats>> => {
        return axiosClient.get(API_ENDPOINTS.CHATBOT.STATS);
    },

    getLogs: async (params?: {
        intent?: string;
        cache_hit?: boolean | string;
        rating?: 'positive' | 'negative' | '';
        search?: string;
        page?: number;
    }): Promise<ApiResponse<PaginatedResponse<ChatLog>>> => {
        return axiosClient.get(API_ENDPOINTS.CHATBOT.LOGS, { params });
    },

    getCache: async (): Promise<ApiResponse<ChatCacheItem[]>> => {
        return axiosClient.get(API_ENDPOINTS.CHATBOT.CACHE);
    },

    deleteCache: async (hash: string): Promise<ApiResponse<void>> => {
        return axiosClient.delete(API_ENDPOINTS.CHATBOT.DELETE_CACHE(hash));
    },

    clearAllCache: async (): Promise<ApiResponse<void>> => {
        return axiosClient.delete(API_ENDPOINTS.CHATBOT.CLEAR_CACHE);
    },
};

export default chatbotApi;
