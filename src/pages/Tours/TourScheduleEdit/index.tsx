import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getScheduleSchema } from '@/validations/schedule.schema';
import type { ScheduleFormValues, ScheduleStatus } from '@/types/schedule';
import { useTourDetailQuery } from '@/hooks/useTourQueries';
import { useSchedule, useUpdateSchedule, useDeleteSchedule } from '@/hooks/useScheduleQueries';
import { TourInfoBox } from '../TourScheduleCreate/components/TourInfoBox';
import { ScheduleForm } from '../TourScheduleCreate/components/ScheduleForm';
import { SchedulePreviewBox } from '../TourScheduleCreate/components/SchedulePreviewBox';
import { ScheduleStatsBlock } from './components/ScheduleStatsBlock';
import { ScheduleInfoBox } from './components/ScheduleInfoBox';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import ScheduleDeleteDialog from '../TourSchedules/components/ScheduleDeleteDialog';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import LoadingReact from '@/components/loading';
import { cn } from '@/utils';

type ScheduleLocationState = { fromTourEdit?: boolean };

/**
 * Screen [Cập nhật lịch khởi hành]
 * Reuses components from TourScheduleCreate for consistency.
 */
const TourScheduleEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isScrolled, setIsScrolled] = useState(false);
    const fromTourEdit =
        (location.state as ScheduleLocationState | null)?.fromTourEdit === true ||
        searchParams.get('from') === 'edit';
    const { t } = useTranslation(['schedules', 'common', 'tour']);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [bypassGuard, setBypassGuard] = useState(false);

    const {
        data: schedule,
        isLoading: isLoadingSchedule,
        isError: isScheduleError,
        refetch: refetchSchedule,
    } = useSchedule(id);
    const {
        data: tour,
        isLoading: isLoadingTour,
        isError: isTourError,
        refetch: refetchTour,
    } = useTourDetailQuery(schedule?.tourId);

    const updateScheduleMutation = useUpdateSchedule();
    const deleteScheduleMutation = useDeleteSchedule();

    const resolver = useMemo(() => {
        const schema = getScheduleSchema(t, true, schedule?.bookedSlots || 0);
        return yupResolver(schema);
    }, [t, schedule]);

    const methods = useForm<ScheduleFormValues>({
        resolver: resolver as Resolver<ScheduleFormValues>,
        defaultValues: {
            startDate: '',
            endDate: '',
            totalSlots: 20,
            priceAdult: null,
            priceChild: null,
            priceInfant: null,
            status: 'AVAILABLE',
            departureCode: '',
            departurePlace: '',
            bookingDeadline: '',
        },
    });

    const tourId = schedule?.tourId;
    const schedulesListHref =
        tourId != null && tourId !== ''
            ? `${ROUTES.TOURS_SCHEDULES}?tour_id=${tourId}`
            : ROUTES.TOURS_SCHEDULES;

    const submitDisabled =
        isLoadingSchedule ||
        isScheduleError ||
        !schedule ||
        isLoadingTour ||
        isTourError ||
        !tour;

    const hasBookings = (schedule?.bookedSlots ?? 0) > 0;
    const deleteDisabled =
        hasBookings || updateScheduleMutation.isPending || deleteScheduleMutation.isPending;

    const isPastSchedule = useMemo(() => {
        if (!schedule?.startDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(schedule.startDate);
        return start < today;
    }, [schedule]);

    const { reset } = methods;

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'MAIN' || target.classList.contains('overflow-y-auto'))) {
                setIsScrolled((prev) => {
                    const currentScroll = target.scrollTop;
                    if (!prev && currentScroll > 10) return true;
                    if (prev && currentScroll < 2) return false;
                    return prev;
                });
            }
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    useEffect(() => {
        if (schedule) {
            reset({
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                totalSlots: schedule.totalSlots,
                priceAdult: schedule.priceAdult,
                priceChild: schedule.priceChild,
                priceInfant: schedule.priceInfant,
                status: schedule.status,
                departureCode: schedule.departureCode || '',
                departurePlace: schedule.departurePlace || '',
                bookingDeadline: schedule.bookingDeadline || '',
            });
        }
    }, [schedule, reset]);

    const navigateAfterMutation = useCallback(() => {
        if (fromTourEdit && tourId != null && tourId !== '') {
            navigate(ROUTES.TOURS_EDIT.replace(':id', String(tourId)));
            return;
        }
        if (tourId != null && tourId !== '') {
            navigate(`${ROUTES.TOURS_SCHEDULES}?tour_id=${tourId}`);
            return;
        }
        navigate(ROUTES.TOURS_SCHEDULES);
    }, [fromTourEdit, tourId, navigate]);

    const onSubmit = (data: ScheduleFormValues) => {
        if (!id || submitDisabled) return;

        updateScheduleMutation.mutate(
            {
                id,
                data: {
                    startDate: data.startDate,
                    endDate: data.endDate,
                    totalSlots: Number(data.totalSlots),
                    priceAdult: data.priceAdult,
                    priceChild: data.priceChild,
                    priceInfant: data.priceInfant,
                    status: data.status as ScheduleStatus,
                    departureCode: data.departureCode,
                    departurePlace: data.departurePlace,
                    bookingDeadline: data.bookingDeadline,
                },
            },
            {
                onSuccess: () => {
                    setBypassGuard(true);
                    setTimeout(() => navigateAfterMutation(), 0);
                },
            }
        );
    };

    const handleDelete = () => {
        if (!id || hasBookings) return;
        deleteScheduleMutation.mutate(id, {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setBypassGuard(true);
                setTimeout(() => navigateAfterMutation(), 0);
            },
        });
    };

    const handleCancel = useCallback(() => {
        if (fromTourEdit && tourId != null && tourId !== '') {
            navigate(ROUTES.TOURS_EDIT.replace(':id', String(tourId)));
            return;
        }
        if (tourId != null && tourId !== '') {
            navigate(`${ROUTES.TOURS_SCHEDULES}?tour_id=${tourId}`);
            return;
        }
        navigate(ROUTES.TOURS_SCHEDULES);
    }, [fromTourEdit, tourId, navigate]);

    if (isLoadingSchedule) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center">
                <LoadingReact type="spokes" color="#14b8a6" />
            </div>
        );
    }

    if (isScheduleError || !schedule) {
        return (
            <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 p-6">
                <p className="text-center text-sm font-semibold text-red-700" role="alert">
                    {t('schedules:messages.fetch_error')}
                </p>
                <Button variant="outline" onClick={() => refetchSchedule()}>
                    <i className="ri-refresh-line mr-2" aria-hidden />
                    {t('tour:form.departures.retry')}
                </Button>
            </div>
        );
    }

    const pageTitle = t('schedules:actions.edit_schedule');
    const saveLabel = t('schedules:actions.save_schedule');

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans md:pb-10">
            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md transition-all duration-300 rounded-b-2xl">
                <div
                    className={cn(
                        'flex w-full flex-col gap-4 px-4 sm:px-6 lg:px-10 md:flex-row md:items-start md:justify-between transition-all duration-300',
                        isScrolled ? 'py-3' : 'py-5 lg:py-6'
                    )}
                >
                    <div className="min-w-0 flex-1 space-y-1">
                        <div
                            className={cn(
                                'flex items-center gap-2 text-[12px] font-medium text-slate-400 transition-all duration-300',
                                isScrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
                            )}
                        >
                            <Link
                                to={schedulesListHref}
                                className="transition-colors hover:text-[#14b8a6]"
                            >
                                {t('schedules:breadcrumb')}
                            </Link>
                            <i className="ri-arrow-right-s-line" aria-hidden />
                            <span className="text-[#14b8a6]">{pageTitle}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1
                                className={cn(
                                    'font-bold tracking-tight text-slate-800 transition-all duration-300',
                                    isScrolled ? 'text-lg' : 'text-3xl'
                                )}
                            >
                                {pageTitle}
                            </h1>
                            {isScrolled && (
                                <span className="hidden md:inline-flex items-center rounded-full bg-[#fef3c7] px-2.5 py-0.5 text-[11px] font-bold text-[#b45309]">
                                    {pageTitle}
                                </span>
                            )}
                        </div>
                        <div
                            className={cn(
                                'transition-all duration-300',
                                isScrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
                            )}
                        >
                            <TourInfoBox
                                tour={tour}
                                isLoading={isLoadingTour}
                                isError={isTourError}
                                onRetry={() => refetchTour()}
                            />
                            <ScheduleInfoBox schedule={schedule} />
                        </div>
                    </div>

                    <div className="hidden shrink-0 items-center gap-3 md:flex">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="h-11 rounded-xl px-6 font-semibold text-slate-500 hover:border-red-500 hover:text-red-500 transition-all"
                        >
                            {t('common:actions.cancel')}
                        </Button>
                        <Button
                            onClick={methods.handleSubmit(onSubmit)}
                            isLoading={updateScheduleMutation.isPending}
                            disabled={submitDisabled}
                            aria-label={saveLabel}
                            className="h-11 rounded-xl bg-[#F59E0B] px-8 font-bold text-white shadow-lg shadow-[#F59E0B]/20 hover:bg-[#D97706] active:scale-95 transition-all disabled:opacity-60"
                        >
                            <i className="ri-save-line mr-2" aria-hidden />
                            {saveLabel}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="space-y-6 lg:col-span-7">
                        {isPastSchedule && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 animate-bounce items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                                        <i className="ri-alert-line text-xl" aria-hidden />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[14px] font-bold text-amber-800">
                                            {t('schedules:validation.past_event_title')}
                                        </h4>
                                        <p className="text-[12px] leading-relaxed text-amber-700/90">
                                            {t('schedules:validation.past_event_desc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
                            <FormProvider {...methods}>
                                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                                    <ScheduleForm isEdit originalStartDate={schedule.startDate} />
                                </form>
                            </FormProvider>

                            <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    disabled={deleteDisabled}
                                    title={
                                        hasBookings
                                            ? t('schedules:actions.delete_blocked_has_bookings')
                                            : undefined
                                    }
                                    className="h-10 rounded-xl border-red-200 bg-white px-5 font-bold text-red-500 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <i className="ri-delete-bin-line mr-2" aria-hidden />
                                    {t('schedules:actions.delete_this')}
                                </Button>

                                <div className="text-[12px] italic text-slate-400">
                                    {t('schedules:notices.delete_warning_hint')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
                                <h4 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-slate-800">
                                    <i className="ri-eye-line text-[#14b8a6]" aria-hidden />
                                    {t('schedules:fields.preview')}
                                </h4>

                                <SchedulePreviewBox control={methods.control} />

                                <div className="mt-6 rounded-xl border border-[#d9f99d] bg-[#f4fce3]/50 p-4">
                                    <div className="flex gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d9f99d] text-[#365314]">
                                            <i className="ri-information-line" aria-hidden />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-bold text-[#365314]">
                                                {t('common:notices.important')}
                                            </p>
                                            <p className="text-[12px] leading-relaxed text-[#3f6212]/90">
                                                {t('schedules:notices.price_override_help')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ScheduleStatsBlock
                                totalSlots={schedule.totalSlots}
                                bookedSlots={schedule.bookedSlots}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-slate-200 bg-white/90 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] backdrop-blur-lg md:hidden">
                <Button variant="ghost" onClick={handleCancel} className="font-semibold text-slate-500">
                    {t('common:actions.cancel')}
                </Button>
                <Button
                    onClick={methods.handleSubmit(onSubmit)}
                    isLoading={updateScheduleMutation.isPending}
                    disabled={submitDisabled}
                    aria-label={saveLabel}
                    className="rounded-xl bg-[#F59E0B] px-6 font-bold text-white shadow-lg shadow-[#F59E0B]/20 disabled:opacity-60"
                >
                    {saveLabel}
                </Button>
            </div>

            <ScheduleDeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                schedule={schedule}
                isDeleting={deleteScheduleMutation.isPending}
            />

            <UnsavedChangesGuard isDirty={methods.formState.isDirty && !bypassGuard} />
        </div>
    );
};

export default TourScheduleEdit;
