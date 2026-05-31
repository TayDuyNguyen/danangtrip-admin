import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { Globe, Award } from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import SectionHeader from '@/components/common/SectionHeader';
import SettingImageUploader from './SettingImageUploader';
import type { WebsiteSettings } from '@/types/settings.types';

const BrandSettings = () => {
    const { t } = useTranslation('settings');
    const { register, control, formState: { errors } } = useFormContext<WebsiteSettings>();

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all hover:shadow-sm">
            <SectionHeader
                icon={Award}
                title={t('sections.brand.title')}
                subtitle={t('sections.brand.subtitle')}
                required
            />

            <div className="space-y-6 mt-6">
                {/* Website Name */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        {t('sections.brand.website_name')} <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                        placeholder={t('sections.brand.website_name_help')}
                        leftIcon={<Globe className="w-4 h-4" />}
                        {...register('brand.website_name')}
                        invalid={!!errors.brand?.website_name}
                    />
                    {errors.brand?.website_name?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.brand.website_name.message)}
                        </p>
                    )}
                </div>

                {/* Logo and Favicon uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Brand Logo */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            {t('sections.brand.logo')} <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="brand.logo"
                            control={control}
                            render={({ field }) => (
                                <SettingImageUploader
                                    value={field.value}
                                    onChange={field.onChange}
                                    helperText={t('sections.brand.logo_help')}
                                    aspectRatioClass="h-44"
                                />
                            )}
                        />
                        {errors.brand?.logo?.message && (
                            <p className="text-xs text-red-500 font-semibold mt-1">
                                {t(errors.brand.logo.message)}
                            </p>
                        )}
                    </div>

                    {/* Browser Favicon */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            {t('sections.brand.favicon')} <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="brand.favicon"
                            control={control}
                            render={({ field }) => (
                                <SettingImageUploader
                                    value={field.value}
                                    onChange={field.onChange}
                                    helperText={t('sections.brand.favicon_help')}
                                    aspectRatioClass="h-44"
                                />
                            )}
                        />
                        {errors.brand?.favicon?.message && (
                            <p className="text-xs text-red-500 font-semibold mt-1">
                                {t(errors.brand.favicon.message)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandSettings;
