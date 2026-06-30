import { Trash2, CheckCircle2, Radio, BellOff, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NotificationViewModel } from "@/types";
import { clsx } from "clsx";
import LoadingReact from "@/components/loading";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import { formatAdminTableDateTime } from "@/utils";

interface NotificationTableProps {
    data: NotificationViewModel[];
    isLoading: boolean;
    isRefreshing?: boolean;
    selectedIds: number[];
    onSelectRow: (id: number) => void;
    onSelectAll: (checked: boolean) => void;
    onDelete: (id: number) => void;
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
    onBulkDelete?: () => void;
    isBulkMutating?: boolean;
}

export const NotificationTable = ({
    data,
    isLoading,
    isRefreshing = false,
    selectedIds,
    onSelectRow,
    onSelectAll,
    onDelete,
    sorting,
    onSort,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    onRefresh,
    onBulkDelete,
    isBulkMutating = false,
}: NotificationTableProps) => {
    const { t } = useTranslation(["notification", "tour", "common"]);
    const lastPage = Math.max(1, Math.ceil(total / limit));

    const typeBadges: Record<string, { bg: string; text: string; labelKey: string }> = {
        booking: { bg: "bg-blue-50/80 border-blue-100/50", text: "text-blue-600", labelKey: "types.booking" },
        booking_payment_confirmed: { bg: "bg-blue-50/80 border-blue-100/50", text: "text-blue-600", labelKey: "types.booking" },
        tour_start_reminder: { bg: "bg-blue-50/80 border-blue-100/50", text: "text-blue-600", labelKey: "types.tour_start_reminder" },
        rating: { bg: "bg-amber-50/80 border-amber-100/50", text: "text-amber-600", labelKey: "types.rating" },
        rating_approved: { bg: "bg-amber-50/80 border-amber-100/50", text: "text-amber-600", labelKey: "types.rating" },
        rating_rejected: { bg: "bg-red-50/80 border-red-100/50", text: "text-red-600", labelKey: "types.rating" },
        point_earned: { bg: "bg-emerald-50/80 border-emerald-100/50", text: "text-emerald-600", labelKey: "types.point" },
        point_voucher_redeemed: { bg: "bg-orange-50/80 border-orange-100/50", text: "text-orange-600", labelKey: "types.voucher" },
        contact_reply: { bg: "bg-cyan-50/80 border-cyan-100/50", text: "text-cyan-600", labelKey: "types.contact" },
        system: { bg: "bg-slate-100/80 border-slate-200/50", text: "text-slate-600", labelKey: "types.system" },
        promotion: { bg: "bg-orange-50/80 border-orange-100/50", text: "text-orange-600", labelKey: "types.promotion" },
    };

    const renderSortIcon = (field: string) => {
        if (sorting.sortBy !== field) return <ArrowUpDown size={14} className="ml-1.5 text-slate-400 group-hover:text-slate-600" />;
        return sorting.sortOrder === "asc" 
            ? <ArrowUp size={14} className="ml-1.5 text-[#14b8a6]" />
            : <ArrowDown size={14} className="ml-1.5 text-[#14b8a6]" />;
    };

    const allChecked = data.length > 0 && selectedIds.length === data.length;

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
                                {t("title", "Danh sách Thông báo")}
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
                <table className="w-full border-collapse text-left min-w-[900px]">
                    <thead>
                        <tr className="bg-surface border-b border-[#E2E8F0] select-none text-[11px] uppercase font-bold text-text-secondary tracking-wider">
                            <th className="p-4 w-[50px] text-center">
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
                                />
                            </th>
                            <th className="p-4 w-[220px] text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.recipient")}
                            </th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.content")}
                            </th>
                            <th className="p-4 w-[130px] text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.type")}
                            </th>
                            <th 
                                className="p-4 w-[160px] text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors group text-left"
                                onClick={() => onSort("created_at")}
                            >
                                <span className="flex items-center">
                                    {t("table.time")}
                                    {renderSortIcon("created_at")}
                                </span>
                            </th>
                            <th className="p-4 w-[100px] text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.is_read")}
                            </th>
                            <th className="p-4 w-[80px] text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                {t("table.actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="py-[100px] text-center bg-white">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                const isUnread = !item.isRead;
                                const badge = typeBadges[item.type] || { bg: "bg-slate-100", text: "text-slate-600", labelKey: "types.system" };

                                return (
                                    <tr
                                        key={item.id}
                                        className={clsx(
                                            "group transition-all duration-150 border-b border-border last:border-0 hover:bg-surface",
                                            isSelected ? "bg-[#dff7f4] border-l-3 border-l-[#14b8a6]" : "",
                                            isUnread && !isSelected ? "bg-amber-50/10 hover:bg-slate-50/70 border-l-3 border-l-transparent" : "",
                                            (isRefreshing || isLoading) && "opacity-60"
                                        )}
                                    >
                                        {/* Checkbox cell */}
                                        <td className="p-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onSelectRow(item.id)}
                                                className="w-4 h-4 rounded border-[#E2E8F0] text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
                                            />
                                        </td>

                                        {/* Recipient User info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-700 font-extrabold shrink-0 shadow-xs relative overflow-hidden select-none">
                                                    <span className="text-xs">
                                                        {item.recipientName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-[13px] font-bold truncate ${isUnread ? "text-slate-900 font-extrabold" : "text-slate-700"}`}>
                                                        {item.recipientName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-semibold truncate">
                                                        {item.recipientEmail}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Notification Content */}
                                        <td className="p-4 max-w-[320px]">
                                            <div className="min-w-0">
                                                <p className={`text-[13px] font-bold truncate mb-0.5 ${isUnread ? "text-slate-900 font-extrabold" : "text-slate-700"}`}>
                                                    {item.title}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-medium truncate">
                                                    {item.content}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Notification Category Type badge */}
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                                                {t(badge.labelKey)}
                                            </span>
                                        </td>

                                        {/* Dynamic Timestamp */}
                                        <td className="p-4">
                                            <div>
                                                <p className={`text-[12px] font-bold ${isUnread ? "text-slate-900 font-extrabold" : "text-slate-700"}`}>
                                                    {formatAdminTableDateTime(item.createdAt)}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Read status icon */}
                                        <td className="p-4">
                                            {item.isRead ? (
                                                <CheckCircle2 size={18} className="text-emerald-500" />
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <Radio size={18} className="text-amber-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wide hidden sm:inline">{t("statuses.unread")}</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Single Delete Action */}
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => onDelete(item.id)}
                                                className="w-[30px] h-[30px] flex items-center justify-center bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444] rounded-[6px] transition-all duration-200 cursor-pointer shadow-sm"
                                                title={t("dialog.delete_confirm")}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-[80px] text-center bg-white">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <BellOff size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t("table.empty")}</p>
                                            <p className="text-text-secondary text-[14px]">{t("table.empty_sub")}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
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
                                .reduce<number[]>((pages, p) => {
                                    if (p === 1 || p === lastPage || Math.abs(p - page) <= 1) {
                                        pages.push(p);
                                    }
                                    return pages;
                                }, [])
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

export default NotificationTable;
