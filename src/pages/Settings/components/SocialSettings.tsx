import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Share2, MessageCircle } from 'lucide-react';
import { 
    FaFacebook, 
    FaInstagram, 
    FaYoutube, 
    FaTiktok 
} from 'react-icons/fa';
import { TextInput } from '@/components/ui/TextInput';
import SectionHeader from '@/components/common/SectionHeader';
import type { WebsiteSettings } from '@/types/settings.types';

const SocialSettings = () => {
    const { t } = useTranslation('settings');
    const { register, formState: { errors } } = useFormContext<WebsiteSettings>();

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs transition-all hover:shadow-sm">
            <SectionHeader
                icon={Share2}
                title={t('sections.social.title')}
                subtitle={t('sections.social.subtitle')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Facebook Link */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FaFacebook className="w-3.5 h-3.5 text-[#1877F2]" /> {t('sections.social.facebook')}
                    </label>
                    <TextInput
                        placeholder="https://facebook.com/..."
                        leftIcon={<FaFacebook className="w-4 h-4 text-slate-400" />}
                        {...register('social.facebook')}
                        invalid={!!errors.social?.facebook}
                    />
                    {errors.social?.facebook?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.social.facebook.message)}
                        </p>
                    )}
                </div>

                {/* Instagram Link */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FaInstagram className="w-3.5 h-3.5 text-[#E1306C]" /> {t('sections.social.instagram')}
                    </label>
                    <TextInput
                        placeholder="https://instagram.com/..."
                        leftIcon={<FaInstagram className="w-4 h-4 text-slate-400" />}
                        {...register('social.instagram')}
                        invalid={!!errors.social?.instagram}
                    />
                    {errors.social?.instagram?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.social.instagram.message)}
                        </p>
                    )}
                </div>

                {/* YouTube Link */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FaYoutube className="w-3.5 h-3.5 text-[#FF0000]" /> {t('sections.social.youtube')}
                    </label>
                    <TextInput
                        placeholder="https://youtube.com/c/..."
                        leftIcon={<FaYoutube className="w-4 h-4 text-slate-400" />}
                        {...register('social.youtube')}
                        invalid={!!errors.social?.youtube}
                    />
                    {errors.social?.youtube?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.social.youtube.message)}
                        </p>
                    )}
                </div>

                {/* TikTok Link */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FaTiktok className="w-3.5 h-3.5 text-black" /> {t('sections.social.tiktok')}
                    </label>
                    <TextInput
                        placeholder="https://tiktok.com/@..."
                        leftIcon={<FaTiktok className="w-4 h-4 text-slate-400" />}
                        {...register('social.tiktok')}
                        invalid={!!errors.social?.tiktok}
                    />
                    {errors.social?.tiktok?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.social.tiktok.message)}
                        </p>
                    )}
                </div>

                {/* Zalo Link */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-[#0068FF]" /> {t('sections.social.zalo')}
                    </label>
                    <TextInput
                        placeholder="https://zalo.me/..."
                        leftIcon={<MessageCircle className="w-4 h-4 text-slate-400" />}
                        {...register('social.zalo')}
                        invalid={!!errors.social?.zalo}
                    />
                    {errors.social?.zalo?.message && (
                        <p className="text-xs text-red-500 font-semibold mt-1">
                            {t(errors.social.zalo.message)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialSettings;
