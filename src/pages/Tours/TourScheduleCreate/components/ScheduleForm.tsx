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
            {/* Section: Date & Slot */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dff7f4] text-[#14b8a6]">
                        <i className="ri-calendar-event-line text-lg" />
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-[16px] font-bold text-slate-800">
                            {t('schedules:title')}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.start_date')} <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            type="date"
                            {...register('startDate')}
                            invalid={!!errors.startDate}
                            leftIcon={<i className="ri-calendar-line text-[#14b8a6]" />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.startDate && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" />
                                {errors.startDate.message as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.end_date')} <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            type="date"
                            {...register('endDate')}
                            invalid={!!errors.endDate}
                            leftIcon={<i className="ri-calendar-check-line text-[#14b8a6]" />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.endDate && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" />
                                {errors.endDate.message as string}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.max_people')} <span className="text-red-500">*</span>
                        </label>
                        <TextInput
                            type="number"
                            placeholder="20"
                            {...register('totalSlots')}
                            invalid={!!errors.totalSlots}
                            leftIcon={<i className="ri-group-line text-[#14b8a6]" />}
                            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all"
                        />
                        {errors.totalSlots && (
                            <p className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                                <i className="ri-error-warning-line" />
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
                                    leftIcon={<i className="ri-checkbox-circle-line text-[#14b8a6]" />}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Section: Price Customization */}
            <div className="space-y-6">
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-300">
                            {t('schedules:fields.price_follows_tour')} (Tùy chọn)
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.price_adult')}
                        </label>
                        <Controller
                            name="priceAdult"
                            control={control}
                            render={({ field }) => (
                                <div className="relative group">
                                    <CurrencyInput
                                        {...field}
                                        placeholder={t('schedules:fields.price_follows_tour')}
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all pl-4 pr-10 font-medium"
                                        invalid={!!errors.priceAdult}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-300 group-focus-within:text-[#14b8a6] transition-colors">₫</span>
                                </div>
                            )}
                        />
                        {errors.priceAdult && (
                            <p className="text-[11px] font-medium text-red-500">{errors.priceAdult.message as string}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.price_child')}
                        </label>
                        <Controller
                            name="priceChild"
                            control={control}
                            render={({ field }) => (
                                <div className="relative group">
                                    <CurrencyInput
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
                        <label className="text-[13px] font-bold text-slate-700">
                            {t('schedules:fields.price_infant')}
                        </label>
                        <Controller
                            name="priceInfant"
                            control={control}
                            render={({ field }) => (
                                <div className="relative group">
                                    <CurrencyInput
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
