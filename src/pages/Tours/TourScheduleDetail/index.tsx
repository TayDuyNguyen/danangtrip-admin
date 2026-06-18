import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSchedule } from '@/hooks/useScheduleQueries';
import { useTourDetailQuery } from '@/hooks/useTourQueries';
import { useAdminBookingsQuery } from '@/hooks/useBookingQueries';
import { ROUTES } from '@/routes/routes';
import { isScheduleNotFoundError } from '@/utils/scheduleQueryError';
import { ScheduleInfoBox } from '../TourScheduleEdit/components/ScheduleInfoBox';
import { ScheduleStatsBlock } from '../TourScheduleEdit/components/ScheduleStatsBlock';
import { ScheduleDetailPanels } from '../components/ScheduleDetailPanels';
import { TourInfoBox } from '../TourScheduleCreate/components/TourInfoBox';
import { Button } from '@/components/ui/Button';
import LoadingReact from '@/components/loading';

const TourScheduleDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation(['schedules', 'common', 'tour']);

    const {
        data: schedule,
        isLoading: isLoadingSchedule,
        isError: isScheduleError,
        error: scheduleError,
        refetch: refetchSchedule,
    } = useSchedule(id);

    const {
        data: tour,
        isLoading: isLoadingTour,
        isError: isTourError,
        refetch: refetchTour,
    } = useTourDetailQuery(schedule?.tourId);

    const bookingsQuery = useAdminBookingsQuery(
        { tour_schedule_id: id, sort: 'booked_at', order: 'desc' },
        1,
        1,
        { enabled: Boolean(schedule) }
    );
    const bookingsCount = bookingsQuery.data?.meta?.total ?? 0;

    const schedulesListHref =
        schedule?.tourId != null
            ? `${ROUTES.TOURS_SCHEDULES}?tour_id=${schedule.tourId}`
            : ROUTES.TOURS_SCHEDULES;

    const editHref = id ? ROUTES.TOURS_SCHEDULE_EDIT.replace(':id', id) : ROUTES.TOURS_SCHEDULES;
    const bookingsHref = id ? `${ROUTES.BOOKINGS_LIST}?tour_schedule_id=${id}` : ROUTES.BOOKINGS_LIST;

    if (isLoadingSchedule) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <LoadingReact type="spokes" color="#14b8a6" />
            </div>
        );
    }

    if (isScheduleError || !schedule) {
        const notFound = isScheduleNotFoundError(scheduleError);
        return (
            <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 p-6">
                <p className="text-center text-sm font-semibold text-red-700" role="alert">
                    {notFound ? t('schedules:messages.not_found') : t('schedules:messages.server_error')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {!notFound ? (
                        <Button variant="outline" onClick={() => refetchSchedule()}>
                            <i className="ri-refresh-line mr-2" aria-hidden />
                            {t('tour:form.departures.retry')}
                        </Button>
                    ) : null}
                    <Button variant="outline" onClick={() => navigate(ROUTES.TOURS_SCHEDULES)}>
                        {t('common:actions.back')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-10 font-sans">
            <div className="border-b border-slate-200 bg-white/95 shadow-sm">
                <div className="flex w-full flex-col gap-4 px-4 py-5 sm:px-6 lg:px-10 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                            <Link to={schedulesListHref} className="transition-colors hover:text-[#14b8a6]">
                                {t('schedules:breadcrumb')}
                            </Link>
                            <i className="ri-arrow-right-s-line" aria-hidden />
                            <span className="text-[#14b8a6]">{t('schedules:detail.title')}</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            {t('schedules:detail.title')}
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" onClick={() => navigate(schedulesListHref)}>
                            {t('common:actions.back')}
                        </Button>
                        <Button
                            onClick={() => navigate(editHref)}
                            className="bg-[#F59E0B] font-bold text-white hover:bg-[#D97706]"
                        >
                            <i className="ri-pencil-line mr-2" aria-hidden />
                            {t('common:actions.edit')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-10">
                <TourInfoBox
                    tour={tour}
                    isLoading={isLoadingTour}
                    isError={isTourError}
                    onRetry={() => refetchTour()}
                />
                <ScheduleInfoBox schedule={schedule} />
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <ScheduleDetailPanels
                            schedule={schedule}
                            bookingsHref={bookingsHref}
                            bookingsCount={bookingsCount}
                        />
                    </div>
                    <div className="lg:col-span-5">
                        <ScheduleStatsBlock
                            totalSlots={schedule.totalSlots}
                            bookedSlots={schedule.bookedSlots}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourScheduleDetail;
