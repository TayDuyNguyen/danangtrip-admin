import { useState, useRef, useEffect } from "react";
import { Trash2, Edit, Eye, ArrowUpDown, ArrowUp, ArrowDown, FileText, ChevronDown, Check, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { BlogPostViewModel } from "@/types";
import EmptyState from "@/components/common/EmptyState";
import { useNavigate } from "react-router-dom";
import LoadingReact from "@/components/loading";

interface BlogTableProps {
    data: BlogPostViewModel[];
    isLoading: boolean;
    isRefreshing?: boolean;
    selectedIds: number[];
    onSelectRow: (id: number) => void;
    onSelectAll: (checked: boolean) => void;
    onDelete: (id: number) => void;
    onStatusChange: (id: number, status: 'draft' | 'published' | 'archived') => void;
    sorting: { sortBy: string; sortOrder: "asc" | "desc" };
    onSort: (field: string) => void;
}

export const BlogTable = ({
    data,
    isLoading,
    isRefreshing = false,
    selectedIds,
    onSelectRow,
    onSelectAll,
    onDelete,
    onStatusChange,
    sorting,
    onSort,
}: BlogTableProps) => {
    const { t } = useTranslation("blog");
    const navigate = useNavigate();
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const statusStyles: Record<string, { bg: string; text: string; dot: string; labelKey: string }> = {
        published: { bg: "bg-emerald-50 border-emerald-100/50 hover:bg-emerald-100/50", text: "text-emerald-700", dot: "bg-emerald-500", labelKey: "status.published" },
        draft: { bg: "bg-amber-50 border-amber-100/50 hover:bg-amber-100/50", text: "text-amber-700", dot: "bg-amber-500", labelKey: "status.draft" },
        archived: { bg: "bg-slate-100 border-slate-200/50 hover:bg-slate-200/50", text: "text-slate-700", dot: "bg-slate-500", labelKey: "status.archived" },
    };

    const renderSortIcon = (field: string) => {
        if (sorting.sortBy !== field) return <ArrowUpDown size={14} className="ml-1.5 text-slate-400 group-hover:text-slate-600" />;
        return sorting.sortOrder === "asc" 
            ? <ArrowUp size={14} className="ml-1.5 text-[#14b8a6]" />
            : <ArrowDown size={14} className="ml-1.5 text-[#14b8a6]" />;
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "—";
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    };

    const formatDateTime = (date: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const [now] = useState(() => Date.now());

    const isScheduled = (date: Date | null, status: string) => {
        if (!date || status !== "published") return false;
        return date.getTime() > now;
    };

    if (isLoading && data.length === 0) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <div className="py-24">
                    <LoadingReact type="spokes" color="#14b8a6" />
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                <EmptyState
                    icon={FileText}
                    title={t("empty.title")}
                    description={t("empty.subtitle")}
                    className="py-16"
                />
            </div>
        );
    }

    const allChecked = data.length > 0 && selectedIds.length === data.length;

    return (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs max-w-full overflow-x-auto [scrollbar-width:thin] relative">
            <table className="w-full border-collapse text-left min-w-[1000px]">
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
                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.col_article")}
                        </th>
                        <th className="p-4 w-[160px] text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.col_category")}
                        </th>
                        <th 
                            className="p-4 w-[100px] text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors group"
                            onClick={() => onSort("view_count")}
                        >
                            <span className="flex items-center">
                                {t("table.col_views")}
                                {renderSortIcon("view_count")}
                            </span>
                        </th>
                        <th 
                            className="p-4 w-[130px] text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors group"
                            onClick={() => onSort("created_at")}
                        >
                            <span className="flex items-center">
                                {t("table.col_created")}
                                {renderSortIcon("created_at")}
                            </span>
                        </th>
                        <th className="p-4 w-[140px] text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.col_published")}
                        </th>
                        <th className="p-4 w-[150px] text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.col_status")}
                        </th>
                        <th className="p-4 w-[120px] text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                            {t("table.col_actions")}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        const statusColors = statusStyles[item.status] || statusStyles.draft;
                        const isPostScheduled = isScheduled(item.publishedAt, item.status);

                        return (
                            <tr
                                key={item.id}
                                className={`
                                    border-b border-slate-50 transition-colors duration-150
                                    ${isSelected 
                                        ? "bg-blue-50/40 border-l-4 border-l-[#14b8a6]" 
                                        : "hover:bg-slate-50/50 border-l-4 border-l-transparent"}
                                    ${isRefreshing ? "opacity-60" : ""}
                                `}
                            >
                                {/* Checkbox */}
                                <td className="p-4 text-center select-none">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => onSelectRow(item.id)}
                                        className="w-4 h-4 rounded-md border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6]/20 cursor-pointer"
                                    />
                                </td>

                                {/* Blog Post title, cover image, excerpt, author */}
                                <td className="p-4 max-w-[350px]">
                                    <div className="flex gap-3">
                                        <div className="w-[64px] h-[48px] rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0 shadow-3xs relative select-none">
                                            {item.featuredImage ? (
                                                <img
                                                    src={item.featuredImage}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=120&q=80";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                    <FileText size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex flex-col justify-center">
                                            <h4 
                                                onClick={() => navigate(`/admin/blog-posts/${item.id}`)}
                                                className="text-[13px] font-extrabold text-slate-800 hover:text-[#14B8A6] cursor-pointer transition-colors leading-snug truncate"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-400 font-semibold truncate leading-normal mt-0.5" title={item.excerpt}>
                                                {item.excerpt}
                                            </p>
                                            
                                            {/* Author */}
                                            {item.author && (
                                                <div className="flex items-center gap-1.5 mt-1.5 select-none">
                                                    <div className="w-[18px] h-[18px] rounded-full bg-slate-200 border border-slate-100 flex items-center justify-center text-slate-600 font-extrabold shrink-0 shadow-4xs overflow-hidden">
                                                        {item.author.avatar ? (
                                                            <img src={item.author.avatar} alt={item.author.fullName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-[8px]">{item.author.fullName.charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-bold">{item.author.fullName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Categories */}
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1 select-none">
                                        {item.categories.slice(0, 2).map((c) => (
                                            <span 
                                                key={c.id} 
                                                className="inline-flex items-center px-2 py-0.5 bg-blue-50/50 border border-blue-100 text-blue-700 rounded-full text-[10px] font-bold"
                                            >
                                                {c.name}
                                            </span>
                                        ))}
                                        {item.categories.length > 2 && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-full text-[9px] font-bold">
                                                +{item.categories.length - 2}
                                            </span>
                                        )}
                                        {item.categories.length === 0 && (
                                            <span className="text-slate-300 text-xs font-bold">—</span>
                                        )}
                                    </div>
                                </td>

                                {/* Lượt xem */}
                                <td className="p-4 text-slate-700 font-bold text-xs">
                                    <div className="flex items-center gap-1">
                                        <Eye size={13} className="text-slate-400" />
                                        <span>{item.viewCount.toLocaleString()}</span>
                                    </div>
                                </td>

                                {/* Ngày tạo */}
                                <td className="p-4 text-slate-700 font-bold text-xs select-none">
                                    <span>{formatDateTime(item.createdAt)}</span>
                                </td>

                                {/* Ngày xuất bản */}
                                <td className="p-4 text-slate-700 font-bold text-xs select-none">
                                    {isPostScheduled ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span>{formatDate(item.publishedAt)}</span>
                                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-full text-[9px] font-black w-max uppercase tracking-wider">
                                                <Clock size={8} />
                                                {t("table.scheduled")}
                                            </span>
                                        </div>
                                    ) : (
                                        <span>{formatDate(item.publishedAt)}</span>
                                    )}
                                </td>

                                {/* Trạng thái với Dropdown */}
                                <td className="p-4 relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdownId(activeDropdownId === item.id ? null : item.id);
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider cursor-pointer transition-all ${statusColors.bg} ${statusColors.text}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`}></span>
                                        <span>{t(statusColors.labelKey)}</span>
                                        <ChevronDown size={11} className="opacity-60" />
                                    </button>

                                    {/* Dropdown Options */}
                                    {activeDropdownId === item.id && (
                                        <div 
                                            ref={dropdownRef}
                                            className="absolute left-4 top-12 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 w-[160px] z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {(['draft', 'published', 'archived'] as const).map((status) => {
                                                const isActive = item.status === status;
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            onStatusChange(item.id, status);
                                                            setActiveDropdownId(null);
                                                        }}
                                                        className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-left text-xs font-bold cursor-pointer transition-colors ${
                                                            isActive 
                                                                ? "bg-[#14B8A6]/10 text-[#0f766e]" 
                                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                        }`}
                                                    >
                                                        <span>{t(`actions.status_${status}`)}</span>
                                                        {isActive && <Check size={12} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </td>

                                {/* Action Buttons */}
                                <td className="p-4 text-center select-none">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button
                                            onClick={() => navigate(`/admin/blog-posts/${item.id}`)}
                                            className="p-2 bg-slate-50 hover:bg-[#14B8A6]/10 border border-slate-100 hover:border-[#14B8A6]/20 text-slate-400 hover:text-[#0f766e] rounded-xl transition-all duration-200 cursor-pointer shadow-4xs"
                                            title={t("actions.view")}
                                        >
                                            <Eye size={13} />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/blog-posts/${item.id}/edit`)}
                                            className="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-250 text-slate-400 hover:text-amber-600 rounded-xl transition-all duration-200 cursor-pointer shadow-4xs"
                                            title={t("actions.edit")}
                                        >
                                            <Edit size={13} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="p-2 bg-slate-50 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 text-slate-400 hover:text-rose-500 rounded-xl transition-all duration-200 cursor-pointer shadow-4xs"
                                            title={t("actions.delete")}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BlogTable;
