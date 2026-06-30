import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/hooks/useDebounce";
import { useAdminUserInfiniteSearch } from "@/hooks/useAdminUserInfiniteSearch";
import type { UserItem } from "@/dataHelper";

interface RecipientSelectorProps {
    selectedUser: UserItem | null;
    onSelect: (user: UserItem | null) => void;
    error?: string;
    disabled?: boolean;
}

const ACTIVE_USER_FILTERS = { status: "active" as const };

export const RecipientSelector = ({
    selectedUser,
    onSelect,
    error,
    disabled = false,
}: RecipientSelectorProps) => {
    const { t } = useTranslation("notification");
    const [searchVal, setSearchVal] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listboxId = "notification-recipient-listbox";

    const debouncedSearchVal = useDebounce(searchVal, 300);

    const {
        usersList,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useAdminUserInfiniteSearch(
        debouncedSearchVal,
        "notification-recipient-users",
        ACTIVE_USER_FILTERS
    );

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setActiveIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectUser = (user: UserItem) => {
        onSelect(user);
        setSearchVal("");
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen && (event.key === "ArrowDown" || event.key === "Enter")) {
            setIsOpen(true);
            setActiveIndex(-1);
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => Math.min(current + 1, usersList.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
        } else if (event.key === "Enter" && activeIndex >= 0 && usersList[activeIndex]) {
            event.preventDefault();
            handleSelectUser(usersList[activeIndex]);
        } else if (event.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div className="space-y-2" ref={containerRef} data-testid="notification-recipient-selector">
            <label
                className="text-xs font-bold text-slate-500 uppercase tracking-wider block"
                htmlFor="notification-recipient-search"
            >
                {t("send.label_recipient")}
            </label>

            {selectedUser ? (
                <div
                    className="flex items-center justify-between bg-blue-50/40 border border-blue-200/60 rounded-2xl p-4 transition-all duration-300"
                    data-testid="notification-recipient-selected"
                >
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
                        aria-label={t("send.clear_recipient")}
                        data-testid="notification-recipient-clear"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <input
                            id="notification-recipient-search"
                            type="text"
                            role="combobox"
                            aria-expanded={isOpen}
                            aria-controls={listboxId}
                            aria-autocomplete="list"
                            aria-invalid={Boolean(error)}
                            data-testid="notification-recipient-search"
                            value={searchVal}
                            disabled={disabled}
                            onChange={(e) => {
                                setSearchVal(e.target.value);
                                setIsOpen(true);
                                setActiveIndex(-1);
                            }}
                            onFocus={() => {
                                setIsOpen(true);
                                setActiveIndex(-1);
                            }}
                            onKeyDown={handleSearchKeyDown}
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

                    {isOpen && (
                        <div
                            id={listboxId}
                            role="listbox"
                            ref={dropdownRef}
                            onScroll={handleDropdownScroll}
                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in-50 slide-in-from-top-2 duration-200"
                        >
                            {usersList.length > 0 ? (
                                <>
                                    {usersList.map((user, index) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            role="option"
                                            aria-selected={index === activeIndex}
                                            onClick={() => handleSelectUser(user)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors duration-150 text-left ${
                                                index === activeIndex ? "bg-slate-50" : ""
                                            }`}
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
                                        </button>
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
                <p className="text-xs text-rose-500 font-semibold pl-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default RecipientSelector;
