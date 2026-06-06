import React, { useState } from 'react';
import { Check, X, Trash2, Eye, ExternalLink, Star, RefreshCw } from 'lucide-react';
import { useAuth } from '@/store';
import { useTranslation } from 'react-i18next';
import type { RatingsReportItemViewModel } from '@/dataHelper/report.dataHelper';

interface RatingsReportTableProps {
    data?: {
        items: RatingsReportItemViewModel[];
        pagination: {
            currentPage: number;
            lastPage: number;
            perPage: number;
            total: number;
        };
    };
    isLoading?: boolean;
    onPageChange: (page: number) => void;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onDelete: (id: number) => void;
    isModerating?: boolean;
}

const RatingsReportTable: React.FC<RatingsReportTableProps> = ({
    data,
    isLoading = false,
    onPageChange,
    onApprove,
    onReject,
    onDelete,
    isModerating = false,
}) => {
    const { user } = useAuth();
    const { t } = useTranslation(['ratings', 'common']);
    const isAdmin = user?.role === 'admin';

    const [selectedComment, setSelectedComment] = useState<{
        userName: string;
        reviewableName: string;
        comment: string;
        score: number;
        images: string[];
    } | null>(null);

    const pagination = data?.pagination;
    const items = data?.items ?? [];
    const startIndex = pagination ? (pagination.currentPage - 1) * pagination.perPage + 1 : 0;
    const endIndex = pagination ? Math.min(pagination.currentPage * pagination.perPage, pagination.total) : 0;

    const renderStars = (score: number) => (
        <div className="flex items-center gap-0.5" title={t('modal.stars_label')}>
            {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < score ? 'text-amber-500 font-black' : 'text-slate-200'}`}>★</span>
            ))}
        </div>
    );

    const renderStatusBadge = (status: RatingsReportItemViewModel['status']) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center bg-emerald-50 text-emerald-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('filter.status_approved')}</span>;
            case 'rejected':
                return <span className="inline-flex items-center bg-rose-50 text-rose-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">{t('filter.status_rejected')}</span>;
            case 'pending':
            default:
                return <span className="inline-flex items-center bg-amber-50 text-amber-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full animate-pulse">{t('filter.status_pending')}</span>;
        }
    };

    return (
        <>
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-sm overflow-hidden flex flex-col group/card min-w-0 mb-6">
                {/* Table Header / Toolbar */}
                <div className="px-[24px] py-[16px] border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-[#F8FAFC]/50 shrink-0">
                    <div>
                        <h3 className="text-[15px] font-black text-[#0F172A] leading-tight">{t('table.details_title')}</h3>
                        <p className="text-[11px] font-bold text-[#94A3B8] mt-1">{t('table.details_subtitle')}</p>
                    </div>
                    {pagination && pagination.total > 0 && (
                        <span className="text-xs font-black text-[#0F172A]/85 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0]">
                            {t('table.total_ratings_count', { total: pagination.total.toLocaleString() })}
                        </span>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-1">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#F8FAFC]/60 border-b border-[#E2E8F0]">
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{t('table.header_user')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">{t('table.header_target')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[100px]">{t('filter.category')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[110px]">{t('stats.ratings')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[280px]">{t('table.header_feedback')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[110px]">{t('table.header_status')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[110px]">{t('table.header_date')}</th>
                                <th className="px-6 py-3.5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest w-[130px] text-right">{t('table.header_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw size={24} className="animate-spin text-[#14b8a6]" />
                                            <span className="text-sm font-bold text-slate-400">{t('common:loading')}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Star size={32} className="text-slate-200" />
                                            <p className="text-sm font-black text-slate-500">{t('table.no_comment_found', { defaultValue: 'Không tìm thấy đánh giá nào' })}</p>
                                            <p className="text-xs font-bold text-slate-400 max-w-sm">{t('table.no_comment_found_desc', { defaultValue: 'Không tìm thấy đánh giá nào khớp với bộ lọc.' })}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#14b8a6]/5 transition-colors group/row">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 border border-[#E2E8F0] flex items-center justify-center font-bold text-[#0F172A] text-xs shrink-0 overflow-hidden shadow-xs">
                                                    {item.userAvatar ? (
                                                        <img src={item.userAvatar} alt={item.userName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        item.userName.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <span className="text-[13px] font-black text-[#0F172A] truncate max-w-[130px]" title={item.userName}>{item.userName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 max-w-[200px]">
                                                <span className="text-[13px] font-bold text-[#0F172A]/90 truncate" title={item.reviewableName}>{item.reviewableName}</span>
                                                {item.reviewableId > 0 && (
                                                    <a
                                                        href={item.reviewableType === 'tour' ? `/admin/tours/edit/${item.reviewableId}` : `/admin/locations/edit/${item.reviewableId}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        className="text-[#94A3B8] hover:text-[#14b8a6] transition-colors shrink-0"
                                                        title={t('table.tooltip_view')}
                                                    >
                                                        <ExternalLink size={13} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.reviewableType === 'tour' ? (
                                                <span className="inline-flex bg-teal-50 text-[#14b8a6] font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider border border-teal-100/55">{t('filter.type_tour')}</span>
                                            ) : (
                                                <span className="inline-flex bg-indigo-50 text-indigo-600 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider border border-indigo-100/55">{t('filter.type_location')}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{renderStars(item.score)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 max-w-[260px]">
                                                <p className="text-[12px] font-bold text-[#0F172A]/85 line-clamp-2 leading-relaxed" title={item.comment}>
                                                    {item.comment || <em className="text-[#94A3B8] font-normal">{t('table.no_comment')}</em>}
                                                </p>
                                                {item.images.length > 0 && (
                                                    <div className="flex gap-1 overflow-x-auto py-0.5">
                                                        {item.images.slice(0, 3).map((img, i) => (
                                                            <div key={i} onClick={() => setSelectedComment({ userName: item.userName, reviewableName: item.reviewableName, comment: item.comment, score: item.score, images: item.images })}
                                                                className="w-8 h-8 rounded-md border border-[#E2E8F0] shrink-0 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity">
                                                                <img src={img} alt={t('table.attachment_alt')} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))}
                                                        {item.images.length > 3 && (
                                                            <div className="w-8 h-8 bg-[#F8FAFC] rounded-md border border-[#E2E8F0] flex items-center justify-center text-[10px] font-black text-[#94A3B8] shrink-0 select-none">
                                                                +{item.images.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{renderStatusBadge(item.status)}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[12px] font-bold text-[#0F172A]/90 whitespace-nowrap">
                                                {item.createdAtTime ? `${item.createdAtTime} ${item.createdAt}` : item.createdAt}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 opacity-85 group-hover/row:opacity-100 transition-opacity">
                                                <button type="button" onClick={() => setSelectedComment({ userName: item.userName, reviewableName: item.reviewableName, comment: item.comment, score: item.score, images: item.images })}
                                                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#14b8a6] hover:bg-[#14b8a6]/10 transition-all cursor-pointer" title={t('table.tooltip_view')}>
                                                    <Eye size={15} />
                                                </button>
                                                {item.id > 0 && item.status !== 'approved' && (
                                                    <button type="button" onClick={() => onApprove(item.id)} disabled={isModerating}
                                                        className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer disabled:opacity-50" title={t('table.tooltip_approve')}>
                                                        <Check size={15} />
                                                    </button>
                                                )}
                                                {item.id > 0 && item.status !== 'rejected' && (
                                                    <button type="button" onClick={() => onReject(item.id)} disabled={isModerating}
                                                        className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 active:scale-90 transition-all cursor-pointer disabled:opacity-50" title={t('table.tooltip_reject')}>
                                                        <X size={15} />
                                                    </button>
                                                )}
                                                {isAdmin && item.id > 0 && (
                                                    <button type="button" onClick={() => { if (window.confirm(t('table.confirm_delete'))) onDelete(item.id); }} disabled={isModerating}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 active:scale-90 transition-all cursor-pointer disabled:opacity-50" title={t('table.tooltip_delete')}>
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {!isLoading && pagination && pagination.total > 0 && (
                    <div className="px-[24px] py-[16px] border-t border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F8FAFC]/50 shrink-0">
                        <span className="text-[12px] font-bold text-[#94A3B8]">
                            {t('table.pagination_showing', { from: startIndex, to: endIndex, total: pagination.total.toLocaleString() })}
                        </span>
                        <div className="flex gap-1.5 items-center">
                            <button type="button" onClick={() => onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1 || isModerating}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 cursor-pointer select-none">
                                {t('common:pagination.previous')}
                            </button>
                            {[...Array(Math.min(5, pagination.lastPage))].map((_, i) => {
                                let pageNum = 1;
                                if (pagination.currentPage <= 3) pageNum = i + 1;
                                else if (pagination.currentPage >= pagination.lastPage - 2) pageNum = Math.max(1, pagination.lastPage - 4 + i);
                                else pageNum = pagination.currentPage - 2 + i;
                                if (pageNum > pagination.lastPage) return null;
                                const isActive = pageNum === pagination.currentPage;
                                return (
                                    <button key={pageNum} type="button" onClick={() => onPageChange(pageNum)} disabled={isModerating}
                                        className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer select-none ${isActive ? 'bg-[#14b8a6] text-white shadow-xs' : 'bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5'}`}>
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button type="button" onClick={() => onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.lastPage || isModerating}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:bg-[#14b8a6]/5 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all duration-150 cursor-pointer select-none">
                                {t('common:pagination.next')}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Comment Detail Modal */}
            {selectedComment && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-black text-slate-800">{t('modal.title')}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{t('modal.user_label', { name: selectedComment.userName })}</p>
                            </div>
                            <button onClick={() => setSelectedComment(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('modal.target_label')}</span>
                                    <span className="text-sm font-bold text-slate-800 mt-0.5">{selectedComment.reviewableName}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('modal.stars_label')}</span>
                                    <div className="mt-0.5 flex justify-end">{renderStars(selectedComment.score)}</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 bg-slate-50/50 border border-slate-100/50 p-4 rounded-xl">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('modal.comment_label')}</span>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap mt-1">
                                    {selectedComment.comment || <em className="text-slate-300 font-normal">{t('modal.no_comment')}</em>}
                                </p>
                            </div>
                            {selectedComment.images.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('modal.images_label', { count: selectedComment.images.length })}</span>
                                    <div className="flex gap-2 overflow-x-auto pb-1 max-h-36">
                                        {selectedComment.images.map((img, idx) => (
                                            <a key={idx} href={img} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-lg border border-slate-100 overflow-hidden shrink-0 shadow-2xs hover:opacity-90 transition-opacity">
                                                <img src={img} alt="attachment full" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-3.5 border-t border-slate-50 bg-slate-50/30 flex justify-end">
                            <button type="button" onClick={() => setSelectedComment(null)}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-all active:scale-95 cursor-pointer">
                                {t('common:actions.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RatingsReportTable;
