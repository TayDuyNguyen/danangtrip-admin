import { useState, useEffect } from "react";
import { Search, RotateCcw, Tag, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import type { NotificationListFilters } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import FilterUserSelect from "./FilterUserSelect";

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
    const [userFilterLabel, setUserFilterLabel] = useState<string | undefined>();

    const resolvedUserLabel = filters.user_id ? userFilterLabel : undefined;

    const debouncedSearch = useDebounce(searchVal, 300);
    useEffect(() => {
        if (debouncedSearch === (filters.q || "")) return;
        if ((filters.q || "") === "" && searchVal === "") return;
        onFilterChange({
            q: debouncedSearch,
            type: filters.type,
            is_read: filters.is_read,
            user_id: filters.user_id,
            sort_by: filters.sort_by,
            sort_order: filters.sort_order,
        });
    }, [
        debouncedSearch,
        searchVal,
        filters.q,
        filters.type,
        filters.is_read,
        filters.user_id,
        filters.sort_by,
        filters.sort_order,
        onFilterChange,
    ]);

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

    const currentTypeOpt = typeOptions.find((o) => o.value === (filters.type || "")) || typeOptions[0];
    const currentStatusOpt = statusOptions.find((o) => o.value === (filters.is_read || "")) || statusOptions[0];

    const hasActiveFilters = !!(filters.q || filters.type || filters.is_read || filters.user_id);

    const handleUserFilterChange = (userId: string | undefined, label?: string) => {
        setUserFilterLabel(label);
        onFilterChange({
            ...filters,
            user_id: userId,
        });
    };

    return (
        <div
            className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xs mb-6 flex flex-col gap-4"
            data-testid="notification-filter-panel"
        >
            <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="w-full lg:flex-1">
                    <TextInput
                        data-testid="notification-search-input"
                        placeholder={t("filters.search_placeholder")}
                        value={searchVal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
                        leftIcon={<Search size={18} className="text-slate-400" />}
                        className="w-full bg-slate-50 font-bold border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl h-[52px]"
                    />
                </div>

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

                <div className="w-full lg:w-[220px]">
                    <FilterUserSelect
                        userId={filters.user_id}
                        onChange={handleUserFilterChange}
                        onLabelResolved={setUserFilterLabel}
                    />
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        data-testid="notification-reset-filters"
                        onClick={onReset}
                        className="w-full lg:w-auto h-[52px] px-6 rounded-2xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <RotateCcw size={16} />
                        {t("filters.reset_button")}
                    </button>
                )}
            </div>

            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap border-t border-slate-50 pt-3">
                    <span className="text-xs font-bold text-slate-400">
                        {t("filters.active_filters")}
                    </span>
                    {filters.q && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600">
                            &quot;{filters.q}&quot;
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
                            {t("table.recipient")}: {resolvedUserLabel ?? filters.user_id}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationFilterBar;
