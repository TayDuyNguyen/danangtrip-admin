import { Search, RotateCcw, Tag, Activity, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import type { NotificationListFilters } from "@/types";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";

interface NotificationFilterBarProps {
    filters: NotificationListFilters;
    onFilterChange: (newFilters: NotificationListFilters) => void;
    onReset: () => void;
}

export const NotificationFilterBar = ({
    filters,
    onFilterChange,
    onReset,
}: NotificationFilterBarProps) => {
    const { t } = useTranslation("notification");
    const [searchVal, setSearchVal] = useState(filters.q || "");

    const debouncedSearch = useDebounce(searchVal, 300);

    // Sync input with debounced search
    useEffect(() => {
        if (debouncedSearch !== (filters.q || "")) {
            onFilterChange({ ...filters, q: debouncedSearch });
        }
    }, [debouncedSearch, filters, onFilterChange]);

    // Fetch users for dropdown filtering
    const { data: usersList } = useQuery({
        queryKey: ["users", "dropdown-options"],
        queryFn: async () => {
            const response = await userApi.getList({ per_page: 50 });
            return response.data?.data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const typeOptions: Option[] = [
        { value: "", label: t("filters.select_type") },
        { value: "booking", label: t("types.booking") },
        { value: "rating", label: t("types.rating") },
        { value: "system", label: t("types.system") },
        { value: "promotion", label: t("types.promotion") },
    ];

    const statusOptions: Option[] = [
        { value: "", label: t("filters.select_status") },
        { value: "1", label: t("statuses.read") },
        { value: "0", label: t("statuses.unread") },
    ];

    const userOptions: Option[] = [
        { value: "", label: t("filters.select_user") },
        ...(usersList?.map(u => ({
            value: String(u.id),
            label: `${u.full_name} (${u.email})`,
        })) || []),
    ];

    const currentTypeOpt = typeOptions.find(o => o.value === (filters.type || "")) || typeOptions[0];
    const currentStatusOpt = statusOptions.find(o => o.value === (filters.is_read || "")) || statusOptions[0];
    const currentUserOpt = userOptions.find(o => o.value === (filters.user_id || "")) || userOptions[0];

    const hasActiveFilters = !!(filters.q || filters.type || filters.is_read || filters.user_id);

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xs mb-6 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row items-center gap-4">
                {/* Debounced Search */}
                <div className="w-full lg:flex-1">
                    <TextInput
                        placeholder={t("filters.search_placeholder")}
                        value={searchVal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
                        leftIcon={<Search size={18} className="text-slate-400" />}
                        className="w-full bg-slate-50 font-bold border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl h-[52px]"
                    />
                </div>

                {/* Type Selection */}
                <div className="w-full lg:w-[180px]">
                    <CustomSelect
                        options={typeOptions}
                        value={currentTypeOpt}
                        onChange={(opt) =>
                            onFilterChange({ ...filters, type: opt ? (opt.value as string) : undefined })
                        }
                        leftIcon={<Tag size={18} />}
                    />
                </div>

                {/* Read Status Selection */}
                <div className="w-full lg:w-[180px]">
                    <CustomSelect
                        options={statusOptions}
                        value={currentStatusOpt}
                        onChange={(opt) =>
                            onFilterChange({ ...filters, is_read: opt ? (opt.value as string) : undefined })
                        }
                        leftIcon={<Activity size={18} />}
                    />
                </div>

                {/* Recipient User Selection */}
                <div className="w-full lg:w-[220px]">
                    <CustomSelect
                        options={userOptions}
                        value={currentUserOpt}
                        onChange={(opt) =>
                            onFilterChange({ ...filters, user_id: opt ? (opt.value as string) : undefined })
                        }
                        leftIcon={<User size={18} />}
                    />
                </div>

                {/* Reset Filters CTA */}
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="w-full lg:w-auto h-[52px] px-6 rounded-2xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <RotateCcw size={16} />
                        {t("filters.reset_button")}
                    </button>
                )}
            </div>

            {/* Active Filter Tags Row */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap border-t border-slate-50 pt-3">
                    <span className="text-xs font-bold text-slate-400">
                        {t("filters.active_filters")}
                    </span>
                    {filters.q && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600">
                            "{filters.q}"
                        </span>
                    )}
                    {filters.type && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14B8A6]/8 border border-[#14B8A6]/15 rounded-full text-xs font-bold text-[#0f766e]">
                            {t("table.type")}: {t(`types.${filters.type}`)}
                        </span>
                    )}
                    {filters.is_read !== undefined && filters.is_read !== "" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-bold text-rose-600">
                            {t("statuses.all")}: {filters.is_read === "1" ? t("statuses.read") : t("statuses.unread")}
                        </span>
                    )}
                    {filters.user_id && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600">
                            ID {t("table.recipient")}: {filters.user_id}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationFilterBar;
