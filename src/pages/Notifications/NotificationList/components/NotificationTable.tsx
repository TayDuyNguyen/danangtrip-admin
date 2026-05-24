import { Trash2, CheckCircle2, Radio, BellOff, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { NotificationViewModel } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/common/EmptyState";

interface NotificationTableProps {
    data: NotificationViewModel[];
    isLoading: boolean;
    selectedIds: number[];
    onSelectRow: (id: number) => void;
    onSelectAll: (checked: boolean) => void;
    onDelete: (id: number) => void;
    sorting: { sortBy: string; sortOrder: "asc" | "desc" };
    onSort: (field: string) => void;
}

const getRelativeTimeString = (d: Date, locale: string, t: TFunction) => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (isNaN(diffMs) || diffMs < 0) return t("common:time.just_now") || "vừa xong";

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t("common:time.just_now") || "vừa xong";
    if (diffMin < 60) return `${diffMin} ${t("common:pagination.showing") === "Hiển thị" ? "phút trước" : "mins ago"}`;
    if (diffHour < 24) return `${diffHour} ${t("common:pagination.showing") === "Hiển thị" ? "giờ trước" : "hours ago"}`;
    if (diffDay < 7) return `${diffDay} ${t("common:pagination.showing") === "Hiển thị" ? "ngày trước" : "days ago"}`;

    const loc = locale.toLowerCase().startsWith("vi") ? "vi-VN" : "en-GB";
    return d.toLocaleDateString(loc, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatTime = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const NotificationTable = ({
    data,
    isLoading,
    selectedIds,
    onSelectRow,
    onSelectAll,
    onDelete,
    sorting,
    onSort,
}: NotificationTableProps) => {
    const { t, i18n } = useTranslation("notification");

    const typeBadges: Record<string, { bg: string; text: string; labelKey: string }> = {
        booking: { bg: "bg-blue-50/80 border-blue-100/50", text: "text-blue-600", labelKey: "types.booking" },
        rating: { bg: "bg-amber-50/80 border-amber-100/50", text: "text-amber-600", labelKey: "types.rating" },
        system: { bg: "bg-slate-100/80 border-slate-200/50", text: "text-slate-600", labelKey: "types.system" },
        promotion: { bg: "bg-orange-50/80 border-orange-100/50", text: "text-orange-600", labelKey: "types.promotion" },
    };

    const renderSortIcon = (field: string) => {
        if (sorting.sortBy !== field) return <ArrowUpDown size={14} className="ml-1.5 text-slate-400 group-hover:text-slate-600" />;
        return sorting.sortOrder === "asc" 
            ? <ArrowUp size={14} className="ml-1.5 text-[#14b8a6]" />
            : <ArrowDown size={14} className="ml-1.5 text-[#14b8a6]" />;
    };

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 w-[50px]"><Skeleton className="h-4 w-4 rounded-xs" /></th>
                            <th className="p-4 w-[220px]"><Skeleton className="h-4 w-28 rounded-xs" /></th>
                            <th className="p-4"><Skeleton className="h-4 w-48 rounded-xs" /></th>
                            <th className="p-4 w-[130px]"><Skeleton className="h-4 w-16 rounded-xs" /></th>
                            <th className="p-4 w-[150px]"><Skeleton className="h-4 w-20 rounded-xs" /></th>
                            <th className="p-4 w-[100px]"><Skeleton className="h-4 w-12 rounded-xs" /></th>
                            <th className="p-4 w-[80px]"><Skeleton className="h-4 w-8 rounded-xs" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(6)].map((_, i) => (
                            <tr key={i} className="border-b border-slate-50">
                                <td className="p-4"><Skeleton className="h-4 w-4 rounded-xs" /></td>
                                <td className="p-4 flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="space-y-1.5 flex-1">
                                        <Skeleton className="h-4 w-24 rounded-xs" />
                                        <Skeleton className="h-3 w-32 rounded-xs" />
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-48 rounded-xs" />
                                        <Skeleton className="h-3 w-3/4 rounded-xs" />
                                    </div>
                                </td>
                                <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                                <td className="p-4"><Skeleton className="h-4 w-20 rounded-xs" /></td>
                                <td className="p-4"><Skeleton className="h-5 w-5 rounded-full" /></td>
                                <td className="p-4"><Skeleton className="h-8 w-8 rounded-lg" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <EmptyState
                    icon={BellOff}
                    title={t("table.empty")}
                    description={t("table.empty_sub")}
                    className="py-16"
                />
            </div>
        );
    }

    const allChecked = data.length > 0 && selectedIds.length === data.length;

    return (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs max-w-full overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full border-collapse text-left min-w-[900px]">
                <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100 select-none">
                        <th className="p-4 w-[50px] text-center">
                            <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                className="w-4 h-4 rounded-md border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6]/20 cursor-pointer"
                            />
                        </th>
                        <th className="p-4 w-[220px] text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.recipient")}
                        </th>
                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.content")}
                        </th>
                        <th className="p-4 w-[130px] text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.type")}
                        </th>
                        <th 
                            className="p-4 w-[160px] text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors group"
                            onClick={() => onSort("created_at")}
                        >
                            <span className="flex items-center">
                                {t("table.time")}
                                {renderSortIcon("created_at")}
                            </span>
                        </th>
                        <th className="p-4 w-[100px] text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.is_read")}
                        </th>
                        <th className="p-4 w-[80px] text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.actions")}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        const isUnread = !item.isRead;
                        const badge = typeBadges[item.type] || { bg: "bg-slate-100", text: "text-slate-600", labelKey: "types.system" };

                        return (
                            <tr
                                key={item.id}
                                className={`
                                    border-b border-slate-50 transition-colors duration-150 select-none
                                    ${isSelected 
                                        ? "bg-blue-50/40 border-l-4 border-l-[#14b8a6]" 
                                        : isUnread 
                                            ? "bg-amber-50/20 hover:bg-slate-50/70 border-l-4 border-l-transparent" 
                                            : "hover:bg-slate-50/50 border-l-4 border-l-transparent"}
                                `}
                            >
                                {/* Checkbox cell */}
                                <td className="p-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onSelectRow(item.id)}
                                        className="w-4 h-4 rounded-md border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6]/20 cursor-pointer"
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
                                            {getRelativeTimeString(item.createdAt, i18n.language, t)}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-semibold">
                                            {formatTime(item.createdAt)}
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
                                        onClick={() => onDelete(item.id)}
                                        className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-500 rounded-xl transition-all duration-200 cursor-pointer shadow-3xs"
                                        title={t("dialog.delete_confirm")}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default NotificationTable;
