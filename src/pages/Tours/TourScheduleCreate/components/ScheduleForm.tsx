import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@/components/ui/TextInput';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import CustomSelect from '@/components/ui/CustomSelect';
import type { ScheduleFormValues } from '@/types/schedule';

export const ScheduleForm = () => {
    const { t } = useTranslation(['schedules', 'common']);
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ScheduleFormValues>();

    const statusOptions = [
        {
            value: 'AVAILABLE',
            label: (
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {t('schedules:status.available')}
                </div>
            ),
        },
        {
            value: 'FULL',
            label: (
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    {t('schedules:status.full')}
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
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <i className="ri-calendar-todo-line text-lg" />
                </div>
                <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-slate-800">
                        {t('schedules:fields.start_date')} & {t('schedules:fields.end_date')}
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase">
                        {t('common:new')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-600">
                        {t('schedules:fields.start_date')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        type="date"
                        {...register('startDate')}
                        invalid={!!errors.startDate}
                        leftIcon={<i className="ri-calendar-line" />}
                    />
                    {errors.startDate && (
                        <p className="text-[12px] text-red-500">{errors.startDate.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-600">
                        {t('schedules:fields.end_date')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        type="date"
                        {...register('endDate')}
                        invalid={!!errors.endDate}
                        leftIcon={<i className="ri-calendar-check-line" />}
                    />
                    {errors.endDate && (
                        <p className="text-[12px] text-red-500">{errors.endDate.message as string}</p>
                    )}
                    <p className="text-[11px] text-slate-400 italic">
                        {t('common:helpers.date_range_tip')}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-600">
                        {t('schedules:fields.max_people')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        type="number"
                        placeholder="20"
                        {...register('totalSlots')}
                        invalid={!!errors.totalSlots}
                        leftIcon={<i className="ri-group-line" />}
                    />
                    {errors.totalSlots && (
                        <p className="text-[12px] text-red-500">{errors.totalSlots.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-600">
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
                                containerClassName="h-[46px]"
                                leftIcon={<i className="ri-checkbox-circle-line" />}
                            />
                        )}
                    />
                </div>
            </div>

            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-[11px] font-bold uppercase tracking-widest text-slate-300">
                        {t('schedules:fields.price_follows_tour')} (Tuy chon)
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-600">
                        {t('schedules:fields.price_adult')}
                    </label>
                    <Controller
                        name="priceAdult"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <CurrencyInput
                                    {...field}
                                    placeholder={t('schedules:fields.price_follows_tour')}
                                    className="pl-4 pr-10 h-11"
                                    invalid={!!errors.priceAdult}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-300">d</span>
                            </div>
                        )}
                    />
                    {errors.priceAdult && (
                        <p className="text-[12px] text-red-500">{errors.priceAdult.message as string}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-600">
                        {t('schedules:fields.price_child')}
                    </label>
                    <Controller
                        name="priceChild"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <CurrencyInput
                                    {...field}
                                    placeholder={t('schedules:fields.price_follows_tour')}
                                    className="pl-4 pr-10 h-11"
                                    invalid={!!errors.priceChild}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-300">d</span>
                            </div>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-slate-600">
                        {t('schedules:fields.price_infant')}
                    </label>
                    <Controller
                        name="priceInfant"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <CurrencyInput
                                    {...field}
                                    placeholder={t('schedules:fields.price_follows_tour')}
                                    className="pl-4 pr-10 h-11"
                                    invalid={!!errors.priceInfant}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-300">d</span>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
