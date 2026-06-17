import { useTranslation } from 'react-i18next';
import type { TourViewModel } from '@/dataHelper/tour.mapper';
import { Skeleton } from '@/components/ui/Skeleton';

interface TourInfoBoxProps {
    tour?: TourViewModel;
    isLoading: boolean;
    isError?: boolean;
    onRetry?: () => void;
}

export const TourInfoBox = ({ tour, isLoading, isError, onRetry }: TourInfoBoxProps) => {
    const { t } = useTranslation(['schedules', 'common', 'tour']);

    if (isLoading) {
        return (
            <div className="mt-4 inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                className="mt-4 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                role="alert"
            >
                <p className="text-sm font-semibold text-red-700">{t('tour:messages.fetch_error')}</p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
                    >
                        <i className="ri-refresh-line" />
                        {t('tour:form.departures.retry')}
                    </button>
                )}
            </div>
        );
    }

    if (!tour) return null;

    return (
        <div className="mt-4 inline-flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 pr-6 shadow-sm transition-all hover:shadow-md hover:border-[#14b8a6]/30">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 shadow-inner">
                {tour.thumbnail ? (
                    <img
                        src={tour.thumbnail}
                        alt={tour.name}
                        className="h-full w-full object-cover transition-transform hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                        <i className="ri-image-line text-xl" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-0.5">
                <h4 className="text-[14px] font-bold text-slate-800 line-clamp-1">
                    {tour.name}
                </h4>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <i className="ri-map-pin-2-line text-[#14b8a6]" />
                        {tour.categoryName || t('tour:fields.category')}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                        <i className="ri-time-line text-[#14b8a6]" />
                        {tour.duration}
                    </span>
                </div>
            </div>
        </div>
    );
};
