import { useInfiniteQuery } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { mapUserList } from "@/dataHelper/user.mapper";
import type { UserItem, UserListFilters } from "@/dataHelper";

const DEFAULT_PAGE_SIZE = 10;

export function useAdminUserInfiniteSearch(
    debouncedSearch: string,
    queryKeyPrefix: string,
    filters: UserListFilters = {}
) {
    const query = useInfiniteQuery({
        queryKey: [queryKeyPrefix, debouncedSearch, filters.status ?? "", filters.role ?? ""],
        queryFn: async ({ pageParam }) => {
            const response = await userApi.getList({
                q: debouncedSearch,
                page: pageParam,
                per_page: DEFAULT_PAGE_SIZE,
                ...filters,
            });

            if (!response.data) {
                throw new Error("Empty response");
            }

            return mapUserList(response.data);
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const currentPage = lastPage.meta.current_page;
            return currentPage < lastPage.meta.last_page ? currentPage + 1 : undefined;
        },
        staleTime: 1000 * 30,
    });

    const usersList: UserItem[] = query.data?.pages.flatMap((pageData) => pageData.data) || [];

    return {
        ...query,
        usersList,
    };
}

export default useAdminUserInfiniteSearch;
