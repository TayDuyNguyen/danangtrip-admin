import { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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

type ScheduleLocationState = { fromTourEdit?: boolean };

/**
 * Screen [2.9 - Thêm lịch khởi hành]
 * Implements a glassy dashboard UI with real-time preview and fallback price logic.
 */
const TourScheduleCreate = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const fromTourEdit =
        (location.state as ScheduleLocationState | null)?.fromTourEdit === true;
    const { t } = useTranslation(['schedules', 'common']);

    const { data: tour, isLoading: isLoadingTour } = useTourDetailQuery(id);
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
        },
    });

    const onSubmit = (data: ScheduleFormValues) => {
        if (!id) return;

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

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="w-full min-h-screen space-y-8 bg-slate-50 p-6 md:p-10">
            {/* Header Section */}
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                        <span>{t('schedules:breadcrumb')}</span>
                        <i className="ri-arrow-right-s-line" />
                        <span className="text-[#14b8a6]">{t('schedules:actions.add_new')}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        {t('schedules:actions.add_new')}
                    </h1>
                    <TourInfoBox tour={tour} isLoading={isLoadingTour} />
                </div>

                <div className="hidden items-center gap-3 md:flex">
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
                        className="h-11 rounded-xl bg-[#14b8a6] px-8 font-bold text-white shadow-lg shadow-[#14b8a6]/20 hover:bg-[#0d9488] active:scale-95 transition-all"
                    >
                        <i className="ri-add-line mr-2" />
                        {t('schedules:actions.add_new')}
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Form Side */}
                <div className="lg:col-span-7">
                    <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-8 shadow-sm transition-all hover:shadow-md">
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                                <ScheduleForm />
                            </form>
                        </FormProvider>
                    </div>
                </div>

                {/* Preview Side */}
                <div className="lg:col-span-5">
                    <div className="sticky top-24 space-y-6">
                        <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-md p-6 shadow-sm transition-all hover:shadow-md">
                            <h4 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-slate-800">
                                <i className="ri-eye-line text-[#14b8a6]" />
                                {t('schedules:fields.preview')}
                            </h4>

                            <SchedulePreviewBox control={methods.control} />

                            {/* Help Notice */}
                            <div className="mt-6 rounded-xl border border-[#d9f99d] bg-[#f4fce3]/50 p-4">
                                <div className="flex gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d9f99d] text-[#365314]">
                                        <i className="ri-information-line" />
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

            {/* Mobile Actions Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-slate-200 bg-white/90 backdrop-blur-lg p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden">
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
                    className="rounded-xl bg-[#14b8a6] px-6 font-bold text-white shadow-lg shadow-[#14b8a6]/20"
                >
                    {t('schedules:actions.add_new')}
                </Button>
            </div>
        </div>
    );
};

export default TourScheduleCreate;
