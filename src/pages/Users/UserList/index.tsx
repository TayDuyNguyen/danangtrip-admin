import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Download, Plus, Trash2, Ban, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store";

import UserStatsRow from "./components/UserStatsRow";
import UserFilterBar from "./components/UserFilterBar";
import UserTable from "./components/UserTable";
import DeleteUserDialog from "./components/DeleteUserDialog";
import UpdateRoleDialog from "./components/UpdateRoleDialog";

import { useAdminUsersQuery, useUserMutations } from "@/hooks/useUserQueries";
import type { UserListFilters } from "@/dataHelper";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import Pagination from "@/components/common/Pagination";

export const UserList = () => {
    const { t } = useTranslation("user");
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Parse URL params
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 10;
    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = (searchParams.get("sort_order") as "asc" | "desc") || "desc";

    const filters: UserListFilters = { q, role, status, sort_by: sortBy, sort_order: sortOrder };

    // Queries & Mutations
    const { data, isLoading, isError } = useAdminUsersQuery(filters, page, perPage);
    const { updateRoleMutation, updateStatusMutation, deleteMutation, exportMutation } = useUserMutations();

    // Table State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    
    // Dialog States
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
    const [roleTarget, setRoleTarget] = useState<{ id: number; name: string; role: string } | null>(null);
    const [isBulkMutating, setIsBulkMutating] = useState(false);

    // Sync filters to search params helper
    const updateParams = (newFilters: UserListFilters, newPage = 1, newPerPage = perPage) => {
        const params = new URLSearchParams();
        if (newFilters.q) params.set("q", newFilters.q);
        if (newFilters.role) params.set("role", newFilters.role);
        if (newFilters.status) params.set("status", newFilters.status);
        if (newFilters.sort_by) params.set("sort_by", newFilters.sort_by);
        if (newFilters.sort_order) params.set("sort_order", newFilters.sort_order);
        params.set("page", String(newPage));
        params.set("per_page", String(newPerPage));
        setSelectedIds([]);
        setSearchParams(params);
    };


    // Handle single row selection
    const handleSelectRow = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // Handle select all rows
    const handleSelectAll = (checked: boolean) => {
        if (checked && data) {
            // Exclude current user from bulk selection for safety
            const ids = data.data.filter((item) => item.id !== currentUser?.id).map((item) => item.id);
            setSelectedIds(ids);
        } else {
            setSelectedIds([]);
        }
    };

    // Sorting trigger
    const handleSort = (field: string) => {
        const allowedSorts = ["id", "full_name", "email", "created_at"];
        if (!allowedSorts.includes(field)) return;
        const order = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
        updateParams({ ...filters, sort_by: field, sort_order: order }, 1);
    };

    // Inline Status Change (click badge or block/unblock button)
    const handleStatusToggle = (id: number, currentStatus: string) => {
        if (id === currentUser?.id) {
            toast.error(t("toast.self_action_error"));
            return;
        }

        const newStatus = currentStatus === "active" ? "banned" : "active";
        updateStatusMutation.mutate(
            { id, status: newStatus },
            {
                onSuccess: () => {
                    toast.success(t("toast.update_status_success"));
                },
                onError: () => {
                    toast.error(t("toast.network_error"));
                },
            }
        );
    };

    // Inline Role Change (confirm required if upgrading to admin)
    const handleRoleChange = (id: number, newRole: string) => {
        if (id === currentUser?.id) {
            toast.error(t("toast.self_action_error"));
            return;
        }

        const targetUser = data?.data.find((u) => u.id === id);
        if (!targetUser) return;

        if (newRole === "admin") {
            setRoleTarget({ id, name: targetUser.fullName, role: newRole });
        } else {
            executeRoleChange(id, newRole);
        }
    };

    const executeRoleChange = (id: number, role: string) => {
        updateRoleMutation.mutate(
            { id, role },
            {
                onSuccess: () => {
                    toast.success(t("toast.update_role_success"));
                    setRoleTarget(null);
                },
                onError: () => {
                    toast.error(t("toast.network_error"));
                    setRoleTarget(null);
                },
            }
        );
    };

    // User Deletion (modal confirm)
    const handleDeleteClick = (id: number) => {
        if (id === currentUser?.id) {
            toast.error(t("toast.self_action_error"));
            return;
        }

        const targetUser = data?.data.find((u) => u.id === id);
        if (targetUser) {
            setDeleteTarget({ id, name: targetUser.fullName });
        }
    };

    const executeDelete = () => {
        if (!deleteTarget) return;

        deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
                toast.success(t("toast.delete_success"));
                setDeleteTarget(null);
            },
            onError: () => {
                toast.error(t("toast.network_error"));
                setDeleteTarget(null);
            },
        });
    };

    // Bulk actions executors
    const executeBulkStatus = (status: "active" | "banned") => {
        if (selectedIds.length === 0) return;
        setIsBulkMutating(true);

        const promises = selectedIds.map((id) =>
            updateStatusMutation.mutateAsync({ id, status })
        );

        Promise.all(promises)
            .then(() => {
                toast.success(t("toast.update_status_success"));
                setSelectedIds([]);
            })
            .catch(() => {
                toast.error(t("toast.network_error"));
            })
            .finally(() => {
                setIsBulkMutating(false);
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
                toast.success(t("toast.delete_success"));
                setSelectedIds([]);
            })
            .catch(() => {
                toast.error(t("toast.network_error"));
            })
            .finally(() => {
                setIsBulkMutating(false);
            });
    };

    // Export Flow
    const handleExport = () => {
        exportMutation.mutate(
            { ...filters, fallbackFilename: "users-report.xlsx" },
            {
                onSuccess: () => {
                    toast.success(t("toast.export_success"));
                },
                onError: () => {
                    toast.error(t("toast.network_error"));
                },
            }
        );
    };

    // Count summaries for Stats Cards
    const totalUsersCount = data?.meta.total || 0;
    const activeUsersCount = data ? data.data.filter((u) => u.status === "active").length : 0;
    const bannedUsersCount = data ? data.data.filter((u) => u.status === "banned").length : 0;
    const adminCount = data ? data.data.filter((u) => u.role === "admin").length : 0;



    const perPageOptions: Option[] = [
        { value: 10, label: "10" },
        { value: 20, label: "20" },
        { value: 50, label: "50" },
    ];

    const currentPerPageOpt = perPageOptions.find((o) => o.value === perPage) || perPageOptions[0];

    return (
        <main className="p-6 max-w-7xl mx-auto flex flex-col gap-6 font-sans">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
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
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                        <Download size={16} />
                        {t("actions.export")}
                    </button>
                    <button
                        onClick={() => navigate("/admin/users/create")}
                        className="px-5 py-3 bg-[#14B8A6] hover:bg-[#0f766e] text-white rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-[#14B8A6]/20 hover:shadow-[#0f766e]/30"
                    >
                        <Plus size={16} />
                        {t("actions.create")}
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <UserStatsRow
                total={totalUsersCount}
                active={activeUsersCount}
                banned={bannedUsersCount}
                admin={adminCount}
                isLoading={isLoading}
                isError={isError}
            />

            {/* Filters Bar */}
            <UserFilterBar
                key={`${q}-${role}-${status}`}
                filters={filters}
                onFilterChange={(newF) => updateParams(newF, 1)}
                onReset={() => updateParams({}, 1)}
            />

            {/* Table Toolbar & Bulk actions overlay */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/60 p-4 rounded-3xl border border-slate-100 shadow-2xs">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-3 animate-in fade-in duration-200">
                            <span className="text-sm font-bold text-[#0f766e] bg-[#14B8A6]/10 px-3 py-1.5 rounded-full">
                                {t("table.selected", { count: selectedIds.length })}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => executeBulkStatus("active")}
                                    disabled={isBulkMutating}
                                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                    <LockOpen size={12} />
                                    {t("actions.bulk_activate")}
                                </button>
                                <button
                                    onClick={() => executeBulkStatus("banned")}
                                    disabled={isBulkMutating}
                                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                    <Ban size={12} />
                                    {t("actions.bulk_block")}
                                </button>
                                <button
                                    onClick={executeBulkDelete}
                                    disabled={isBulkMutating}
                                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                    <Trash2 size={12} />
                                    {t("actions.bulk_delete")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <span className="text-xs font-bold text-slate-400">
                            {t("subtitle")}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-end w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                        {t("table.displaying", {
                            start: data?.data.length ? (page - 1) * perPage + 1 : 0,
                            end: data?.data.length ? (page - 1) * perPage + data.data.length : 0,
                            total: totalUsersCount,
                        })}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{t("table.per_page")}</span>
                        <div className="w-[80px]">
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

            {/* Table component */}
            <UserTable
                data={data?.data || []}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                onRoleChange={handleRoleChange}
                onStatusToggle={handleStatusToggle}
                onDelete={handleDeleteClick}
                currentUserId={currentUser?.id}
                sorting={{ sortBy, sortOrder }}
                onSort={handleSort}
            />

            {/* Pagination Controls */}
            {data && data.meta.last_page > 1 && (
                <div className="mt-2 flex justify-center">
                    <Pagination
                        currentPage={page}
                        totalItems={totalUsersCount}
                        pageSize={perPage}
                        onPageChange={(p) => updateParams(filters, p)}
                    />
                </div>
            )}

            {/* Dialog Confirmation Modals */}
            <DeleteUserDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                userName={deleteTarget?.name || ""}
                isMutating={deleteMutation.isPending}
            />

            <UpdateRoleDialog
                isOpen={!!roleTarget}
                onClose={() => setRoleTarget(null)}
                onConfirm={() => roleTarget && executeRoleChange(roleTarget.id, roleTarget.role)}
                userName={roleTarget?.name || ""}
                isMutating={updateRoleMutation.isPending}
            />
        </main>
    );
};

export default UserList;
