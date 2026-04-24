import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const TourScheduleCreate = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
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
                    navigate(`${ROUTES.TOURS_SCHEDULES}?tour_id=${id}`);
                },
            }
        );
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="mx-auto max-w-[1200px] space-y-8 p-6 md:p-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                        <span>{t('schedules:breadcrumb')}</span>
                        <i className="ri-arrow-right-s-line" />
                        <span className="text-blue-600">{t('schedules:actions.add_new')}</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        {t('schedules:actions.add_new')}
                    </h1>
                    <TourInfoBox tour={tour} isLoading={isLoadingTour} />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="h-11 rounded-xl px-6 font-semibold text-slate-500 hover:border-red-500 hover:text-red-500"
                    >
                        {t('common:actions.cancel')}
                    </Button>
                    <Button
                        onClick={methods.handleSubmit(onSubmit)}
                        isLoading={createScheduleMutation.isPending}
                        className="h-11 rounded-xl bg-blue-700 px-8 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-800"
                    >
                        <i className="ri-add-line mr-2" />
                        {t('schedules:actions.add_new')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(onSubmit)}>
                                <ScheduleForm />
                            </form>
                        </FormProvider>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h4 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-slate-800">
                            <i className="ri-eye-line text-blue-600" />
                            {t('schedules:fields.preview')}
                        </h4>

                        <SchedulePreviewBox control={methods.control} />

                        <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4">
                            <div className="flex gap-3">
                                <i className="ri-information-line text-xl text-amber-500" />
                                <div className="space-y-1">
                                    <p className="text-[13px] font-bold text-amber-800">
                                        {t('common:notices.important')}
                                    </p>
                                    <p className="text-[12px] leading-relaxed text-amber-700/80">
                                        {t('schedules:notices.price_override_help')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-slate-200 bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden">
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
                    className="rounded-xl bg-blue-700 px-6 font-bold text-white shadow-lg shadow-blue-200"
                >
                    {t('schedules:actions.add_new')}
                </Button>
            </div>
        </div>
    );
};

export default TourScheduleCreate;
