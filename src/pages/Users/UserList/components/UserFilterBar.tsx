import { Search, RotateCcw, ShieldCheck, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import type { UserListFilters } from "@/dataHelper";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface UserFilterBarProps {
    filters: UserListFilters;
    onFilterChange: (newFilters: UserListFilters) => void;
    onReset: () => void;
}

export const UserFilterBar = ({
    filters,
    onFilterChange,
    onReset,
}: UserFilterBarProps) => {
    const { t } = useTranslation("user");
    const [searchVal, setSearchVal] = useState(filters.q || "");
    const [prevQ, setPrevQ] = useState(filters.q || "");

    if ((filters.q || "") !== prevQ) {
        setPrevQ(filters.q || "");
        setSearchVal(filters.q || "");
    }

    const debouncedSearch = useDebounce(searchVal, 300);

    useEffect(() => {
        const normalizedSearch = debouncedSearch.trim();
        if (normalizedSearch !== (filters.q || "")) {
            onFilterChange({
                q: normalizedSearch || undefined,
                role: filters.role,
                status: filters.status,
                sort_by: filters.sort_by,
                sort_order: filters.sort_order,
            });
        }
    }, [
        debouncedSearch,
        filters.q,
        filters.role,
        filters.status,
        filters.sort_by,
        filters.sort_order,
        onFilterChange,
    ]);


    const roleOptions: Option[] = [
        { value: "", label: t("filter.role_all") },
        { value: "user", label: t("roles.user") },
        { value: "admin", label: t("roles.admin") },
    ];

    const statusOptions: Option[] = [
        { value: "", label: t("filter.status_all") },
        { value: "active", label: t("status.active") },
        { value: "banned", label: t("status.banned") },
    ];

    const currentRoleOpt = roleOptions.find((o) => o.value === (filters.role || "")) || roleOptions[0];
    const currentStatusOpt = statusOptions.find((o) => o.value === (filters.status || "")) || statusOptions[0];

    const hasActiveFilters = !!(filters.q || filters.role || filters.status);

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xs mb-6 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row items-center gap-4">
                {/* Search input */}
                <div className="w-full lg:flex-1">
                    <TextInput
                        placeholder={t("filter.search_placeholder")}
                        value={searchVal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
                        leftIcon={<Search size={18} className="text-slate-400" />}
                        className="w-full bg-slate-50 font-bold border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl h-[52px]"
                    />
                </div>

                {/* Role dropdown */}
                <div className="w-full lg:w-[220px]">
                    <CustomSelect
                        options={roleOptions}
                        value={currentRoleOpt}
                        onChange={(opt) =>
                            onFilterChange({ ...filters, role: opt ? (opt.value as string) : undefined })
                        }
                        leftIcon={<ShieldCheck size={18} />}
                    />
                </div>

                {/* Status dropdown */}
                <div className="w-full lg:w-[220px]">
                    <CustomSelect
                        options={statusOptions}
                        value={currentStatusOpt}
                        onChange={(opt) =>
                            onFilterChange({ ...filters, status: opt ? (opt.value as string) : undefined })
                        }
                        leftIcon={<Activity size={18} />}
                    />
                </div>

                {/* Reset button */}
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="w-full lg:w-auto h-[52px] px-6 rounded-2xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <RotateCcw size={16} />
                        {t("filter.btn_reset")}
                    </button>
                )}
            </div>

            {/* Active filter badges */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap border-t border-slate-50 pt-3">
                    <span className="text-xs font-bold text-slate-400">
                        {t("filter.active_filters")}
                    </span>
                    {filters.q && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600">
                            "{filters.q}"
                        </span>
                    )}
                    {filters.role && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14B8A6]/8 border border-[#14B8A6]/15 rounded-full text-xs font-bold text-[#0f766e]">
                            {t("filter.role")}: {t(`roles.${filters.role as "admin" | "user"}`)}
                        </span>
                    )}
                    {filters.status && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-bold text-rose-600">
                            {t("filter.status")}: {t(`status.${filters.status as "active" | "banned"}`)}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserFilterBar;
