import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@/components/ui/TextInput';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import CustomSelect from '@/components/ui/CustomSelect';
import type { ScheduleFormValues } from '@/types/schedule';

function ymdToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

type ScheduleFormProps = {
    isEdit?: boolean;
    originalStartDate?: string;
};

export const ScheduleForm = ({ isEdit = false, originalStartDate }: ScheduleFormProps) => {
    const { t } = useTranslation(['schedules', 'common']);
    const {
        register,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<ScheduleFormValues>();

    const todayYmd = useMemo(() => ymdToday(), []);
    const startDate = watch('startDate');
    const endDate = watch('endDate');
    const startDateMin = isEdit ? undefined : todayYmd;
    const endDateMin = isEdit ? startDate || originalStartDate : startDate || todayYmd;

    useEffect(() => {
        if (!startDate) return;
        if (!endDate) {
            setValue('endDate', startDate, { shouldValidate: true, shouldDirty: true });
        }
    }, [startDate, endDate, setValue]);

    const statusOptions = [
        {
            value: 'AVAILABLE',
            label: (
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#14b8a6]" />
                    {t('schedules:status.available')}
                </div>
            ),
        },
        {
            value: 'CANCELLED',
            label: (
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    {t('schedules:status.cancelled')}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dff7f4] text-[#14b8a6]">
                        <i className="ri-calendar-event-line text-lg" aria-hidden />
                    </div>
                    <h3 className="text-[16px] font-bold text-slate-800">{t('schedules:title')}</h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="schedule-start-date" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.start_date')} <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            id="schedule-start-date"
                            type="date"
                            min={startDateMin}
                            {...register('startDate')}
                            invalid={!!errors.startDate}
                            leftIcon={<i className="ri-calendar-line text-[#14b8a6]" aria-hidden />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.startDate && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" aria-hidden />
                                {errors.startDate.message as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="schedule-end-date" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.end_date')} <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            id="schedule-end-date"
                            type="date"
                            min={endDateMin}
                            {...register('endDate')}
                            invalid={!!errors.endDate}
                            leftIcon={<i className="ri-calendar-check-line text-[#14b8a6]" aria-hidden />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.endDate && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" aria-hidden />
                                {errors.endDate.message as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="schedule-total-slots" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.max_people')} <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            id="schedule-total-slots"
                            type="number"
                            min={1}
                            placeholder="20"
                            {...register('totalSlots')}
                            invalid={!!errors.totalSlots}
                            leftIcon={<i className="ri-group-line text-[#14b8a6]" aria-hidden />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.totalSlots && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" aria-hidden />
                                {errors.totalSlots.message as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.status')}
                        </label>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <CustomSelect
                                    options={statusOptions}
                                    value={statusOptions.find((opt) => opt.value === field.value)}
                                    onChange={(val) => field.onChange(val?.value)}
                                    containerClassName="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                                    leftIcon={<i className="ri-checkbox-circle-line text-[#14b8a6]" aria-hidden />}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <i className="ri-settings-4-line text-lg" aria-hidden />
                    </div>
                    <h3 className="text-[16px] font-bold text-slate-800">
                        {t('schedules:fields.operational_info', 'Thông tin vận hành')}
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <label htmlFor="schedule-departure-code" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.departure_code')}
                        </label>
                        <TextInput
                            id="schedule-departure-code"
                            placeholder="VD: VN123"
                            {...register('departureCode')}
                            invalid={!!errors.departureCode}
                            leftIcon={<i className="ri-qr-code-line text-blue-500" aria-hidden />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.departureCode && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" aria-hidden />
                                {errors.departureCode.message as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="schedule-departure-place" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.departure_place')}
                        </label>
                        <TextInput
                            id="schedule-departure-place"
                            placeholder="VD: Sân bay Đà Nẵng"
                            {...register('departurePlace')}
                            invalid={!!errors.departurePlace}
                            leftIcon={<i className="ri-map-pin-2-line text-blue-500" aria-hidden />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.departurePlace && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" aria-hidden />
                                {errors.departurePlace.message as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="schedule-booking-deadline" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.booking_deadline')}
                        </label>
                        <TextInput
                            id="schedule-booking-deadline"
                            type="date"
                            max={startDate || undefined}
                            {...register('bookingDeadline')}
                            invalid={!!errors.bookingDeadline}
                            leftIcon={<i className="ri-time-line text-blue-500" aria-hidden />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.bookingDeadline && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" aria-hidden />
                                {errors.bookingDeadline.message as string}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                            {t('schedules:detail.prices')}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <label htmlFor="schedule-price-adult" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.price_adult')}
                        </label>
                        <Controller
                            name="priceAdult"
                            control={control}
                            render={({ field }) => (
                                <div className="relative group">
                                    <CurrencyInput
                                        id="schedule-price-adult"
                                        {...field}
                                        placeholder={t('schedules:fields.price_follows_tour')}
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all pl-4 pr-10 font-medium"
                                        invalid={!!errors.priceAdult}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-300 group-focus-within:text-[#14b8a6] transition-colors">₫</span>
                                </div>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="schedule-price-child" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.price_child')}
                        </label>
                        <Controller
                            name="priceChild"
                            control={control}
                            render={({ field }) => (
                                <div className="relative group">
                                    <CurrencyInput
                                        id="schedule-price-child"
                                        {...field}
                                        placeholder={t('schedules:fields.price_follows_tour')}
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all pl-4 pr-10 font-medium"
                                        invalid={!!errors.priceChild}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-300 group-focus-within:text-[#14b8a6] transition-colors">₫</span>
                                </div>
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="schedule-price-infant" className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.price_infant')}
                        </label>
                        <Controller
                            name="priceInfant"
                            control={control}
                            render={({ field }) => (
                                <div className="relative group">
                                    <CurrencyInput
                                        id="schedule-price-infant"
                                        {...field}
                                        placeholder={t('schedules:fields.price_follows_tour')}
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all pl-4 pr-10 font-medium"
                                        invalid={!!errors.priceInfant}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-300 group-focus-within:text-[#14b8a6] transition-colors">₫</span>
                                </div>
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
