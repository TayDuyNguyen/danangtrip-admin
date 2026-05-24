import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useInfiniteQuery } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { mapUserList } from "@/dataHelper/user.mapper";
import { useDebounce } from "@/hooks/useDebounce";
import type { UserItem } from "@/dataHelper";

interface RecipientSelectorProps {
    selectedUser: UserItem | null;
    onSelect: (user: UserItem | null) => void;
    error?: string;
    disabled?: boolean;
}

export const RecipientSelector = ({
    selectedUser,
    onSelect,
    error,
    disabled = false,
}: RecipientSelectorProps) => {
    const { t } = useTranslation("notification");
    const [searchVal, setSearchVal] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const debouncedSearchVal = useDebounce(searchVal, 300);
    const pageSize = 10;

    const {
        data: usersData,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery({
        queryKey: ["notification-recipient-users", debouncedSearchVal],
        queryFn: async ({ pageParam }) => {
            const response = await userApi.getList({
                q: debouncedSearchVal,
                page: pageParam,
                per_page: pageSize,
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

    const usersList: UserItem[] = usersData?.pages.flatMap((pageData) => pageData.data) || [];

    const handleDropdownScroll = () => {
        const dropdown = dropdownRef.current;

        if (!dropdown || !hasNextPage || isFetchingNextPage) {
            return;
        }

        const remainingScroll =
            dropdown.scrollHeight - dropdown.scrollTop - dropdown.clientHeight;

        if (remainingScroll < 48) {
            void fetchNextPage();
        }
    };

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-2" ref={containerRef}>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {t("send.label_recipient")}
            </label>

            {selectedUser ? (
                /* Selected User View Card */
                <div className="flex items-center justify-between bg-blue-50/40 border border-blue-200/60 rounded-2xl p-4 transition-all duration-300">
                    <div className="flex items-center gap-3 min-w-0">
                        {selectedUser.avatar ? (
                            <img
                                src={selectedUser.avatar}
                                alt={selectedUser.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-100"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-200">
                                {selectedUser.fullName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <h5 className="text-sm font-extrabold text-blue-900 truncate leading-tight">
                                {selectedUser.fullName}
                            </h5>
                            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                                {selectedUser.username} • {selectedUser.email}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onSelect(null);
                            setSearchVal("");
                        }}
                        disabled={disabled}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                /* Search Input & Suggestions Autocomplete */
                <div className="relative">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchVal}
                            disabled={disabled}
                            onChange={(e) => {
                                setSearchVal(e.target.value);
                                setIsOpen(true);
                            }}
                            onFocus={() => setIsOpen(true)}
                            placeholder={t("send.placeholder_search_user")}
                            className={`w-full bg-[#f8fafc] border rounded-2xl py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 disabled:opacity-50 ${
                                error
                                    ? "border-rose-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                                    : "border-slate-200/80 focus:border-[#0066CC] focus:bg-white focus:ring-4 focus:ring-[#0066CC]/10"
                            }`}
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Search size={18} />
                        </div>
                        {isLoading && isOpen && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <Loader2 className="animate-spin" size={18} />
                            </div>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {isOpen && (
                        <div
                            ref={dropdownRef}
                            onScroll={handleDropdownScroll}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 slide-in-from-top-2 duration-200"
                        >
                            {usersList.length > 0 ? (
                                <>
                                    {usersList.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => {
                                            onSelect(user);
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                                    >
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.fullName}
                                                className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 shrink-0">
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h6 className="text-xs font-bold text-slate-800 truncate">
                                                {user.fullName}
                                            </h6>
                                            <p className="text-[10px] font-semibold text-slate-400 truncate">
                                                {user.username} • {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    ))}
                                    {isFetchingNextPage && (
                                        <div className="flex items-center justify-center gap-2 p-3 text-xs font-bold text-slate-400">
                                            <Loader2 className="animate-spin" size={14} />
                                            <span>{t("send.loading_more_users")}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-4 text-center text-xs font-bold text-slate-400">
                                    {isLoading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={14} />
                                            {t("send.loading_users")}
                                        </span>
                                    ) : (
                                        t("table.empty")
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-rose-500 font-semibold pl-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default RecipientSelector;
