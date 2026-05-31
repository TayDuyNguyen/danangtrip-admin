import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Phone, Mail, MapPin, Clock, Info } from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import SectionHeader from '@/components/common/SectionHeader';
import type { WebsiteSettings } from '@/types/settings.types';

const GeneralSettings = () => {
    const { t } = useTranslation('settings');
    const { register, formState: { errors } } = useFormContext<WebsiteSettings>();

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all hover:shadow-sm">
            <SectionHeader
                icon={Info}
                title={t('sections.general.title')}
                subtitle={t('sections.general.subtitle')}
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Hotline */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        {t('sections.general.hotline')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        placeholder={t('sections.general.hotline_help')}
                        leftIcon={<Phone className="w-4 h-4" />}
                        {...register('general.hotline')}
                        invalid={!!errors.general?.hotline}
                    />
                    {errors.general?.hotline?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.general.hotline.message)}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        {t('sections.general.email')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        placeholder={t('sections.general.email_help')}
                        leftIcon={<Mail className="w-4 h-4" />}
                        {...register('general.email')}
                        invalid={!!errors.general?.email}
                    />
                    {errors.general?.email?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.general.email.message)}
                        </p>
                    )}
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        {t('sections.general.address')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        placeholder={t('sections.general.address_help')}
                        leftIcon={<MapPin className="w-4 h-4" />}
                        {...register('general.address')}
                        invalid={!!errors.general?.address}
                    />
                    {errors.general?.address?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.general.address.message)}
                        </p>
                    )}
                </div>

                {/* Support Hours */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        {t('sections.general.support_hours')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        placeholder={t('sections.general.support_hours_help')}
                        leftIcon={<Clock className="w-4 h-4" />}
                        {...register('general.support_hours')}
                        invalid={!!errors.general?.support_hours}
                    />
                    {errors.general?.support_hours?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.general.support_hours.message)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
