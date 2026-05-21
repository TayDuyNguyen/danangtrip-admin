import React, { useState } from 'react';
import { Check, X, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useAuth } from '@/store';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
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
    const isAdmin = user?.role === 'admin';

    // State for viewing comment detail modal
    const [selectedComment, setSelectedComment] = useState<{
        userName: string;
        reviewableName: string;
        comment: string;
        score: number;
        images: string[];
    } | null>(null);

    const renderStars = (score: number) => {
        return (
            <div className="flex items-center gap-0.5" title={`${score} sao`}>
                {[...Array(5)].map((_, i) => (
                    <span
                        key={i}
                        className={`text-sm ${
                            i < score ? 'text-amber-500 font-black' : 'text-slate-200'
                        }`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const renderStatusBadge = (status: RatingsReportItemViewModel['status']) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center bg-emerald-50 text-emerald-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                        Đã duyệt
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center bg-rose-50 text-rose-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full">
                        Từ chối
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center bg-amber-50 text-amber-600 font-extrabold text-[11px] px-2.5 py-1 rounded-full animate-pulse">
                        Chờ duyệt
                    </span>
                );
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl overflow-hidden shadow-xs mb-6">
                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
                    <Skeleton className="w-40 h-6" />
                    <Skeleton className="w-24 h-5" />
                </div>
                <div className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, idx) => (
                            <Skeleton key={idx} className="w-full h-12 rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.items.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-8 shadow-xs mb-6">
                <EmptyState
                    title="Không tìm thấy đánh giá nào"
                    description="Không tìm thấy đánh giá nào khớp với bộ lọc thời gian hoặc điều kiện của bạn."
                />
            </div>
        );
    }

    const { items, pagination } = data;
    const startIndex = (pagination.currentPage - 1) * pagination.perPage + 1;
    const endIndex = Math.min(pagination.currentPage * pagination.perPage, pagination.total);

    return (
        <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl overflow-hidden shadow-xs mb-6">
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-slate-50 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-white/40">
                <div>
                    <h3 className="text-[15px] font-black text-slate-800 leading-tight">Chi tiết đánh giá</h3>
                    <p className="text-[11px] font-bold text-slate-400 mt-1">Danh sách kiểm duyệt và quản lý phản hồi</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {pagination.total.toLocaleString()} đánh giá
                    </span>
                </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa điểm / Tour</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Phân loại</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px]">Đánh giá</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[280px]">Nội dung phản hồi</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px]">Trạng thái</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px]">Ngày tạo</th>
                            <th className="px-6 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[130px] text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/40 transition-colors group/row">
                                {/* 1. User */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden shadow-xs">
                                            {item.userAvatar ? (
                                                <img src={item.userAvatar} alt={item.userName} className="w-full h-full object-cover" />
                                            ) : (
                                                item.userName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-[13px] font-black text-slate-800 truncate max-w-[130px]" title={item.userName}>
                                            {item.userName}
                                        </span>
                                    </div>
                                </td>

                                {/* 2. Reviewable target */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 max-w-[200px]">
                                        <span className="text-[13px] font-bold text-slate-700 truncate" title={item.reviewableName}>
                                            {item.reviewableName}
                                        </span>
                                        <a
                                            href={
                                                item.reviewableType === 'tour'
                                                    ? `/admin/tours/edit/${item.reviewableId}`
                                                    : `/admin/locations/edit/${item.reviewableId}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-slate-400 hover:text-[#14b8a6] transition-colors shrink-0"
                                            title="Xem chi tiết trang quản lý"
                                        >
                                            <ExternalLink size={13} />
                                        </a>
                                    </div>
                                </td>

                                {/* 3. Class Type Badge */}
                                <td className="px-6 py-4">
                                    {item.reviewableType === 'tour' ? (
                                        <span className="inline-flex bg-teal-50 text-[#14b8a6] font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            Tour
                                        </span>
                                    ) : (
                                        <span className="inline-flex bg-indigo-50 text-indigo-600 font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            Địa điểm
                                        </span>
                                    )}
                                </td>

                                {/* 4. Star score */}
                                <td className="px-6 py-4">
                                    {renderStars(item.score)}
                                </td>

                                {/* 5. Comment snippet with images preview */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1.5 max-w-[260px]">
                                        <p className="text-[12px] font-bold text-slate-600 line-clamp-2 leading-relaxed" title={item.comment}>
                                            {item.comment || <em className="text-slate-300 font-normal">Không có bình luận</em>}
                                        </p>
                                        
                                        {/* Image attachments previews */}
                                        {item.images.length > 0 && (
                                            <div className="flex gap-1 overflow-x-auto py-0.5">
                                                {item.images.slice(0, 3).map((img, i) => (
                                                    <div 
                                                        key={i}
                                                        onClick={() => setSelectedComment({
                                                            userName: item.userName,
                                                            reviewableName: item.reviewableName,
                                                            comment: item.comment,
                                                            score: item.score,
                                                            images: item.images
                                                        })}
                                                        className="w-8 h-8 rounded-md border border-slate-100 shrink-0 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity"
                                                    >
                                                        <img src={img} alt="attachment" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                {item.images.length > 3 && (
                                                    <div className="w-8 h-8 bg-slate-100 rounded-md border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 select-none">
                                                        +{item.images.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* 6. Moderation Status */}
                                <td className="px-6 py-4">
                                    {renderStatusBadge(item.status)}
                                </td>

                                {/* 7. Created At */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-bold text-slate-700">{item.createdAt}</span>
                                        <span className="text-[10px] font-semibold text-slate-400 mt-0.5">{item.createdAtTime}</span>
                                    </div>
                                </td>

                                {/* 8. Quick Moderation Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 opacity-85 group-hover/row:opacity-100 transition-opacity">
                                        {/* Expand full comment */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedComment({
                                                userName: item.userName,
                                                reviewableName: item.reviewableName,
                                                comment: item.comment,
                                                score: item.score,
                                                images: item.images
                                            })}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                                            title="Xem toàn bộ nhận xét"
                                        >
                                            <Eye size={15} />
                                        </button>

                                        {/* Approve action */}
                                        {item.status !== 'approved' && (
                                            <button
                                                type="button"
                                                onClick={() => onApprove(item.id)}
                                                disabled={isModerating}
                                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
                                                title="Phê duyệt đánh giá"
                                            >
                                                <Check size={15} />
                                            </button>
                                        )}

                                        {/* Reject action */}
                                        {item.status !== 'rejected' && (
                                            <button
                                                type="button"
                                                onClick={() => onReject(item.id)}
                                                disabled={isModerating}
                                                className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
                                                title="Từ chối đánh giá"
                                            >
                                                <X size={15} />
                                            </button>
                                        )}

                                        {/* Delete action (Admin only) */}
                                        {isAdmin && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm('Bạn có chắc muốn xóa đánh giá này vĩnh viễn? Hành động này không thể hoàn tác.')) {
                                                        onDelete(item.id);
                                                    }
                                                }}
                                                disabled={isModerating}
                                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 active:scale-90 transition-all cursor-pointer disabled:opacity-50"
                                                title="Xóa vĩnh viễn"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                <span className="text-[12px] font-bold text-slate-500">
                    Hiển thị <span className="text-slate-800 font-extrabold">{startIndex}–{endIndex}</span> trong tổng số <span className="text-slate-800 font-extrabold">{pagination.total.toLocaleString()}</span> đánh giá
                </span>

                <div className="flex gap-1.5 items-center">
                    <button
                        type="button"
                        onClick={() => onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1 || isModerating}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer select-none"
                    >
                        Trước
                    </button>

                    {/* Numeric buttons */}
                    {[...Array(Math.min(5, pagination.lastPage))].map((_, i) => {
                        let pageNum = 1;
                        if (pagination.currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.lastPage - 2) {
                            pageNum = Math.max(1, pagination.lastPage - 4 + i);
                        } else {
                            pageNum = pagination.currentPage - 2 + i;
                        }

                        if (pageNum > pagination.lastPage) return null;

                        const isActive = pageNum === pagination.currentPage;

                        return (
                            <button
                                key={pageNum}
                                type="button"
                                onClick={() => onPageChange(pageNum)}
                                disabled={isModerating}
                                className={`w-8 h-8 rounded-lg text-xs font-black transition-all flex items-center justify-center cursor-pointer select-none ${
                                    isActive
                                        ? 'bg-[#14b8a6] text-white shadow-xs'
                                        : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.lastPage || isModerating}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all cursor-pointer select-none"
                    >
                        Sau
                    </button>
                </div>
            </div>

            {/* Comment detail popup modal */}
            {selectedComment && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h4 className="text-sm font-black text-slate-800">Chi tiết nhận xét</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Từ người dùng: {selectedComment.userName}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedComment(null)}
                                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        {/* Body */}
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đánh giá cho</span>
                                    <span className="text-sm font-bold text-slate-800 mt-0.5">{selectedComment.reviewableName}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Số sao</span>
                                    <div className="mt-0.5 flex justify-end">{renderStars(selectedComment.score)}</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-1 bg-slate-50/50 border border-slate-100/50 p-4 rounded-xl">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nội dung nhận xét:</span>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed whitespace-pre-wrap mt-1">
                                    {selectedComment.comment || <em className="text-slate-300 font-normal">Không có nhận xét</em>}
                                </p>
                            </div>

                            {/* Images Carousel */}
                            {selectedComment.images.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hình ảnh đính kèm ({selectedComment.images.length})</span>
                                    <div className="flex gap-2 overflow-x-auto pb-1 max-h-36">
                                        {selectedComment.images.map((img, idx) => (
                                            <a 
                                                key={idx}
                                                href={img}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-24 h-24 rounded-lg border border-slate-100 overflow-hidden shrink-0 shadow-2xs hover:opacity-90 transition-opacity"
                                            >
                                                <img src={img} alt="attachment full" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-3.5 border-t border-slate-50 bg-slate-50/30 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedComment(null)}
                                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-all active:scale-95 cursor-pointer"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RatingsReportTable;
