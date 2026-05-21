import { useTranslation } from 'react-i18next';
import { FiMessageSquare, FiStar, FiUser } from 'react-icons/fi';

import EmptyState from '@/components/common/EmptyState';
import ProgressBar from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { useLocationRatingStatsQuery, useLocationRatingsQuery } from '@/hooks/useLocationQueries';

interface LocationReviewsTabProps {
    locationId: number;
}

const LocationReviewsTab = ({ locationId }: LocationReviewsTabProps) => {
    const { t, i18n } = useTranslation('location');
    const { data: stats, isLoading: isStatsLoading } = useLocationRatingStatsQuery(locationId);
    const { data: reviews, isLoading: isReviewsLoading } = useLocationRatingsQuery(locationId);
    const reviewDateFormatter = new Intl.DateTimeFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    if (isStatsLoading || isReviewsLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-100 pb-8">
                    <div className="md:col-span-4 text-center space-y-2">
                        <Skeleton className="h-12 w-20 mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                    </div>
                    <div className="md:col-span-8 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-2 w-full" />)}
                    </div>
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
                </div>
            </div>
        );
    }

    if (!reviews?.data.length) {
        return (
            <div className="py-12">
                <EmptyState title={t('detail.reviews.empty')} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-slate-100 pb-10">
                <div className="md:col-span-4 text-center p-8 rounded-[32px] bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-center gap-3 text-amber-500 mb-2">
                        <FiStar size={48} fill="currentColor" />
                        <span className="text-6xl font-black text-slate-900">{stats?.average}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        {t('detail.stats.avg_score')}
                    </p>
                    <p className="text-[13px] font-semibold text-primary mt-4">
                        {stats?.total} {t('detail.stats.ratings')}
                    </p>
                </div>

                <div className="md:col-span-8 space-y-4 px-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                        {t('detail.reviews.distribution')}
                    </h4>
                    {[5, 4, 3, 2, 1].map((score) => {
                        const count = stats?.distribution[score] || 0;
                        const percentage = stats?.total ? (count / stats.total) * 100 : 0;

                        return (
                            <div key={score} className="flex items-center gap-4">
                                <span className="text-xs font-black text-slate-400 w-4">{score}</span>
                                <div className="flex-1">
                                    <ProgressBar
                                        value={count}
                                        max={stats?.total || 1}
                                        color={score >= 4 ? 'blue' : score >= 3 ? 'yellow' : 'red'}
                                        className="h-2 rounded-full bg-slate-100"
                                    />
                                </div>
                                <span className="text-xs font-bold text-slate-500 w-8 text-right">
                                    {Math.round(percentage)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FiMessageSquare className="text-primary" />
                    {t('detail.reviews.all_reviews')}
                </h3>

                <div className="space-y-4">
                    {reviews.data.map((review) => (
                        <div key={review.id} className="p-6 rounded-[24px] border border-slate-100 hover:border-primary/20 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        {review.userAvatar ? (
                                            <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <FiUser size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{review.userName}</h4>
                                        <p className="text-[12px] text-slate-400 font-medium">
                                            {reviewDateFormatter.format(new Date(review.createdAt))}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-500 font-bold text-sm">
                                    <FiStar size={14} fill="currentColor" />
                                    {review.score}
                                </div>
                            </div>

                            <p className="text-slate-600 text-sm leading-relaxed mb-4 pl-[60px]">
                                {review.comment || <span className="italic text-slate-400">{t('detail.reviews.no_comment')}</span>}
                            </p>

                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 pl-[60px]">
                                    {review.images.map((img, idx) => (
                                        <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100">
                                            <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LocationReviewsTab;
