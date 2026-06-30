import { useState, useRef, useEffect } from "react";
import { Trash2, Edit, Eye, ArrowUpDown, ArrowUp, ArrowDown, FileText, ChevronDown, Check, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import type { BlogPostViewModel } from "@/types";
import { useNavigate } from "react-router-dom";
import LoadingReact from "@/components/loading";
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import { ROUTES } from "@/routes/routes";
import { formatAdminTableDateTime, formatAdminTableTemporal } from "@/utils";

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
    // pagination
    page: number;
    perPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onRefresh?: () => void;
    // bulk actions
    onBulkStatusChange?: (status: 'published' | 'archived') => void;
    onBulkDelete?: () => void;
    isBulkMutating?: boolean;
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
    page,
    perPage,
    totalItems,
    onPageChange,
    onPerPageChange,
    onRefresh,
    onBulkStatusChange,
    onBulkDelete,
    isBulkMutating = false,
}: BlogTableProps) => {
    const { t } = useTranslation(["blog", "tour", "common"]);
    const navigate = useNavigate();
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const lastPage = Math.max(1, Math.ceil(totalItems / perPage));

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

    const [now] = useState(() => Date.now());

    const isScheduled = (date: Date | null, status: string) => {
        if (!date || status !== "published") return false;
        return date.getTime() > now;
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
                                {t('table.selected', { count: selectedIds.length })}
                            </span>
                            <div className="h-4 w-px bg-[#E2E8F0]" />
                            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                                <button
                                    type="button"
                                    onClick={() => onBulkStatusChange?.('published')}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#D1FAE5] text-[#10B981] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('actions.bulk_publish', 'Xuất bản')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onBulkStatusChange?.('archived')}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('actions.bulk_archive', 'Lưu trữ')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onBulkDelete?.()}
                                    disabled={isBulkMutating}
                                    className="px-3 py-1.5 bg-[#FEE2E2] text-[#EF4444] rounded-md text-[12px] font-bold hover:brightness-95 transition-all duration-150 shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {t('actions.bulk_delete', 'Xóa')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">
                                {t('table.title', 'Danh sách bài viết')}
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
                            start: totalItems > 0 ? (page - 1) * perPage + 1 : 0,
                            end: Math.min(page * perPage, totalItems),
                            total: totalItems
                        })}
                    </span>
                    <CustomSelect
                        options={[10, 20, 50].map(v => ({ value: v, label: t('table.items_per_page', { count: v, ns: 'tour', defaultValue: `${v} dòng` }) }))}
                        value={{ value: perPage, label: t('table.items_per_page', { count: perPage, ns: 'tour', defaultValue: `${perPage} dòng` }) }}
                        onChange={(opt) => onPerPageChange(Number((opt as Option)?.value))}
                        containerClassName="w-[120px] shrink-0"
                        className="text-[12px]"
                        menuPortalTarget={document.body}
                        size="sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5">
                <table className="w-full border-collapse text-left min-w-[1000px]">
                    <thead>
                        <tr className="bg-surface border-b border-[#E2E8F0] select-none text-[11px] uppercase font-bold text-text-secondary tracking-wider">
                            <th className="p-4 w-[50px] text-center">
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    aria-label={t("common:table.select_all", "Chọn tất cả")}
                                    className="w-4 h-4 rounded border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
                                />
                            </th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.col_article")}
                            </th>
                            <th className="p-4 w-[160px] text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.col_category")}
                            </th>
                            <th 
                                className="p-4 w-[100px] text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors group text-left"
                                onClick={() => onSort("view_count")}
                            >
                                <span className="flex items-center">
                                    {t("table.col_views")}
                                    {renderSortIcon("view_count")}
                                </span>
                            </th>
                            <th 
                                className="p-4 w-[130px] text-xs font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-700 transition-colors group text-left"
                                onClick={() => onSort("created_at")}
                            >
                                <span className="flex items-center">
                                    {t("table.col_created")}
                                    {renderSortIcon("created_at")}
                                </span>
                            </th>
                            <th className="p-4 w-[140px] text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.col_published")}
                            </th>
                            <th className="p-4 w-[150px] text-xs font-black text-slate-400 uppercase tracking-widest text-left">
                                {t("table.col_status")}
                            </th>
                            <th className="p-4 w-[120px] text-center text-xs font-black text-slate-400 uppercase tracking-widest">
                                {t("table.col_actions")}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="py-[100px] text-center bg-white">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((item) => {
                                const isSelected = selectedIds.includes(item.id);
                                const statusColors = statusStyles[item.status] || statusStyles.draft;
                                const isPostScheduled = isScheduled(item.publishedAt, item.status);

                                return (
                                    <tr
                                        key={item.id}
                                        className={clsx(
                                            "group transition-all duration-150 border-b border-border last:border-0 hover:bg-surface",
                                            isSelected ? "bg-[#dff7f4] border-l-3 border-l-[#14b8a6]" : "",
                                            (isRefreshing || isLoading) && "opacity-60"
                                        )}
                                    >
                                        {/* Checkbox */}
                                        <td className="p-4 text-center select-none">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onSelectRow(item.id)}
                                                aria-label={t("common:table.select_row", {
                                                    name: item.title,
                                                    defaultValue: `Chọn ${item.title}`,
                                                })}
                                                className="w-4 h-4 rounded border-[#E2E8F0] text-[#14b8a6] focus:ring-[#14b8a6]/20 accent-[#14b8a6] cursor-pointer"
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
                                            <span>{formatAdminTableDateTime(item.createdAt)}</span>
                                        </td>

                                        {/* Ngày xuất bản */}
                                        <td className="p-4 text-slate-700 font-bold text-xs select-none">
                                            {isPostScheduled ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span>{formatAdminTableTemporal(item.publishedAt)}</span>
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-full text-[9px] font-black w-max uppercase tracking-wider">
                                                        <Clock size={8} />
                                                        {t("table.scheduled")}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span>{formatAdminTableTemporal(item.publishedAt)}</span>
                                            )}
                                        </td>

                                        {/* Trạng thái với Dropdown */}
                                        <td className="p-4 relative">
                                            <button
                                                type="button"
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
                                                                type="button"
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
                                                    type="button"
                                                    onClick={() => navigate(`/admin/blog-posts/${item.id}`)}
                                                    className="w-[30px] h-[30px] flex items-center justify-center bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#14B8A6] hover:border-[#14B8A6] rounded-[6px] transition-all duration-200 cursor-pointer shadow-sm"
                                                    aria-label={t("actions.view")}
                                                    title={t("actions.view")}
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(ROUTES.BLOG_POSTS_EDIT.replace(':id', String(item.id)))}
                                                    className="w-[30px] h-[30px] flex items-center justify-center bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#F59E0B] hover:border-[#F59E0B] rounded-[6px] transition-all duration-200 cursor-pointer shadow-sm"
                                                    aria-label={t("actions.edit")}
                                                    title={t("actions.edit")}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(item.id)}
                                                    className="w-[30px] h-[30px] flex items-center justify-center bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444] rounded-[6px] transition-all duration-200 cursor-pointer shadow-sm"
                                                    aria-label={t("actions.delete")}
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
                                            <p className="text-[#1E293B] font-bold text-[16px]">{t("empty.title")}</p>
                                            <p className="text-text-secondary text-[14px]">{t("empty.subtitle")}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && (
                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-surface flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-[13px] font-medium text-[#64748B] font-sans">
                        {t('common:pagination.showing_summary', {
                            start: totalItems > 0 ? (page - 1) * perPage + 1 : 0,
                            end: Math.min(page * perPage, totalItems),
                            total: totalItems,
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

export default BlogTable;
