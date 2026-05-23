import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { 
    Eye, Edit2, Ban, LockOpen, Trash2, ArrowUpDown, ChevronUp, ChevronDown,
    ShieldAlert, User, Check
} from "lucide-react";
import type { UserItem } from "@/dataHelper";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/common/EmptyState";


interface UserTableProps {
    data: UserItem[];
    isLoading: boolean;
    selectedIds: number[];
    onSelectRow: (id: number) => void;
    onSelectAll: (checked: boolean) => void;
    onRoleChange: (id: number, newRole: string) => void;
    onStatusToggle: (id: number, currentStatus: string) => void;
    onDelete: (id: number) => void;
    onUnavailableAction: () => void;
    currentUserId?: number;
    sorting: { sortBy: string; sortOrder: "asc" | "desc" };
    onSort: (field: string) => void;
}

export const UserTable = ({
    data,
    isLoading,
    selectedIds,
    onSelectRow,
    onSelectAll,
    onRoleChange,
    onStatusToggle,
    onDelete,
    onUnavailableAction,
    currentUserId,
    sorting,
    onSort,
}: UserTableProps) => {
    const { t, i18n } = useTranslation("user");
    const navigate = useNavigate();
    const [activeRoleDropdownId, setActiveRoleDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

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

    // Render Skeletons during loading
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                    <Skeleton className="w-48 h-6 rounded-md" />
                    <Skeleton className="w-24 h-6 rounded-md" />
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 w-12"><Skeleton className="w-4 h-4 rounded-xs" /></th>
                                <th className="p-4"><Skeleton className="w-24 h-4 rounded-md" /></th>
                                <th className="p-4 w-28"><Skeleton className="w-16 h-4 rounded-md" /></th>
                                <th className="p-4 w-28"><Skeleton className="w-16 h-4 rounded-md" /></th>
                                <th className="p-4 w-28"><Skeleton className="w-16 h-4 rounded-md" /></th>
                                <th className="p-4 w-32"><Skeleton className="w-20 h-4 rounded-md" /></th>
                                <th className="p-4 w-28"><Skeleton className="w-16 h-4 rounded-md" /></th>
                                <th className="p-4 w-32"><Skeleton className="w-20 h-4 rounded-md" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="p-4"><Skeleton className="w-4 h-4 rounded-xs" /></td>
                                    <td className="p-4 flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <Skeleton className="w-32 h-4 rounded-md" />
                                            <Skeleton className="w-44 h-3 rounded-md" />
                                        </div>
                                    </td>
                                    <td className="p-4"><Skeleton className="w-16 h-6 rounded-full" /></td>
                                    <td className="p-4"><Skeleton className="w-12 h-4 rounded-md" /></td>
                                    <td className="p-4"><Skeleton className="w-12 h-4 rounded-md" /></td>
                                    <td className="p-4"><Skeleton className="w-24 h-4 rounded-md" /></td>
                                    <td className="p-4"><Skeleton className="w-16 h-6 rounded-full" /></td>
                                    <td className="p-4"><Skeleton className="w-24 h-8 rounded-md" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Render EmptyState if no data
    if (data.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 shadow-xs text-center flex flex-col items-center justify-center">
                <EmptyState
                    title={t("table.no_data")}
                    description={t("table.no_data_sub")}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs relative">
            <div className="overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 select-none">
                            <th className="p-4 w-12 text-center">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el) el.indeterminate = isSomeSelected;
                                    }}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 border border-slate-300 rounded-sm text-[#14B8A6] focus:ring-[#14B8A6] cursor-pointer"
                                />
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                {t("table.col_user")}
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-32">
                                {t("table.col_role")}
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-28">
                                <div className="flex items-center gap-1">
                                    {t("table.col_orders")}
                                </div>
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-28">
                                {t("table.col_reviews")}
                            </th>
                            <th 
                                className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-40 cursor-pointer hover:text-slate-900 transition-colors"
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
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-36">
                                {t("table.col_status")}
                            </th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-36 text-right">
                                {t("table.col_actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-sans">
                        {data.map((user) => {
                            const isSelected = selectedIds.includes(user.id);
                            const isSelf = user.id === currentUserId;

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
                                    key={user.id} 
                                    className={`
                                        hover:bg-slate-50/30 transition-all duration-150 group/row
                                        ${isSelected ? "bg-[#14B8A6]/3 border-l-4 border-l-[#14B8A6]" : ""}
                                    `}
                                >
                                    <td className="p-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isSelf}
                                            onChange={() => onSelectRow(user.id)}
                                            className="w-4 h-4 border border-slate-300 rounded-sm text-[#14B8A6] focus:ring-[#14B8A6] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center font-bold text-sm bg-linear-to-br from-[#14b8a6] to-[#0f766e] text-white shrink-0 shadow-xs overflow-hidden">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{user.fullName.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5 truncate">
                                                    {user.fullName}
                                                    {isSelf && (
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-sm">
                                                            {t("table.you_badge")}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="text-xs font-semibold text-slate-400 leading-none mt-0.5 truncate">
                                                    {user.email}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 mt-1 leading-none">
                                                    {user.username}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Role Column */}
                                    <td className="px-6 py-4 relative">
                                        <button
                                            disabled={isSelf}
                                            onClick={() => setActiveRoleDropdownId(activeRoleDropdownId === user.id ? null : user.id)}
                                            className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border backdrop-blur-xs transition-all duration-200 uppercase cursor-pointer select-none
                                                ${roleBadgeColors[user.role] || roleBadgeColors.user}
                                                disabled:opacity-80 disabled:cursor-not-allowed
                                            `}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.role === "admin" ? "bg-indigo-500" : "bg-slate-400"}`}></span>
                                            {t(`roles.${user.role}`)}
                                        </button>

                                        {/* Inline dropdown panel */}
                                        {activeRoleDropdownId === user.id && (
                                            <div 
                                                ref={dropdownRef}
                                                className="absolute left-6 top-12 z-50 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-xl w-[150px] animate-in slide-in-from-top-2 duration-150"
                                            >
                                                <button
                                                    onClick={() => {
                                                        onRoleChange(user.id, "user");
                                                        setActiveRoleDropdownId(null);
                                                    }}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all text-left"
                                                >
                                                    <span className="flex items-center gap-2"><User size={13} /> {t("roles.user")}</span>
                                                    {user.role === "user" && <Check size={12} className="text-[#14B8A6]" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onRoleChange(user.id, "admin");
                                                        setActiveRoleDropdownId(null);
                                                    }}
                                                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-50 transition-all text-left"
                                                >
                                                    <span className="flex items-center gap-2"><ShieldAlert size={13} /> {t("roles.admin")}</span>
                                                    {user.role === "admin" && <Check size={12} className="text-[#14B8A6]" />}
                                                </button>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 leading-none">
                                            {user.ordersCount} <span className="text-xs text-slate-400 font-semibold">{t("table.orders_suffix")}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-slate-900 leading-none">
                                            {user.reviewsCount} <span className="text-xs text-slate-400 font-semibold">{t("table.reviews_suffix")}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 leading-tight">
                                                {user.joinedDate}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US", { month: "short", year: "numeric" }) : ""}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Status Column */}
                                    <td className="px-6 py-4">
                                        <button
                                            disabled={isSelf}
                                            onClick={() => onStatusToggle(user.id, user.status)}
                                            className={`
                                                inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold rounded-full border backdrop-blur-xs transition-all duration-200 uppercase cursor-pointer select-none
                                                ${statusBadgeColors[user.status] || statusBadgeColors.active}
                                                hover:brightness-95 disabled:opacity-80 disabled:cursor-not-allowed
                                            `}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                                            {t(`status.${user.status}`)}
                                        </button>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {/* View button */}
                                            <button
                                                onClick={() => navigate(ROUTES.USERS_DETAIL.replace(":id", String(user.id)))}
                                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#14B8A6] hover:bg-slate-50 transition-all cursor-pointer"
                                                title={t("actions.view")}
                                            >
                                                <Eye size={14} />
                                            </button>
                                            
                                            {/* Edit button */}
                                            <button
                                                onClick={onUnavailableAction}
                                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:bg-slate-50 transition-all cursor-pointer"
                                                title={t("actions.edit")}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            
                                            {/* Block/Unblock toggle */}
                                            <button
                                                disabled={isSelf}
                                                onClick={() => onStatusToggle(user.id, user.status)}
                                                className={`
                                                    w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center transition-all cursor-pointer
                                                    ${user.status === "active" 
                                                        ? "text-slate-500 hover:text-rose-600 hover:bg-rose-50/50" 
                                                        : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/50"}
                                                    disabled:opacity-30 disabled:cursor-not-allowed
                                                `}
                                                title={user.status === "active" ? t("actions.block") : t("actions.unblock")}
                                            >
                                                {user.status === "active" ? <Ban size={14} /> : <LockOpen size={14} />}
                                            </button>
                                            
                                            {/* Delete */}
                                            <button
                                                disabled={isSelf}
                                                onClick={() => onDelete(user.id)}
                                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                                title={t("actions.delete")}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
