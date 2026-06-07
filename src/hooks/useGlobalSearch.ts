import { useQuery } from '@tanstack/react-query';
import { globalSearchApi } from '@/api/globalSearchApi';

export const useGlobalSearch = (query: string) => {
    const normalizedQuery = query.trim();

    return useQuery({
        queryKey: ['admin-global-search', normalizedQuery],
        queryFn: () => globalSearchApi.search(normalizedQuery),
        enabled: normalizedQuery.length >= 2,
        staleTime: 30_000,
        retry: false,
    });
};
