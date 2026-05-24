import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import NotificationStatsRow from "./components/NotificationStatsRow";
import NotificationFilterBar from "./components/NotificationFilterBar";
import NotificationTable from "./components/NotificationTable";
import DeleteNotificationDialog from "./components/DeleteNotificationDialog";

import { useAdminNotificationsQuery, useNotificationMutations } from "@/hooks/useNotificationQueries";
import type { NotificationListFilters } from "@/types";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import Pagination from "@/components/common/Pagination";

export const NotificationList = () => {
    const { t } = useTranslation("notification");
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. URL Sync & State Management
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 10;
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";
    const isRead = searchParams.get("is_read") || "";
    const userId = searchParams.get("user_id") || "";
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || "desc";

    const filters: NotificationListFilters = {
        q,
        type,
        is_read: isRead,
        user_id: userId,
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    // 2. Data Queries & Mutations
    const { data, isLoading, isFetching, isError } = useAdminNotificationsQuery(filters, page, perPage);
    const { deleteMutation } = useNotificationMutations();

    // 3. Selection & Dialog States
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [isBulkMutating, setIsBulkMutating] = useState(false);

    // 4. URL State Helper
    const updateParams = (newFilters: NotificationListFilters, newPage = 1, newPerPage = perPage) => {
        const params = new URLSearchParams();
        if (newFilters.q) params.set("q", newFilters.q);
        if (newFilters.type) params.set("type", newFilters.type);
        if (newFilters.is_read !== undefined && newFilters.is_read !== "") params.set("is_read", newFilters.is_read);
        if (newFilters.user_id) params.set("user_id", newFilters.user_id);
        if (newFilters.sort_by) params.set("sort_by", newFilters.sort_by);
        if (newFilters.sort_order) params.set("sort_order", newFilters.sort_order);
        params.set("page", String(newPage));
        params.set("per_page", String(newPerPage));
        
        setSelectedIds([]);
        setSearchParams(params);
    };

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
        const order = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
        updateParams({ ...filters, sort_by: field, sort_order: order }, 1);
    };

    const handleDeleteClick = (id: number) => {
        setDeleteTarget(id);
    };

    const executeDelete = () => {
        if (!deleteTarget) return;

        deleteMutation.mutate(deleteTarget, {
            onSuccess: () => {
                toast.success(t("toast.delete_success"));
                setDeleteTarget(null);
                setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget));
            },
            onError: () => {
                toast.error(t("toast.network_error"));
                setDeleteTarget(null);
            },
        });
    };

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

    // 6. Pagination & Stats Computations
    const totalItems = data?.meta.total || 0;
    const totalPages = data?.meta.last_page || 1;

    const totalCount = data?.stats.total || 0;
    const readCount = data?.stats.read || 0;
    const unreadCount = data?.stats.unread || 0;

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
                        onClick={() => navigate("/admin/notifications/send")}
                        className="px-5 py-3 bg-[#14B8A6] hover:bg-[#0f766e] text-white rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-[#14B8A6]/20 hover:shadow-[#0f766e]/30 select-none active:scale-[0.98]"
                    >
                        <Send size={16} />
                        {t("actions.send")}
                    </button>
                </div>
            </div>

            {/* Stats Summary cards */}
            <NotificationStatsRow
                total={totalCount}
                readCount={readCount}
                unreadCount={unreadCount}
                isLoading={isLoading}
                isError={isError}
            />

            {/* Filters Bar Toolbar */}
            <NotificationFilterBar
                key={`${q}-${type}-${isRead}-${userId}`}
                filters={filters}
                onFilterChange={(newF) => updateParams(newF, 1)}
                onReset={() => updateParams({}, 1)}
            />

            {/* Table Toolbar & Bulk Actions Overlay */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 p-4 rounded-3xl border border-slate-100 shadow-2xs shrink-0">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-3 animate-in fade-in duration-200">
                            <span className="text-sm font-bold text-[#0f766e] bg-[#14B8A6]/10 px-3 py-1.5 rounded-full select-none">
                                {t("table.selected", { count: selectedIds.length })}
                            </span>
                            <button
                                onClick={executeBulkDelete}
                                disabled={isBulkMutating}
                                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 select-none active:scale-[0.98]"
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
            <NotificationTable
                data={data?.data || []}
                isLoading={isLoading || isFetching}
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                onDelete={handleDeleteClick}
                sorting={{ sortBy, sortOrder }}
                onSort={handleSort}
            />

            {/* General Pagination Controls */}
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
            <DeleteNotificationDialog
                isOpen={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                isMutating={deleteMutation.isPending}
            />
        </main>
    );
};

export default NotificationList;
