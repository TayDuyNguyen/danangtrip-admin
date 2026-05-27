import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import Breadcrumbs from "@/components/common/Breadcrumbs";

import BlogStatsRow from "./components/BlogStatsRow";
import BlogFilterBar from "./components/BlogFilterBar";
import BlogTable from "./components/BlogTable";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";

import { useAdminBlogPostsQuery, useBlogCategoriesQuery, useBlogMutations } from "@/hooks/useBlogQueries";
import type { BlogListFilters } from "@/types";

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
    const { data, isLoading, isFetching, isError, refetch } = useAdminBlogPostsQuery(filters, page, perPage);
    const { data: categories = [] } = useBlogCategoriesQuery();
    const { deleteMutation, updateStatusMutation } = useBlogMutations();

    // 3. Selection & Modal States
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
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
        setIsBulkDeleteDialogOpen(true);
    };

    const handleConfirmBulkDelete = () => {
        if (selectedIds.length === 0) return;
        setIsBulkDeleteDialogOpen(false);
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

    const totalCount = data?.stats.total || 0;
    const publishedCount = data?.stats.published || 0;
    const draftCount = data?.stats.draft || 0;
    const archivedCount = data?.stats.archived || 0;

    return (
        <main className="p-1 sm:p-2 max-w-[1600px] mx-auto flex flex-col gap-6 font-sans">
            {/* Page Header */}
            <div className="flex flex-col gap-3 mb-6">
                <Breadcrumbs
                    icon={FileText}
                    items={[
                        { label: 'sidebar.posts' }
                    ]}
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            {t("title")}
                        </h1>
                        <p className="text-sm font-semibold text-slate-400 mt-1.5">
                            {t("subtitle")}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/blog-posts/create")}
                            className="px-5 py-3 bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-[#14b8a6]/20 h-11 shrink-0"
                        >
                            <Plus size={16} />
                            {t('common:breadcrumb.add')}
                        </button>
                    </div>
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
                page={page}
                perPage={perPage}
                totalItems={totalItems}
                onPageChange={(p) => updateParams(filters, p)}
                onPerPageChange={(size) => updateParams(filters, 1, size)}
                onRefresh={refetch}
                onBulkStatusChange={executeBulkStatusChange}
                onBulkDelete={executeBulkDelete}
                isBulkMutating={isBulkMutating}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmDialog
                isOpen={deleteTargetId !== null}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={executeDelete}
                postTitle={deleteTargetTitle}
                isMutating={deleteMutation.isPending}
            />

            {/* Bulk Delete Confirmation Modal */}
            <DeleteConfirmDialog
                isOpen={isBulkDeleteDialogOpen}
                onClose={() => setIsBulkDeleteDialogOpen(false)}
                onConfirm={handleConfirmBulkDelete}
                isBulk={true}
                count={selectedIds.length}
                isMutating={isBulkMutating}
            />
        </main>
    );
};

export default BlogPostList;
