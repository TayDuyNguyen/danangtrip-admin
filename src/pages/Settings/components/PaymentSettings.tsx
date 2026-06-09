import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { CreditCard, CheckCircle2, ShieldAlert } from 'lucide-react';
import SectionHeader from '@/components/common/SectionHeader';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import Badge from '@/components/ui/Badge';

const PaymentSettings = () => {
    const { t } = useTranslation('settings');
    const { control, formState: { errors } } = useFormContext<import('@/types/settings.types').WebsiteSettings>();

    const gateways = [
        {
            key: 'payment.sepay',
            title: t('sections.payment.sepay'),
            description: t('sections.payment.sepay_help'),
            isRecommended: true,
            isReserved: false,
        },
        {
            key: 'payment.cod',
            title: t('sections.payment.cod'),
            description: t('sections.payment.cod_help'),
            isRecommended: false,
            isReserved: false,
        },
        {
            key: 'payment.vnpay',
            title: t('sections.payment.vnpay'),
            description: t('sections.payment.vnpay_help'),
            isRecommended: false,
            isReserved: true,
        },
        {
            key: 'payment.momo',
            title: t('sections.payment.momo'),
            description: t('sections.payment.momo_help'),
            isRecommended: false,
            isReserved: true,
        },
        {
            key: 'payment.zalopay',
            title: t('sections.payment.zalopay'),
            description: t('sections.payment.zalopay_help'),
            isRecommended: false,
            isReserved: true,
        },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all hover:shadow-sm">
            <SectionHeader
                icon={CreditCard}
                title={t('sections.payment.title')}
                subtitle={t('sections.payment.subtitle')}
                required
            />

            {/* Error Message for payment group validation */}
            {errors.payment && (
                <div className="mt-4 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs font-bold animate-in fade-in duration-200">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>
                        {t('validation.payment_required', { defaultValue: 'At least one payment gateway must be enabled.' })}
                    </span>
                </div>
            )}

            <div className="space-y-4 mt-6">
                {gateways.map((gateway) => (
                    <Controller
                        key={gateway.key}
                        name={gateway.key as "payment.sepay" | "payment.cod" | "payment.vnpay" | "payment.momo" | "payment.zalopay"}
                        control={control}
                        render={({ field }) => (
                            <div className={`p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                                field.value 
                                    ? 'border-emerald-200 bg-emerald-50/10' 
                                    : 'border-slate-100 bg-slate-50/30'
                            }`}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-bold text-slate-800">
                                            {gateway.title}
                                        </h4>
                                        {gateway.isRecommended && (
                                            <Badge className="bg-[#14b8a6]/10 text-[#0f766e] border-none font-bold text-[10px] uppercase tracking-wider py-0.5 px-2">
                                                {t('form.publish.recommended', { defaultValue: 'Khuyên dùng' })}
                                            </Badge>
                                        )}
                                        {gateway.isReserved && (
                                            <Badge className="bg-amber-50 text-amber-600 border border-amber-200 font-semibold text-[10px] py-0.5 px-2">
                                                {t('form.publish.reserved', { defaultValue: 'Dự phòng' })}
                                            </Badge>
                                        )}
                                        {field.value && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {gateway.description}
                                    </p>
                                </div>

                                <div className="shrink-0">
                                    <ToggleSwitch
                                        enabled={!!field.value}
                                        onChange={field.onChange}
                                    />
                                </div>
                            </div>
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default PaymentSettings;
