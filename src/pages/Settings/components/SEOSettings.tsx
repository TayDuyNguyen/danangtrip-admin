import { useTranslation } from 'react-i18next';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Sparkles, Megaphone } from 'lucide-react';
import { TextInput } from '@/components/ui/TextInput';
import { TextareaField } from '@/components/ui/TextareaField';
import SectionHeader from '@/components/common/SectionHeader';
import SettingImageUploader from './SettingImageUploader';
import type { WebsiteSettings } from '@/types/settings.types';

const SEOSettings = () => {
    const { t } = useTranslation('settings');
    const { register, control, formState: { errors } } = useFormContext<WebsiteSettings>();

    const watchTitle = useWatch({ control, name: 'seo.meta_title' }) || '';
    const watchDesc = useWatch({ control, name: 'seo.meta_description' }) || '';

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all hover:shadow-sm">
            <SectionHeader
                icon={Sparkles}
                title={t('sections.seo.title')}
                subtitle={t('sections.seo.subtitle')}
                required
            />

            <div className="space-y-6 mt-6">
                {/* Meta Title */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            {t('sections.seo.meta_title')} <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-slate-400">
                            {watchTitle.length}/100
                        </span>
                    </div>
                    <TextInput
                        placeholder={t('sections.seo.meta_title_help')}
                        leftIcon={<Megaphone className="w-4 h-4 text-slate-400" />}
                        {...register('seo.meta_title')}
                        invalid={!!errors.seo?.meta_title}
                    />
                    {errors.seo?.meta_title?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.seo.meta_title.message)}
                        </p>
                    )}
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            {t('sections.seo.meta_description')} <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-slate-400">
                            {watchDesc.length}/200
                        </span>
                    </div>
                    <TextareaField
                        placeholder={t('sections.seo.meta_description_help')}
                        {...register('seo.meta_description')}
                        invalid={!!errors.seo?.meta_description}
                        rows={4}
                        className="rounded-2xl border-slate-200 text-sm leading-relaxed"
                    />
                    {errors.seo?.meta_description?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.seo.meta_description.message)}
                        </p>
                    )}
                </div>

                {/* OpenGraph Image */}
                <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        {t('sections.seo.og_image')}
                    </label>
                    <Controller
                        name="seo.og_image"
                        control={control}
                        render={({ field }) => (
                            <SettingImageUploader
                                value={field.value}
                                onChange={field.onChange}
                                helperText={t('sections.seo.og_image_help')}
                                aspectRatioClass="h-48"
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default SEOSettings;
