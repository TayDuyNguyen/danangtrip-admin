import { useTranslation } from 'react-i18next';
import type { RatingViewModel } from '@/dataHelper/rating.dataHelper';
import { 
    Star, MapPin, Map, Clock, Check, X, 
    Trash2, ExternalLink, ChevronLeft, ChevronRight, 
    RefreshCw, AlertTriangle, Eye, ImageIcon
} from 'lucide-react';
import clsx from 'clsx';
import CustomSelect, { type Option } from "@/components/ui/CustomSelect";
import LoadingReact from "@/components/loading";
import { Link } from 'react-router-dom';

interface RatingTableProps {
    ratings: RatingViewModel[];
    isLoading?: boolean;
    isRefreshing?: boolean;
    selectedIds: number[];
    onSelectToggle: (id: number, checked: boolean) => void;
    isSelectedAll: boolean;
    onSelectAllChange: (checked: boolean) => void;
    onMarkViewed: (id: number) => void;
    onRejectClick: (item: RatingViewModel) => void;
    onDelete: (id: number) => void;
    
    // Pagination props
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    onRefresh?: () => void;
    isMutating?: boolean;
    
    // Bulk actions
    onBulkReject: () => void;
    onBulkDelete: () => void;
}

export const RatingTable = ({
    ratings,
    isLoading,
    isRefreshing,
    selectedIds,
    onSelectToggle,
    isSelectedAll,
    onSelectAllChange,
    onMarkViewed,
    onRejectClick,
    onDelete,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    onRefresh,
    isMutating = false,
    onBulkReject,
    onBulkDelete,
}: RatingTableProps) => {
    const { t } = useTranslation(['ratings', 'tour', 'common']);
    const lastPage = Math.max(1, Math.ceil(total / limit));

    const renderStars = (score: number) => {
        return (
            <div className="flex items-center gap-0.5 shrink-0">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={12} 
                        className={i < score 
                            ? 'text-amber-500 fill-amber-500' 
                            : 'text-slate-200 fill-slate-200'
                        } 
                    />
                ))}
            </div>
        );
    };

    const getDetailsLink = (item: RatingViewModel) => {
        return item.targetType === 'tour'
            ? `/admin/tours/edit/${item.targetId}`
            : `/admin/locations/detail/${item.targetId}`;
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0 font-sans">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center px-[24px] py-[16px] border-b border-[#E2E8F0] gap-4 min-h-[69px]">
                
                {selectedIds.length > 0 ? (
                    /* Bulk Actions Active View */
                    <div className="flex items-center gap-4 w-full justify-between sm:justify-start animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isSelectedAll && ratings.length > 0}
                                onChange={(e) => onSelectAllChange(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6] cursor-pointer accent-[#14b8a6]"
                            />
                            <span className="text-xs font-black text-[#14b8a6] uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                                {t('table.selected_count', 'Đã chọn {{count}}', { count: selectedIds.length })}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onBulkReject}
                                disabled={isMutating}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                                <X size={13} />
                                <span>{t('actions.hide_bulk', 'Ẩn đã chọn')}</span>
                            </button>
                            
                            <button
                                onClick={onBulkDelete}
                                disabled={isMutating}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                                <Trash2 size={13} />
                                <span>{t('actions.delete', 'Xóa')}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Default View */
                    <>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-2">
                                <h2 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">
                                    {t("table.details_title", "Danh sách Đánh giá")}
                                </h2>
                                {onRefresh && (
                                    <button
                                        type="button"
                                        onClick={onRefresh}
                                        disabled={isRefreshing || isLoading}
                                        className={clsx(
                                            "p-1.5 rounded-md transition-all duration-150 cursor-pointer",
                                            isRefreshing ? "text-[#14b8a6]" : "text-slate-400 hover:text-[#14b8a6] active:scale-95"
                                        )}
                                        aria-label={t("common:actions.refresh", "Làm mới")}
                                        title={t("common:actions.refresh", "Làm mới")}
                                    >
                                        <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end min-w-0">
                            <span className="text-[13px] text-slate-400 font-sans flex-1 min-w-0 whitespace-nowrap truncate">
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
                    </>
                )}
            </div>

            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                        <tr className="bg-[#f8fafc] border-b border-[#E2E8F0] select-none text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                            <th className="py-4 px-6 w-[50px]">
                                <input
                                    type="checkbox"
                                    checked={isSelectedAll && ratings.length > 0}
                                    onChange={(e) => onSelectAllChange(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6] cursor-pointer accent-[#14b8a6]"
                                />
                            </th>
                            <th className="py-4 px-6 w-[180px]">{t("table.customer", "Khách hàng")}</th>
                            <th className="py-4 px-6 w-[200px]">{t("table.target", "Đánh giá cho")}</th>
                            <th className="py-4 px-6 w-[120px]">{t("table.score", "Số sao")}</th>
                            <th className="py-4 px-6">{t("table.comment", "Nội dung nhận xét")}</th>
                            <th className="py-4 px-6 w-[140px]">{t("table.status", "Trạng thái")}</th>
                            <th className="py-4 px-6 w-[120px]">{t("table.date", "Thời gian")}</th>
                            <th className="py-4 px-6 text-right w-[180px]">{t("table.actions", "Hành động")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="py-[100px] text-center bg-white">
                                    <LoadingReact />
                                </td>
                            </tr>
                        ) : ratings.length > 0 ? (
                            ratings.map((rating) => {
                                const isSelected = selectedIds.includes(rating.id);

                                return (
                                    <tr
                                        key={rating.id}
                                        className={clsx(
                                            "group transition-all duration-150 border-b border-slate-100 last:border-0 hover:bg-[#f8fafc]/50",
                                            isSelected && "bg-teal-50/10",
                                            isRefreshing && "opacity-60"
                                        )}
                                    >
                                        {/* Selection Checkbox */}
                                        <td className="py-4 px-6">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => onSelectToggle(rating.id, e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-[#14b8a6] focus:ring-[#14b8a6] cursor-pointer accent-[#14b8a6]"
                                            />
                                        </td>

                                        {/* Customer Avatar & Name */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0 overflow-hidden shadow-xs">
                                                    {rating.userAvatar ? (
                                                        <img
                                                            src={rating.userAvatar}
                                                            alt={rating.userName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        rating.userName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-slate-900 font-bold truncate max-w-[120px]">
                                                        {rating.userName}
                                                     </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Rating Target (Tour/Location) */}
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    {rating.targetType === 'tour' ? (
                                                        <span className="inline-flex items-center gap-0.5 bg-[#14b8a6]/10 text-[#0f766e] text-[10px] font-black px-1.5 py-0.5 rounded-md border border-[#14b8a6]/15">
                                                            <Map size={10} />
                                                            {t('filter.type_tour')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-indigo-100">
                                                            <MapPin size={10} />
                                                            {t('filter.type_location')}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-1 group/target">
                                                    <Link 
                                                        to={getDetailsLink(rating)}
                                                        className="text-slate-900 font-bold hover:text-[#14B8A6] transition-colors truncate max-w-[150px] leading-tight"
                                                    >
                                                        {rating.targetName}
                                                    </Link>
                                                    <a 
                                                        href={getDetailsLink(rating)} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="opacity-0 group-hover/target:opacity-100 transition-opacity text-slate-400 hover:text-[#14b8a6]"
                                                    >
                                                        <ExternalLink size={11} />
                                                    </a>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Stars count */}
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-0.5">
                                                {renderStars(rating.score)}
                                                <span className="text-[11px] font-bold text-slate-400">
                                                    {rating.score.toFixed(1)} / 5.0
                                                </span>
                                            </div>
                                        </td>

                                        {/* Content comments and images */}
                                        <td className="py-4 px-6 text-xs">
                                            <div className="max-w-[300px] md:max-w-[400px]">
                                                <p
                                                    className="text-slate-700 font-medium leading-relaxed break-words line-clamp-3"
                                                    title={rating.comment || ''}
                                                >
                                                    {rating.comment || <span className="italic text-slate-400 font-normal">{t('table.no_comment')}</span>}
                                                </p>
                                                {rating.imageCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                                                        <ImageIcon size={10} />
                                                        {t('table.image_count_badge', { count: rating.imageCount })}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-6 text-xs">
                                            <div className="flex flex-col gap-1 items-start">
                                                {/* is_new badge: Mới / Đã xem */}
                                                {rating.isNew ? (
                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                                                        <Clock size={10} />
                                                        {t('filter.read_status_new', 'Mới')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-200">
                                                        <Check size={10} />
                                                        {t('filter.read_status_viewed', 'Đã xem')}
                                                    </span>
                                                )}

                                                {/* Public status badge */}
                                                {rating.status === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full border border-rose-100">
                                                        <X size={10} />
                                                        {t('filter.status_rejected')}
                                                    </span>
                                                )}
                                                
                                                {/* Rejection reason box */}
                                                {rating.status === 'rejected' && rating.rejectedReason && (
                                                    <div className="text-[10px] text-rose-500 font-bold bg-rose-50/30 border border-rose-100/50 rounded-lg p-1.5 leading-normal max-w-[150px] break-words">
                                                        <span className="font-extrabold">{t('table.rejected_reason_label', 'Lý do')}: </span>
                                                        {rating.rejectedReason}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Created Date */}
                                        <td className="py-4 px-6 text-xs text-slate-400 leading-normal">
                                            {rating.createdAt}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end items-center gap-1.5">
                                                {/* Mark as Viewed button - only show when isNew=true */}
                                                {rating.isNew && (
                                                    <button
                                                        onClick={() => onMarkViewed(rating.id)}
                                                        disabled={isMutating}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg bg-[#14b8a6] hover:bg-[#0f766e] text-white disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                                                        title={t('table.tooltip_mark_viewed', 'Đánh dấu đã xem')}
                                                    >
                                                        <Eye size={12} />
                                                        <span>{t('actions.mark_viewed', 'Đã xem')}</span>
                                                    </button>
                                                )}

                                                {/* Hide button - always shown */}
                                                <button
                                                    onClick={() => onRejectClick(rating)}
                                                    disabled={isMutating}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold rounded-lg border border-rose-100 bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
                                                    title={t('table.tooltip_reject', 'Ẩn đánh giá')}
                                                >
                                                    <X size={12} />
                                                    <span>{t('actions.reject', 'Ẩn')}</span>
                                                </button>

                                                {/* Always Visible: Delete Button */}
                                                <button
                                                    onClick={() => onDelete(rating.id)}
                                                    disabled={isMutating}
                                                    className="inline-flex items-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                                    aria-label={t('table.tooltip_delete')}
                                                    title={t('table.tooltip_delete')}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            /* Empty State matches Payments exactly */
                            <tr>
                                <td colSpan={8} className="py-[80px] text-center bg-white">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                            <AlertTriangle size={32} className="text-[#E2E8F0]" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#1E293B] font-bold text-[16px]">
                                                {t('table.empty_title', 'Không tìm thấy đánh giá')}
                                            </p>
                                            <p className="text-slate-400 text-[14px]">
                                                {t('table.empty_subtitle', 'Không có dữ liệu đánh giá nào khớp với bộ lọc hiện tại của bạn.')}
                                            </p>
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
                <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#f8fafc]/50 rounded-b-[16px] flex flex-col sm:flex-row items-center justify-between gap-4">
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
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm cursor-pointer active:scale-90"
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
                                                'w-[32px] h-[32px] flex items-center justify-center rounded-md text-[13px] font-bold transition-all duration-150 shadow-sm cursor-pointer',
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
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-md bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#14b8a6] hover:text-[#14b8a6] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 shadow-sm cursor-pointer active:scale-90"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatingTable;
