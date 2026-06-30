import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { Save, AlertCircle, Tag, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import { promotionSchema } from '@/validations/promotion.schema';
import type { Promotion, PromotionFormInput } from '@/types/promotion.types';

interface PromotionFormValues {
    code: string;
    name: string;
    description?: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    max_discount_amount?: number | null;
    min_order_amount?: number;
    usage_limit?: number | null;
    usage_per_user?: number;
    starts_at?: string | null;
    ends_at?: string | null;
    status?: 'active' | 'inactive' | 'expired';
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Promotion | null;
    onSubmit: (data: PromotionFormInput) => void;
    isSubmitting: boolean;
}

const formatForDateTimeLocal = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        // Avoid timezone offset shift
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
    } catch {
        return '';
    }
};

const PromotionFormDrawer = ({ isOpen, onClose, initialData, onSubmit, isSubmitting }: Props) => {
    const { t } = useTranslation('promotions');

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<PromotionFormValues>({
        resolver: yupResolver(promotionSchema(t)) as unknown as Resolver<PromotionFormValues>,
        defaultValues: {
            code: '',
            name: '',
            description: '',
            discount_type: 'percent',
            discount_value: 0,
            max_discount_amount: null,
            min_order_amount: 0,
            usage_limit: null,
            usage_per_user: 1,
            starts_at: null,
            ends_at: null,
            status: 'active',
        }
    });

    const discountType = useWatch({ control, name: 'discount_type' });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    code: initialData.code,
                    name: initialData.name,
                    description: initialData.description || '',
                    discount_type: initialData.discount_type,
                    discount_value: Number(initialData.discount_value),
                    max_discount_amount: initialData.max_discount_amount ? Number(initialData.max_discount_amount) : null,
                    min_order_amount: initialData.min_order_amount ? Number(initialData.min_order_amount) : 0,
                    usage_limit: initialData.usage_limit,
                    usage_per_user: initialData.usage_per_user,
                    starts_at: formatForDateTimeLocal(initialData.starts_at),
                    ends_at: formatForDateTimeLocal(initialData.ends_at),
                    status: initialData.status,
                });
            } else {
                reset({
                    code: '',
                    name: '',
                    description: '',
                    discount_type: 'percent',
                    discount_value: 0,
                    max_discount_amount: null,
                    min_order_amount: 0,
                    usage_limit: null,
                    usage_per_user: 1,
                    starts_at: '',
                    ends_at: '',
                    status: 'active',
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const handleClose = () => {
        onClose();
    };

    const handleFormSubmit = (values: PromotionFormValues) => {
        // Map any nulls/empty strings appropriately before submitting
        const data: PromotionFormInput = {
            code: values.code,
            name: values.name,
            description: values.description || undefined,
            discount_type: values.discount_type,
            discount_value: Number(values.discount_value),
            max_discount_amount: values.discount_type === 'fixed' ? null : (values.max_discount_amount ? Number(values.max_discount_amount) : null),
            min_order_amount: values.min_order_amount ? Number(values.min_order_amount) : 0,
            usage_limit: values.usage_limit ? Number(values.usage_limit) : null,
            usage_per_user: values.usage_per_user ? Number(values.usage_per_user) : 1,
            starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
            ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
            status: values.status,
        };
        onSubmit(data);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={handleClose}
            title={initialData ? t('actions.edit') : t('actions.add_new')}
            subtitle={t('subtitle')}
            badge={!initialData ? t('labels.new_badge') : undefined}
            width="max-w-xl"
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pb-24 font-sans text-slate-800">
                {/* 1. Core Info */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-[#14b8a6]">
                        <Tag size={14} />
                        {t('form.section_basic')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.code')} *
                            </label>
                            <input
                                {...register('code')}
                                type="text"
                                placeholder={t('fields.code_placeholder')}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 uppercase placeholder:text-slate-400 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic">{t('fields.code_help')}</p>
                            {errors.code && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.code?.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.name')} *
                            </label>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder={t('fields.name_placeholder')}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic">{t('fields.name_help')}</p>
                            {errors.name && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.name?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                            {t('fields.description')}
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            placeholder={t('fields.description_placeholder')}
                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                        />
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-slate-100" />

                {/* 2. Discount settings */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-[#14b8a6]">
                        <Save size={14} />
                        {t('form.section_discount')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.discount_type')} *
                            </label>
                            <Controller
                                name="discount_type"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        options={[
                                            { value: 'percent', label: t('types.percent') },
                                            { value: 'fixed', label: t('types.fixed') },
                                        ]}
                                        value={[
                                            { value: 'percent', label: t('types.percent') },
                                            { value: 'fixed', label: t('types.fixed') },
                                        ].find(opt => opt.value === field.value)}
                                        onChange={(opt) => field.onChange((opt as Option)?.value)}
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.discount_value')} *
                            </label>
                            <div className="relative">
                                <input
                                    {...register('discount_value')}
                                    type="number"
                                    step="any"
                                    placeholder={discountType === 'percent' ? '10' : '100000'}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">
                                    {discountType === 'percent' ? '%' : 'đ'}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">
                                {discountType === 'percent' ? t('fields.discount_value_percent_help') : t('fields.discount_value_fixed_help')}
                            </p>
                            {errors.discount_value && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.discount_value?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {discountType === 'percent' && (
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.max_discount_amount')}
                            </label>
                            <div className="relative">
                                <input
                                    {...register('max_discount_amount')}
                                    type="number"
                                    placeholder="500000"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">đ</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">{t('fields.max_discount_amount_help')}</p>
                            {errors.max_discount_amount && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.max_discount_amount?.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <hr className="border-slate-100" />

                {/* 3. Conditions */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-[#14b8a6]">
                        <HelpCircle size={14} />
                        {t('form.section_conditions')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.min_order_amount')}
                            </label>
                            <div className="relative">
                                <input
                                    {...register('min_order_amount')}
                                    type="number"
                                    placeholder="500000"
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">đ</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium italic">{t('fields.min_order_amount_help')}</p>
                            {errors.min_order_amount && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.min_order_amount?.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.usage_limit')}
                            </label>
                            <input
                                {...register('usage_limit')}
                                type="number"
                                placeholder="100"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic">{t('fields.usage_limit_help')}</p>
                            {errors.usage_limit && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.usage_limit?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.usage_per_user')}
                            </label>
                            <input
                                {...register('usage_per_user')}
                                type="number"
                                placeholder="1"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic">{t('fields.usage_per_user_help')}</p>
                            {errors.usage_per_user && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.usage_per_user?.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.status')}
                            </label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <CustomSelect
                                        options={[
                                            { value: 'active', label: t('status.active') },
                                            { value: 'inactive', label: t('status.inactive') },
                                        ]}
                                        value={[
                                            { value: 'active', label: t('status.active') },
                                            { value: 'inactive', label: t('status.inactive') },
                                        ].find(opt => opt.value === field.value)}
                                        onChange={(opt) => field.onChange((opt as Option)?.value)}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="border-slate-100" />

                {/* 4. Validity */}
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-[#14b8a6]">
                        <Calendar size={14} />
                        {t('form.section_validity')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.starts_at')}
                            </label>
                            <input
                                {...register('starts_at')}
                                type="datetime-local"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                            />
                            {errors.starts_at && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.starts_at?.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                                {t('fields.ends_at')}
                            </label>
                            <input
                                {...register('ends_at')}
                                type="datetime-local"
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:border-[#14b8a6] focus:bg-white focus:outline-hidden"
                            />
                            {errors.ends_at && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-500">
                                    <AlertCircle size={12} />
                                    {errors.ends_at?.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom fixed bar */}
                <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl px-8 py-3.5 font-black text-slate-500 transition-all hover:bg-slate-100"
                    >
                        {t('actions.cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 rounded-2xl bg-[#14b8a6] px-10 py-3.5 font-black text-white shadow-xl shadow-[#14b8a6]/20 transition-all hover:scale-105 hover:bg-[#0f766e] active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                            <ShieldCheck size={18} />
                        )}
                        <span>{t('actions.save')}</span>
                    </button>
                </div>
            </form>
        </Drawer>
    );
};

export default PromotionFormDrawer;
