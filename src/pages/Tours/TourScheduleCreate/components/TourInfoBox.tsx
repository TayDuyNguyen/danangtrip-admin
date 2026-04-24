import { useTranslation } from 'react-i18next';
import type { TourItem } from '@/dataHelper/tour.dataHelper';
import { Skeleton } from '@/components/ui/Skeleton';

interface TourInfoBoxProps {
    tour?: TourItem;
    isLoading: boolean;
}

export const TourInfoBox = ({ tour, isLoading }: TourInfoBoxProps) => {
    const { t } = useTranslation(['schedules', 'common']);

    if (isLoading) {
        return (
            <div className="mt-2 inline-flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-3.5 py-2.5">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
        );
    }

    if (!tour) return null;

    return (
        <div className="mt-2 inline-flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2.5 shadow-sm transition-all hover:border-blue-300">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white">
                {tour.thumbnail ? (
                    <img
                        src={tour.thumbnail}
                        alt={tour.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                        <i className="ri-image-line text-lg" />
                    </div>
                )}
            </div>

            <div className="flex flex-col">
                <span className="text-[13px] font-semibold leading-tight text-blue-700 line-clamp-1">
                    {t('schedules:filters.tour_label')}: {tour.name}
                </span>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-medium text-blue-600">
                        {tour.duration}
                    </span>
                    {tour.rating && (
                        <span className="flex items-center gap-0.5 text-[11px] font-medium text-amber-500">
                            <i className="ri-star-fill" />
                            {tour.rating}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
