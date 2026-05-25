import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, CheckCircle, Archive } from "lucide-react";
import { toast } from "sonner";

import BlogStatsRow from "./components/BlogStatsRow";
import BlogFilterBar from "./components/BlogFilterBar";
import BlogTable from "./components/BlogTable";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";

import { useAdminBlogPostsQuery, useBlogCategoriesQuery, useBlogMutations } from "@/hooks/useBlogQueries";
import type { BlogListFilters } from "@/types";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import Pagination from "@/components/common/Pagination";

export const BlogPostList = () => {
    const { t } = useTranslation("blog");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. URL Sync & State Management
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 10;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "created_at";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    const filters: BlogListFilters = useMemo(() => ({
        search,
        category_id: categoryId ? Number(categoryId) : undefined,
        status: status || undefined,
        sort,
        order,
    }), [search, categoryId, status, sort, order]);

    // 2. Queries & Mutations
    const { data, isLoading, isFetching, isError } = useAdminBlogPostsQuery(filters, page, perPage);
    const { data: categories = [] } = useBlogCategoriesQuery();
    const { deleteMutation, updateStatusMutation } = useBlogMutations();

    // 3. Selection & Modal States
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isBulkMutating, setIsBulkMutating] = useState(false);

    const deleteTargetTitle = data?.data.find(x => x.id === deleteTargetId)?.title || "";

    // 4. URL State Update Helper
    const updateParams = useCallback((newFilters: BlogListFilters, newPage = 1, newPerPage = perPage) => {
        const params = new URLSearchParams();
        if (newFilters.search) params.set("search", newFilters.search);
        if (newFilters.category_id) params.set("category_id", String(newFilters.category_id));
        if (newFilters.status) params.set("status", newFilters.status);
        if (newFilters.sort) params.set("sort", newFilters.sort);
        if (newFilters.order) params.set("order", newFilters.order);
        params.set("page", String(newPage));
        params.set("per_page", String(newPerPage));
        
        setSelectedIds([]);
        setSearchParams(params);
    }, [perPage, setSearchParams]);

    const handleFilterChange = useCallback((newFilters: BlogListFilters) => {
        updateParams(newFilters, 1);
    }, [updateParams]);

    const handleResetFilters = useCallback(() => {
        updateParams({}, 1);
    }, [updateParams]);

    // 5. Action Handlers
    const handleSelectRow = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked && data) {
            setSelectedIds(data.data.map((item) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSort = (field: string) => {
        const nextOrder = sort === field && order === "desc" ? "asc" : "desc";
        updateParams({ ...filters, sort: field, order: nextOrder }, 1);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteTargetId(id);
    };

    const executeDelete = () => {
        if (!deleteTargetId) return;

        deleteMutation.mutate(deleteTargetId, {
            onSuccess: () => {
                toast.success(t("toast.delete_success"));
                setDeleteTargetId(null);
                setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
            },
            onError: () => {
                toast.error(t("toast.network_error"));
                setDeleteTargetId(null);
            },
        });
    };

    const handleStatusChange = (id: number, newStatus: 'draft' | 'published' | 'archived') => {
        updateStatusMutation.mutate({ id, status: newStatus }, {
            onSuccess: () => {
                toast.success(t("toast.status_success"));
            },
            onError: () => {
                toast.error(t("toast.network_error"));
            }
        });
    };

    // Bulk actions
    const executeBulkDelete = () => {
        if (selectedIds.length === 0) return;

        const confirmDelete = window.confirm(
            t("actions.bulk_delete_confirm", { count: selectedIds.length })
        );
        if (!confirmDelete) return;

        setIsBulkMutating(true);
        const promises = selectedIds.map((id) => deleteMutation.mutateAsync(id));

        Promise.all(promises)
            .then(() => {
                toast.success(t("toast.bulk_delete_success"));
                setSelectedIds([]);
            })
            .catch(() => {
                toast.error(t("toast.network_error"));
            })
            .finally(() => {
                setIsBulkMutating(false);
            });
    };

    const executeBulkStatusChange = (newStatus: 'published' | 'archived') => {
        if (selectedIds.length === 0) return;

        setIsBulkMutating(true);
        const promises = selectedIds.map((id) => updateStatusMutation.mutateAsync({ id, status: newStatus }));

        Promise.all(promises)
            .then(() => {
                toast.success(t("toast.bulk_status_success"));
                setSelectedIds([]);
            })
            .catch(() => {
                toast.error(t("toast.network_error"));
            })
            .finally(() => {
                setIsBulkMutating(false);
            });
    };

    // 6. Pagination & Stats Computations
    const totalItems = data?.meta.total || 0;
    const totalPages = data?.meta.last_page || 1;

    const totalCount = data?.stats.total || 0;
    const publishedCount = data?.stats.published || 0;
    const draftCount = data?.stats.draft || 0;
    const archivedCount = data?.stats.archived || 0;

    const perPageOptions: Option[] = [
        { value: 10, label: "10" },
        { value: 20, label: "20" },
        { value: 50, label: "50" },
    ];

    const currentPerPageOpt = perPageOptions.find((o) => o.value === perPage) || perPageOptions[0];

    return (
        <main className="p-6 max-w-7xl mx-auto flex flex-col gap-6 font-sans">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 shrink-0">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        {t("breadcrumb")}
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {t("title")}
                    </h1>
                    <p className="text-sm font-semibold text-slate-400 mt-1.5">
                        {t("subtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => navigate("/admin/blog-posts/create")}
                        className="px-5 py-3 bg-[#14B8A6] hover:bg-[#0f766e] text-white rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-[#14B8A6]/20 hover:shadow-[#0f766e]/30 select-none active:scale-[0.98]"
                    >
                        <Plus size={16} />
                        {t("actions.create")}
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <BlogStatsRow
                total={totalCount}
                published={publishedCount}
                draft={draftCount}
                archived={archivedCount}
                isLoading={isLoading}
                isError={isError}
            />

            {/* Filters Bar Toolbar */}
            <BlogFilterBar
                filters={filters}
                categories={categories}
                isSearching={isFetching && !isLoading}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            {/* Table Toolbar & Bulk Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 p-4 rounded-3xl border border-slate-100 shadow-2xs shrink-0">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-2.5 animate-in fade-in duration-200">
                            <span className="text-sm font-bold text-[#0f766e] bg-[#14B8A6]/10 px-3 py-1.5 rounded-full select-none">
                                {t("table.selected", { count: selectedIds.length })}
                            </span>
                            <button
                                onClick={() => executeBulkStatusChange("published")}
                                disabled={isBulkMutating}
                                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 select-none active:scale-[0.98]"
                            >
                                <CheckCircle size={12} />
                                {t("actions.bulk_publish")}
                            </button>
                            <button
                                onClick={() => executeBulkStatusChange("archived")}
                                disabled={isBulkMutating}
                                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 select-none active:scale-[0.98]"
                            >
                                <Archive size={12} />
                                {t("actions.bulk_archive")}
                            </button>
                            <button
                                onClick={executeBulkDelete}
                                disabled={isBulkMutating}
                                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 select-none active:scale-[0.98]"
                            >
                                <Trash2 size={12} />
                                {t("actions.bulk_delete")}
                            </button>
                        </div>
                    ) : (
                        <span className="text-xs font-bold text-slate-400 select-none">
                            {t("subtitle")}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-end w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap select-none">
                        {t("table.displaying", {
                            start: data?.data.length ? (page - 1) * perPage + 1 : 0,
                            end: data?.data.length ? (page - 1) * perPage + data.data.length : 0,
                            total: totalItems,
                        })}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap select-none">{t("table.per_page")}</span>
                        <div className="w-[85px]">
                            <CustomSelect
                                options={perPageOptions}
                                value={currentPerPageOpt}
                                onChange={(opt) => {
                                    if (opt) updateParams(filters, 1, opt.value as number);
                                }}
                                size="sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Table Grid */}
            <BlogTable
                data={data?.data || []}
                isLoading={isLoading}
                isRefreshing={isFetching && !isLoading}
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                onDelete={handleDeleteClick}
                onStatusChange={handleStatusChange}
                sorting={{ sortBy: sort, sortOrder: order }}
                onSort={handleSort}
            />

            {/* Pagination Controls */}
            {data && totalPages > 1 && (
                <div className="mt-2 flex justify-center shrink-0">
                    <Pagination
                        currentPage={page}
                        totalItems={totalItems}
                        pageSize={perPage}
                        onPageChange={(p) => updateParams(filters, p)}
                    />
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmDialog
                isOpen={deleteTargetId !== null}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={executeDelete}
                postTitle={deleteTargetTitle}
                isMutating={deleteMutation.isPending}
            />
        </main>
    );
};

export default BlogPostList;
