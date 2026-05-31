import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { FileText, Link, ShieldCheck, Scale, FileSignature } from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import SectionHeader from '@/components/common/SectionHeader';
import type { WebsiteSettings } from '@/types/settings.types';

const PolicySettings = () => {
    const { t } = useTranslation('settings');
    const { register, formState: { errors } } = useFormContext<WebsiteSettings>();

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all hover:shadow-sm">
            <SectionHeader
                icon={FileText}
                title={t('sections.policy.title')}
                subtitle={t('sections.policy.subtitle')}
            />

            <div className="space-y-6 mt-6">
                {/* Terms of Service Link */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-[#14b8a6]" /> {t('sections.policy.terms')}
                    </label>
                    <TextInput
                        placeholder="https://danangtrip.vn/policies/terms"
                        leftIcon={<Link className="w-4 h-4 text-slate-400" />}
                        {...register('policy.terms')}
                        invalid={!!errors.policy?.terms}
                    />
                    {errors.policy?.terms?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.policy.terms.message)}
                        </p>
                    )}
                </div>

                {/* Privacy Policy Link */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#14b8a6]" /> {t('sections.policy.privacy')}
                    </label>
                    <TextInput
                        placeholder="https://danangtrip.vn/policies/privacy"
                        leftIcon={<Link className="w-4 h-4 text-slate-400" />}
                        {...register('policy.privacy')}
                        invalid={!!errors.policy?.privacy}
                    />
                    {errors.policy?.privacy?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.policy.privacy.message)}
                        </p>
                    )}
                </div>

                {/* Data Protection Regulations Link */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FileSignature className="w-3.5 h-3.5 text-[#14b8a6]" /> {t('sections.policy.data_protection')}
                    </label>
                    <TextInput
                        placeholder="https://danangtrip.vn/policies/data-protection"
                        leftIcon={<Link className="w-4 h-4 text-slate-400" />}
                        {...register('policy.data_protection')}
                        invalid={!!errors.policy?.data_protection}
                    />
                    {errors.policy?.data_protection?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.policy.data_protection.message)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PolicySettings;
