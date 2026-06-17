import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, FormProvider } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getScheduleSchema } from '@/validations/schedule.schema';
import type { ScheduleFormValues, ScheduleStatus } from '@/types/schedule';
import { useTourDetailQuery } from '@/hooks/useTourQueries';
import { useCreateSchedule } from '@/hooks/useScheduleQueries';
import { TourInfoBox } from './components/TourInfoBox';
import { ScheduleForm } from './components/ScheduleForm';
import { SchedulePreviewBox } from './components/SchedulePreviewBox';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import { cn } from '@/utils';

type ScheduleLocationState = { fromTourEdit?: boolean };

/**
 * Screen [2.9 - Thêm lịch khởi hành]
 * Implements a glassy dashboard UI with real-time preview and fallback price logic.
 */
const TourScheduleCreate = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isScrolled, setIsScrolled] = useState(false);
    const fromTourEdit =
        (location.state as ScheduleLocationState | null)?.fromTourEdit === true ||
        searchParams.get('from') === 'edit';
    const { t } = useTranslation(['schedules', 'common']);

    const {
        data: tour,
        isLoading: isLoadingTour,
        isError: isTourError,
        refetch: refetchTour,
    } = useTourDetailQuery(id);
    const createScheduleMutation = useCreateSchedule();

    const schema = useMemo(() => getScheduleSchema(t), [t]);

    const methods = useForm<ScheduleFormValues>({
        resolver: yupResolver(schema) as Resolver<ScheduleFormValues>,
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

    const schedulesListHref = id
        ? `${ROUTES.TOURS_SCHEDULES}?tour_id=${id}`
        : ROUTES.TOURS_SCHEDULES;

    const submitDisabled = isLoadingTour || isTourError || !tour;

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
        if (!tour?.max_people) return;
        const suggested = Number(tour.max_people);
        if (!Number.isFinite(suggested) || suggested < 1) return;
        const current = methods.getValues('totalSlots');
        if (current === 20 || current === undefined || current === null) {
            methods.setValue('totalSlots', suggested, { shouldDirty: false });
        }
    }, [tour, methods]);

    const onSubmit = (data: ScheduleFormValues) => {
        if (!id || submitDisabled) return;

        createScheduleMutation.mutate(
            {
                tourId: id,
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
                    if (fromTourEdit && id) {
                        navigate(ROUTES.TOURS_EDIT.replace(':id', id));
                        return;
                    }
                    navigate(`${ROUTES.TOURS_SCHEDULES}?tour_id=${id}`);
                },
            }
        );
    };

    const handleCancel = useCallback(() => {
        if (fromTourEdit && id) {
            navigate(ROUTES.TOURS_EDIT.replace(':id', id));
            return;
        }
        if (id) {
            navigate(`${ROUTES.TOURS_SCHEDULES}?tour_id=${id}`);
            return;
        }
        navigate(ROUTES.TOURS_SCHEDULES);
    }, [fromTourEdit, id, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans md:pb-10">
            <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md transition-all duration-300 rounded-b-2xl">
                <div
                    className={cn(
                        'w-full px-4 sm:px-6 lg:px-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between transition-all duration-300',
                        isScrolled ? 'py-3' : 'py-5 lg:py-6'
                    )}
                >
                    <div className="min-w-0 flex-1 space-y-1">
                        <div
                            className={cn(
                                'flex items-center gap-2 text-[12px] font-medium text-slate-400 transition-all duration-300',
                                isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
                            )}
                        >
                            <Link
                                to={schedulesListHref}
                                className="transition-colors hover:text-[#14b8a6]"
                            >
                                {t('schedules:breadcrumb')}
                            </Link>
                            <i className="ri-arrow-right-s-line" aria-hidden />
                            <span className="text-[#14b8a6]">{t('schedules:actions.add_new')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h1
                                className={cn(
                                    'font-bold tracking-tight text-slate-800 transition-all duration-300',
                                    isScrolled ? 'text-lg' : 'text-3xl'
                                )}
                            >
                                {t('schedules:actions.add_new')}
                            </h1>
                            {isScrolled && (
                                <span className="hidden md:inline-flex items-center rounded-full bg-[#dff7f4] px-2.5 py-0.5 text-[11px] font-bold text-[#0f766e]">
                                    {t('schedules:actions.add_new')}
                                </span>
                            )}
                        </div>
                        <div
                            className={cn(
                                'transition-all duration-300',
                                isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'
                            )}
                        >
                            <TourInfoBox
                                tour={tour}
                                isLoading={isLoadingTour}
                                isError={isTourError}
                                onRetry={() => refetchTour()}
                            />
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
                            isLoading={createScheduleMutation.isPending}
                            disabled={submitDisabled}
                            aria-label={t('schedules:actions.add_new')}
                            className="h-11 rounded-xl bg-[#14b8a6] px-8 font-bold text-white shadow-lg shadow-[#14b8a6]/20 hover:bg-[#0d9488] active:scale-95 transition-all"
                        >
                            <i className="ri-add-line mr-2" aria-hidden />
                            {t('schedules:actions.add_new')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-8 px-4 py-8 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <div className="rounded-2xl border border-slate-200 bg-white/70 p-8 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
                            <FormProvider {...methods}>
                                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                                    <ScheduleForm />
                                </form>
                            </FormProvider>
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
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-slate-200 bg-white/90 p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] backdrop-blur-lg md:hidden">
                <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="font-semibold text-slate-500"
                >
                    {t('common:actions.cancel')}
                </Button>
                <Button
                    onClick={methods.handleSubmit(onSubmit)}
                    isLoading={createScheduleMutation.isPending}
                    disabled={submitDisabled}
                    aria-label={t('schedules:actions.add_new')}
                    className="rounded-xl bg-[#14b8a6] px-6 font-bold text-white shadow-lg shadow-[#14b8a6]/20"
                >
                    {t('schedules:actions.add_new')}
                </Button>
            </div>
        </div>
    );
};

export default TourScheduleCreate;
