import { Search, RotateCcw, Tag, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TextInput } from "@/components/ui/TextInput";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import type { BlogListFilters, BlogCategoryViewModel } from "@/types";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import type { FormEvent, KeyboardEvent } from "react";
import LoadingReact from "@/components/loading";

interface BlogFilterBarProps {
    filters: BlogListFilters;
    categories: BlogCategoryViewModel[];
    isSearching?: boolean;
    onFilterChange: (newFilters: BlogListFilters) => void;
    onReset: () => void;
}

export const BlogFilterBar = ({
    filters,
    categories,
    isSearching = false,
    onFilterChange,
    onReset,
}: BlogFilterBarProps) => {
    const { t } = useTranslation("blog");
    const [searchVal, setSearchVal] = useState(filters.search || "");

    const debouncedSearch = useDebounce(searchVal, 300);

    useEffect(() => {
        setSearchVal(filters.search || "");
    }, [filters.search]);

    useEffect(() => {
        const normalizedSearch = debouncedSearch.trim();
        if (normalizedSearch !== (filters.search || "")) {
            onFilterChange({ ...filters, search: normalizedSearch || undefined });
        }
    }, [debouncedSearch, filters, onFilterChange]);

    const applySearch = () => {
        const normalizedSearch = searchVal.trim();
        if (normalizedSearch !== (filters.search || "")) {
            onFilterChange({ ...filters, search: normalizedSearch || undefined });
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applySearch();
    };

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            applySearch();
        }
    };

    const statusOptions: Option[] = [
        { value: "", label: t("filters.status_all") },
        { value: "draft", label: t("actions.status_draft") },
        { value: "published", label: t("actions.status_published") },
        { value: "archived", label: t("actions.status_archived") },
    ];

    const categoryOptions: Option[] = [
        { value: "", label: t("filters.category_all") },
        ...(categories?.map(c => ({
            value: String(c.id),
            label: c.name,
        })) || []),
    ];

    const currentStatusOpt = statusOptions.find(o => o.value === (filters.status || "")) || statusOptions[0];
    const currentCategoryOpt = categoryOptions.find(o => o.value === String(filters.category_id || "")) || categoryOptions[0];

    const hasActiveFilters = !!(filters.search || filters.category_id || filters.status);

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-100 shadow-xs mb-6 flex flex-col gap-4"
        >
            <div className="flex flex-col lg:flex-row items-center gap-4">
                {/* Search */}
                <div className="relative w-full lg:flex-1">
                    <TextInput
                        placeholder={t("filters.search_placeholder")}
                        value={searchVal}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchVal(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        leftIcon={<Search size={18} className="text-slate-400" />}
                        className="w-full bg-slate-50 font-bold border-slate-200 focus:border-[#14B8A6] focus:ring-4 focus:ring-[#14B8A6]/12 rounded-2xl h-[52px] pr-11"
                    />
                    {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <LoadingReact type="spokes" color="#14b8a6" height={18} width={18} />
                        </div>
                    )}
                </div>

                {/* Category Select */}
                <div className="w-full lg:w-[220px]">
                    <CustomSelect
                        options={categoryOptions}
                        value={currentCategoryOpt}
                        onChange={(opt) =>
                            onFilterChange({ ...filters, category_id: opt ? (opt.value as string) : undefined })
                        }
                        leftIcon={<Tag size={18} />}
                    />
                </div>

                {/* Status Select */}
                <div className="w-full lg:w-[200px]">
                    <CustomSelect
                        options={statusOptions}
                        value={currentStatusOpt}
                        onChange={(opt) =>
                            onFilterChange({ ...filters, status: opt ? (opt.value as string) : undefined })
                        }
                        leftIcon={<Activity size={18} />}
                    />
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="w-full lg:w-auto h-[52px] px-6 rounded-2xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 transition-all duration-300 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                        <RotateCcw size={16} />
                        {t("filters.btn_reset")}
                    </button>
                )}
            </div>

            {/* Active Filters Row */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap border-t border-slate-50 pt-3">
                    <span className="text-xs font-bold text-slate-400">
                        {t("table.selected", { count: 0 }).replace("Đã chọn 0", "Bộ lọc đang kích hoạt:")}:
                    </span>
                    {filters.search && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600">
                            "{filters.search}"
                        </span>
                    )}
                    {filters.category_id && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14B8A6]/8 border border-[#14B8A6]/15 rounded-full text-xs font-bold text-[#0f766e]">
                            {t("filters.category")}: {categories.find(c => String(c.id) === String(filters.category_id))?.name || filters.category_id}
                        </span>
                    )}
                    {filters.status && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-bold text-rose-600">
                            {t("filters.status")}: {t(`actions.status_${filters.status}`)}
                        </span>
                    )}
                </div>
            )}
        </form>
    );
};

export default BlogFilterBar;
