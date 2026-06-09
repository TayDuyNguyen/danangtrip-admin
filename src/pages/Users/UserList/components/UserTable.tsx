import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { 
    Eye, Edit2, Ban, LockOpen, Trash2, ArrowUpDown, ChevronUp, ChevronDown,
    ShieldAlert, User, Check, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { clsx } from "clsx";
import type { UserItem } from "@/dataHelper";
import LoadingReact from "@/components/loading";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import { formatAdminTableDateTime } from "@/utils";

interface UserTableProps {
    data: UserItem[];
    isLoading: boolean;
    isRefreshing?: boolean;
    selectedIds: number[];
    onSelectRow: (id: number) => void;
    onSelectAll: (checked: boolean) => void;
    onRoleChange: (id: number, newRole: string) => void;
    onStatusToggle: (id: number, currentStatus: string) => void;
    onDelete: (id: number) => void;
    currentUserId?: number;
    sorting: { sortBy: string; sortOrder: "asc" | "desc" };
    onSort: (field: string) => void;
    // pagination
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onRefresh?: () => void;
    // bulk actions
    onBulkStatus?: (status: "active" | "banned") => void;
    onBulkDelete?: () => void;
    isBulkMutating?: boolean;
}

export const UserTable = ({
    data,
    isLoading,
    isRefreshing = false,
    selectedIds,
    onSelectRow,
    onSelectAll,
    onRoleChange,
    onStatusToggle,
    onDelete,
    currentUserId,
    sorting,
    onSort,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    onRefresh,
    onBulkStatus,
    onBulkDelete,
    isBulkMutating = false,
}: UserTableProps) => {
    const { t } = useTranslation(["user", "tour", "common"]);
    const navigate = useNavigate();
    const [activeRoleDropdownId, setActiveRoleDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const lastPage = Math.max(1, Math.ceil(total / limit));

    // Close role dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveRoleDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSortClick = (field: string) => {
        onSort(field);
    };

    const isAllSelected = data.length > 0 && selectedIds.length === data.length;
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < data.length;

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {selectedIds.length > 0 ? (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-150">
                            <span className="text-[13px] font-bold text-[#14b8a6] whitespace-nowrap">
                                {t("table.selected", { count: selectedIds.length })}
                            </span>
                            <div className="h-4 w-px bg-[#E2E8F0]" />
                            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                                <button
                                    type="button"
                                    onClick={() => onBulkStatus?.("active")}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#D1FAE5] text-[#10B981] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t("actions.bulk_activate", "Kích hoạt")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onBulkStatus?.("banned")}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t("actions.bulk_block", "Khóa")}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onBulkDelete?.()}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#FEE2E2] text-[#EF4444] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t("actions.bulk_delete", "Xóa")}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">
                                {t("title", "Danh sách người dùng")}
                            </h2>
                            {onRefresh && (
                                <button
                                    type="button"
                                    onClick={onRefresh}
                                    disabled={isRefreshing || isLoading}
                                    className={clsx(
                                        "p-1.5 rounded-md transition-all duration-150",
                                        isRefreshing ? "text-[#14b8a6]" : "text-text-secondary hover:text-[#14b8a6] active:scale-95"
                                    )}
                                    aria-label={t('common:actions.refresh', 'Làm mới')}
                                    title={t('common:actions.refresh', 'Làm mới')}
                                >
                                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                    <span className="text-[13px] text-text-secondary font-sans flex-1 min-w-0 whitespace-nowrap truncate">
                        {t('common:pagination.showing_summary', { 
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total: total
                        })}
                    </span>
                    <CustomSelect
                        options={[10, 20, 50].map(v => ({ value: v, label: t('table.items_per_page', { count: v, ns: 'tour', defaultValue: `${v} dòng` }) }))}
                        value={{ value: limit, label: t('table.items_per_page', { count: limit, ns: 'tour', defaultValue: `${limit} dòng` }) }}
                        onChange={(opt) => onLimitChange(Number((opt as Option)?.value))}
                        containerClassName="w-[120px] shrink-0"
                        className="text-[12px]"
                        menuPortalTarget={document.body}
                        size="sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface border-b border-[#E2E8F0] select-none text-[11px] uppercase font-bold text-text-secondary tracking-wider">
                            <th className="p-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = isSomeSelected;
                                    }}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 border border-slate-300 rounded text-[#14B8A6] focus:ring-[#14B8A6] accent-[#14B8A6] cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.col_user")}
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-32 text-left">
                                {t("table.col_role")}
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-28 text-left">
                                {t("table.col_orders")}
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-28 text-left">
                                {t("table.col_reviews")}
                            </th>
                            <th 
                                className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-40 cursor-pointer hover:text-slate-900 transition-colors text-left"
                                onClick={() => handleSortClick("created_at")}
                            >
                                <div className="flex items-center gap-1">
                                    {t("table.col_joined")}
                                    {sorting.sortBy === "created_at" ? (
                                        sorting.sortOrder === "asc" ? <ChevronUp size={14} className="text-[#14B8A6] shrink-0" /> : <ChevronDown size={14} className="text-[#14B8A6] shrink-0" />
                                    ) : (
                                        <ArrowUpDown size={13} className="text-slate-400 shrink-0" />
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-36 text-left">
                                {t("table.col_status")}
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-36 text-right">
                                {t("table.col_actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="py-[100px] text-center bg-white">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((userItem) => {
                                const isSelected = selectedIds.includes(userItem.id);
                                const isSelf = userItem.id === currentUserId;

                                const roleBadgeColors = {
                                    admin: "bg-indigo-50/70 border-indigo-200/50 text-indigo-700",
                                    user: "bg-slate-50/70 border-slate-200/50 text-slate-600",
                                };

                                const statusBadgeColors: Record<string, string> = {
                                    active: "bg-emerald-50/70 border-emerald-200/50 text-emerald-700",
                                    banned: "bg-rose-50/70 border-rose-200/50 text-rose-700",
                                    pending: "bg-amber-50/70 border-amber-200/50 text-amber-700",
                                };

                                return (
                                    <tr 
                                        key={userItem.id} 
                                        className={clsx(
                                            "group transition-all duration-150 border-b border-border last:border-0 hover:bg-surface",
                                            isSelected ? "bg-[#dff7f4] border-l-3 border-l-[#14b8a6]" : "",
                                            (isRefreshing || isLoading) && "opacity-60"
                                        )}
                                    >
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isSelf}
                                                onChange={() => onSelectRow(userItem.id)}
                                                className="w-4 h-4 border border-slate-300 rounded text-[#14B8A6] focus:ring-[#14B8A6] accent-[#14B8A6] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center font-bold text-sm bg-linear-to-br from-[#14b8a6] to-[#0f766e] text-white shrink-0 shadow-xs overflow-hidden">
                                                    {userItem.avatar ? (
                                                        <img src={userItem.avatar} alt={userItem.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{userItem.fullName.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5 truncate">
                                                        {userItem.fullName}
                                                        {isSelf && (
                                                            <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-sm">
                                                                {t("table.you_badge")}
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-400 leading-none mt-0.5 truncate">
                                                        {userItem.email}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 mt-1 leading-none">
                                                        {userItem.username}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Role Column */}
                                        <td className="px-6 py-4 relative">
                                            <button
                                                disabled={isSelf}
                                                type="button"
                                                onClick={() => setActiveRoleDropdownId(activeRoleDropdownId === userItem.id ? null : userItem.id)}
                                                className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border backdrop-blur-xs transition-all duration-200 uppercase cursor-pointer select-none
                                                    ${roleBadgeColors[userItem.role] || roleBadgeColors.user}
                                                    disabled:opacity-80 disabled:cursor-not-allowed
                                                `}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${userItem.role === "admin" ? "bg-indigo-500" : "bg-slate-400"}`}></span>
                                                {t(`roles.${userItem.role}`)}
                                            </button>

                                            {/* Inline dropdown panel */}
                                            {activeRoleDropdownId === userItem.id && (
                                                <div 
                                                    ref={dropdownRef}
                                                    className="absolute left-6 top-12 z-50 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-xl w-[150px] animate-in slide-in-from-top-2 duration-150"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onRoleChange(userItem.id, "user");
                                                            setActiveRoleDropdownId(null);
                                                        }}
                                                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
                                                    >
                                                        <span className="flex items-center gap-2"><User size={13} /> {t("roles.user")}</span>
                                                        {userItem.role === "user" && <Check size={12} className="text-[#14B8A6]" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            onRoleChange(userItem.id, "admin");
                                                            setActiveRoleDropdownId(null);
                                                        }}
                                                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-50 transition-all text-left"
                                                    >
                                                        <span className="flex items-center gap-2"><ShieldAlert size={13} /> {t("roles.admin")}</span>
                                                        {userItem.role === "admin" && <Check size={12} className="text-[#14B8A6]" />}
                                                    </button>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900 leading-none">
                                                {userItem.ordersCount} <span className="text-xs text-slate-400 font-semibold">{t("table.orders_suffix")}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900 leading-none">
                                                {userItem.reviewsCount} <span className="text-xs text-slate-400 font-semibold">{t("table.reviews_suffix")}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-700 leading-tight whitespace-nowrap">
                                                {formatAdminTableDateTime(userItem.createdAt)}
                                            </span>
                                        </td>

                                        {/* Status Column */}
                                        <td className="px-6 py-4">
                                            <button
                                                type="button"
                                                disabled={isSelf}
                                                onClick={() => onStatusToggle(userItem.id, userItem.status)}
                                                className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold rounded-full border backdrop-blur-xs transition-colors duration-150 uppercase cursor-pointer select-none
                                                    ${statusBadgeColors[userItem.status] || statusBadgeColors.active}
                                                    hover:brightness-95 disabled:opacity-80 disabled:cursor-not-allowed
                                                `}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${userItem.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                                                {t(`status.${userItem.status}`)}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* View button */}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(ROUTES.USERS_DETAIL.replace(":id", String(userItem.id)))}
                                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#14B8A6] hover:border-[#14B8A6] hover:bg-slate-50 transition-all cursor-pointer bg-white"
                                                    title={t("actions.view")}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                
                                                {/* Edit button */}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(ROUTES.USERS_EDIT.replace(":id", String(userItem.id)))}
                                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-600 hover:bg-slate-50 transition-all cursor-pointer bg-white"
                                                    title={t("actions.edit")}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                
                                                {/* Block/Unblock toggle */}
                                                <button
                                                    type="button"
                                                    disabled={isSelf}
                                                    onClick={() => onStatusToggle(userItem.id, userItem.status)}
                                                    className={clsx(
                                                        "w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center transition-all cursor-pointer bg-white",
                                                        userItem.status === "active" 
                                                            ? "text-slate-500 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50/50" 
                                                            : "text-slate-500 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50/50",
                                                        "disabled:opacity-30 disabled:cursor-not-allowed"
                                                    )}
                                                    title={userItem.status === "active" ? t("actions.block") : t("actions.unblock")}
                                                >
                                                    {userItem.status === "active" ? <Ban size={14} /> : <LockOpen size={14} />}
                                                </button>
                                                
                                                {/* Delete */}
                                                <button
                                                    type="button"
                                                    disabled={isSelf}
                                                    onClick={() => onDelete(userItem.id)}
                                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:border-rose-600 hover:bg-rose-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer bg-white"
                                                    title={t("actions.delete")}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={8} className="py-[80px] text-center bg-white">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <RefreshCw size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t("table.no_data")}</p>
                                            <p className="text-text-secondary text-[14px]">{t("table.no_data_sub")}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {total > 0 && (
                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-medium text-[#64748B] font-sans">
                        {t('common:pagination.showing_summary', {
                            start: total > 0 ? (page - 1) * limit + 1 : 0,
                            end: Math.min(page * limit, total),
                            total: total,
                        })}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: lastPage }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === lastPage || Math.abs(p - page) <= 1)
                                .map((p, i, arr) => (
                                    <div key={p} className="flex items-center gap-1.5">
                                        {i > 0 && arr[i - 1] !== p - 1 && (
                                            <span className="text-slate-300 font-bold px-1">...</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => onPageChange(Number(p))}
                                            className={clsx(
                                                'w-[32px] h-[32px] flex items-center justify-center rounded-md text-[13px] font-bold transition-all duration-150 shadow-sm',
                                                p === page
                                                    ? 'bg-[#14b8a6] text-white border-[#14b8a6]'
                                                    : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] active:scale-95',
                                            )}
                                        >
                                            {p}
                                        </button>
                                    </div>
                                ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= lastPage}
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTable;
