import { Star, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import { Skeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import ErrorWidget from '@/components/common/ErrorWidget';
import { formatAdminShortDate } from '@/utils/dateDisplay';

interface RatingItem {
    id: number;
    rating: number;
    comment: string | null;
    status: 'approved' | 'pending' | 'rejected';
    created_at: string;
    tour?: {
        id: number;
        name: string;
        image_path?: string | null;
    } | null;
    location?: {
        id: number;
        name: string;
        image_path?: string | null;
    } | null;
}

interface UserRatingsListProps {
    ratings: RatingItem[];
    totalCount: number;
    isLoading: boolean;
    isError?: boolean;
    onRetry?: () => void;
    userId: number | string;
}

export const UserRatingsList = ({
    ratings,
    totalCount,
    isLoading,
    isError = false,
    onRetry,
    userId,
}: UserRatingsListProps) => {
    const { t, i18n } = useTranslation('user');

    const statusBadgeColors = {
        approved: "bg-emerald-50 border-emerald-100 text-emerald-700",
        pending: "bg-amber-50 border-amber-100 text-amber-700",
        rejected: "bg-rose-50 border-rose-100 text-rose-700",
    };

    const renderStars = (score: number) => {
        const stars = [];
        const rounded = Math.round(score);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={12}
                    className={i <= rounded ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                />
            );
        }
        return stars;
    };

    if (isLoading) {
        return (
            <div className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-300/15 via-slate-200/20 to-transparent shadow-sm">
                <div className="bg-white rounded-[23px] overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#F1F5F9] flex items-center justify-between">
                        <Skeleton className="w-48 h-6 rounded-md" />
                        <Skeleton className="w-16 h-6 rounded-full" />
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="w-40 h-4 rounded-md" />
                                <Skeleton className="w-24 h-3 rounded-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        // ─── Gradient border shell ───
        <div className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-300/15 via-slate-200/20 to-slate-100/10 shadow-sm hover:shadow-lg hover:from-indigo-300/25 transition-all duration-300">
            <div className="bg-white rounded-[23px] overflow-hidden">
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-[#F1F5F9]">
                    <h3 className="text-[16px] font-black text-[#0F172A] flex items-center gap-2">
                        {/* Indigo icon — semantic for reviews/ratings */}
                        <span className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg">
                            <MessageSquare size={18} />
                        </span>
                        {t('detail.section_ratings', 'Đánh giá đã viết')}
                    </h3>
                    <div className="flex items-center gap-3">
                        {!isError && (
                            <>
                                <span className="bg-[#14b8a6]/10 text-[#14b8a6] text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#14b8a6]/20">
                                    {totalCount} {t('detail.ratings_count', 'đánh giá')}
                                </span>
                                {totalCount > 0 && (
                                    <Link
                                        to={`${ROUTES.REPORTS_RATINGS}?user_id=${userId}`}
                                        className="text-xs font-black text-[#14b8a6] hover:underline transition-all"
                                    >
                                        {t('detail.view_all_ratings', 'Xem tất cả →')}
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* List Content */}
                {isError ? (
                    <div className="p-6">
                        <ErrorWidget
                            title={t('detail.ratings_load_error', 'Không tải được danh sách đánh giá')}
                            message={t('detail.ratings_load_error_desc', 'Dữ liệu đánh giá tạm thời không khả dụng. Vui lòng thử lại.')}
                            onRetry={onRetry}
                        />
                    </div>
                ) : ratings.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <EmptyState
                            title={t('detail.no_ratings', 'Chưa có đánh giá nào')}
                            description={t('detail.no_ratings_desc', 'Người dùng này chưa viết bất kỳ bình luận hay đánh giá nào.')}
                        />
                    </div>
                ) : (
                    <div className="divide-y divide-[#F1F5F9]">
                        {ratings.map((item) => {
                            const targetName = item.tour?.name || item.location?.name || '—';
                            const imageSrc = item.tour?.image_path || item.location?.image_path || undefined;

                            return (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row justify-between items-start gap-4 hover:bg-[#F8FAFC]/60 transition-all duration-150 font-sans">
                                    <div className="flex gap-4 min-w-0">
                                        {/* Thumbnail with gradient border */}
                                        <div className="p-[1px] rounded-xl bg-gradient-to-br from-[#14b8a6]/20 to-slate-200/20 shrink-0">
                                            <div className="w-11 h-11 rounded-[10px] bg-[#F8FAFC] border border-[#F1F5F9] overflow-hidden flex items-center justify-center font-bold text-[#94A3B8] select-none">
                                                {imageSrc ? (
                                                    <img src={imageSrc} alt={targetName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <MessageSquare size={16} />
                                                )}
                                            </div>
                                        </div>

                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-[#0F172A] leading-snug line-clamp-1 truncate" title={targetName}>
                                                {targetName}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                {/* Stars */}
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    {renderStars(item.rating || 0)}
                                                </div>
                                                <span className="text-xs font-black text-[#0F172A] leading-none mt-0.5">
                                                    {(item.rating || 0).toFixed(1)}
                                                </span>
                                                <span className="text-[#94A3B8] leading-none mt-0.5">|</span>
                                                <span className="text-[10px] font-bold text-[#94A3B8] leading-none mt-1">
                                                    {formatAdminShortDate(item.created_at, i18n.language)}
                                                </span>
                                            </div>
                                            {item.comment && (
                                                <p className="text-xs text-[#94A3B8] font-medium mt-3 leading-relaxed border-l-2 border-[#14b8a6]/30 pl-3">
                                                    "{item.comment}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status badge on right */}
                                    <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black rounded-full border uppercase tracking-wider self-start sm:self-center shrink-0 ${statusBadgeColors[item.status]}`}>
                                        {t(`rating_status.${item.status}`, item.status)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
