import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { mapUserItem } from "@/dataHelper/user.mapper";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminUserInfiniteSearch } from "@/hooks/useAdminUserInfiniteSearch";
import type { UserItem } from "@/dataHelper";

interface FilterUserSelectProps {
    userId?: string;
    onChange: (userId: string | undefined, label?: string) => void;
    onLabelResolved?: (label: string) => void;
}

export const FilterUserSelect = ({ userId, onChange, onLabelResolved }: FilterUserSelectProps) => {
    const { t } = useTranslation("notification");
    const [searchVal, setSearchVal] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const debouncedSearchVal = useDebounce(searchVal, 300);

    const { data: selectedUserDetail } = useQuery({
        queryKey: ["notification-filter-user", userId],
        queryFn: async () => {
            const response = await userApi.getDetail(userId!);
            if (!response.data) throw new Error("Empty response");
            return mapUserItem(response.data);
        },
        enabled: Boolean(userId),
        staleTime: 1000 * 60 * 5,
    });

    const {
        usersList,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useAdminUserInfiniteSearch(debouncedSearchVal, "notification-filter-users");

    const selectedLabel = selectedUserDetail
        ? `${selectedUserDetail.fullName} (${selectedUserDetail.email})`
        : undefined;

    useEffect(() => {
        if (selectedLabel && userId) {
            onLabelResolved?.(selectedLabel);
        }
    }, [selectedLabel, userId, onLabelResolved]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDropdownScroll = () => {
        const dropdown = dropdownRef.current;
        if (!dropdown || !hasNextPage || isFetchingNextPage) return;
        const remainingScroll =
            dropdown.scrollHeight - dropdown.scrollTop - dropdown.clientHeight;
        if (remainingScroll < 48) void fetchNextPage();
    };

    const handleSelect = (user: UserItem) => {
        const label = `${user.fullName} (${user.email})`;
        onChange(String(user.id), label);
        setSearchVal("");
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange(undefined);
        setSearchVal("");
    };

    return (
        <div className="relative w-full" ref={containerRef} data-testid="notification-filter-user">
            {userId && selectedLabel ? (
                <div className="flex items-center gap-2 h-[52px] px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <User size={18} className="text-slate-400 shrink-0" />
                    <span className="flex-1 text-sm font-bold text-slate-700 truncate">{selectedLabel}</span>
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        aria-label={t("filters.reset_button")}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="text"
                        data-testid="notification-filter-user-search"
                        value={searchVal}
                        onChange={(e) => {
                            setSearchVal(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={t("filters.select_user")}
                        className="w-full h-[52px] bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Search size={18} />
                    </div>
                    {isLoading && isOpen && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <Loader2 className="animate-spin" size={18} />
                        </div>
                    )}
                    {isOpen && (
                        <div
                            ref={dropdownRef}
                            onScroll={handleDropdownScroll}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100"
                        >
                            {usersList.length > 0 ? (
                                usersList.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => handleSelect(user)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left cursor-pointer transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-800 truncate">{user.fullName}</p>
                                            <p className="text-[10px] font-semibold text-slate-400 truncate">{user.email}</p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs font-bold text-slate-400">
                                    {isLoading ? t("send.loading_users") : t("table.empty")}
                                </div>
                            )}
                            {isFetchingNextPage && (
                                <div className="flex items-center justify-center gap-2 p-3 text-xs font-bold text-slate-400">
                                    <Loader2 className="animate-spin" size={14} />
                                    <span>{t("send.loading_more_users")}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterUserSelect;
