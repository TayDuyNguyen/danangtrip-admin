import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { 
    Settings as SettingsIcon, 
    Info, 
    Award, 
    Share2, 
    CreditCard, 
    FileText, 
    Sparkles, 
    Loader2,
    AlertCircle,
    Bot,
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import { websiteSettingsSchema } from '@/validations/settings.schema';
import type { WebsiteSettingsInput } from '@/validations/settings.schema';
import { useSettings, useUpdateSettings } from '@/hooks/useSettingQueries';
import GeneralSettings from './components/GeneralSettings';
import BrandSettings from './components/BrandSettings';
import SocialSettings from './components/SocialSettings';
import PaymentSettings from './components/PaymentSettings';
import PolicySettings from './components/PolicySettings';
import SEOSettings from './components/SEOSettings';
import SaveBar from './components/SaveBar';

type TabKey = 'general' | 'brand' | 'social' | 'payment' | 'policy' | 'seo';

const Settings = () => {
    const { t } = useTranslation('settings');
    const [activeTab, setActiveTab] = useState<TabKey>('general');
    
    const { data: settingsData, isLoading, isError, refetch, isFetching } = useSettings();
    const updateSettingsMutation = useUpdateSettings();

    const methods = useForm<WebsiteSettingsInput>({
        resolver: yupResolver(websiteSettingsSchema(t)),
        mode: 'onChange',
    });

    const { 
        handleSubmit, 
        reset, 
        formState: { isDirty, errors } 
    } = methods;

    useEffect(() => {
        if (settingsData) {
            reset(settingsData);
        }
    }, [settingsData, reset]);

    const handleDiscard = () => {
        if (settingsData) {
            reset(settingsData);
        }
    };

    const onSubmit = async (data: WebsiteSettingsInput) => {
        try {
            await updateSettingsMutation.mutateAsync(data as unknown as import('@/types/settings.types').WebsiteSettings);
            reset(data);
        } catch {
            // Error managed by query mutation toast
        }
    };

    const hasTabError = (section: TabKey) => {
        return !!errors[section];
    };

    const tabsList: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
        { key: 'general', label: t('tabs.general'), icon: Info },
        { key: 'brand', label: t('tabs.brand'), icon: Award },
        { key: 'social', label: t('tabs.social'), icon: Share2 },
        { key: 'payment', label: t('tabs.payment'), icon: CreditCard },
        { key: 'policy', label: t('tabs.policy'), icon: FileText },
        { key: 'seo', label: t('tabs.seo'), icon: Sparkles },
    ];

    if (isLoading) {
        return (
            <div
                data-testid="settings-loading"
                className="min-h-screen bg-slate-50 flex flex-col items-center justify-center"
            >
                <Loader2 className="w-10 h-10 text-[#14b8a6] animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-500">
                    {t('actions.loading_config')}
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                data-testid="settings-load-error"
                className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center"
            >
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {t('actions.load_failed')}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mb-6">
                    {t('actions.load_failed_desc')}
                </p>
                <Button
                    type="button"
                    data-testid="settings-retry-button"
                    onClick={() => refetch()}
                    isLoading={isFetching}
                    className="rounded-xl bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold px-6 h-11"
                >
                    {t('actions.retry')}
                </Button>
            </div>
        );
    }

    return (
        <FormProvider {...methods}>
            <div className="min-h-screen bg-slate-50 pb-32">
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                    <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                        <div>
                            <div className="mb-1">
                                <Breadcrumbs
                                    icon={SettingsIcon}
                                    items={[
                                        { label: 'sidebar.settings', path: ROUTES.SETTINGS },
                                        { label: t('title'), isRaw: true }
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t('title')}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                    <div
                        className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-600 shadow-xs"
                        data-testid="settings-chatbot-hint"
                    >
                        <Bot className="w-4 h-4 text-[#14b8a6] shrink-0 mt-0.5" />
                        <p>
                            {t('hints.chatbot_managed_elsewhere')}{' '}
                            <Link
                                to={ROUTES.CHATBOT}
                                className="font-semibold text-[#0f766e] hover:underline"
                            >
                                AI Assistant
                            </Link>
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div
                            className="w-full lg:w-80 shrink-0 bg-white border border-slate-200/60 rounded-3xl p-4 shadow-xs space-y-1"
                            data-testid="settings-tab-list"
                        >
                            {tabsList.map((tab) => {
                                const TabIcon = tab.icon;
                                const isSelected = activeTab === tab.key;
                                const isErrored = hasTabError(tab.key);
                                
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        data-testid={`settings-tab-${tab.key}`}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'bg-[#14b8a6]/10 text-[#0f766e]' 
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <TabIcon className={`w-4 h-4 ${isSelected ? 'text-[#14b8a6]' : 'text-slate-400'}`} />
                                            <span>{tab.label}</span>
                                        </div>

                                        {isErrored && (
                                            <span
                                                data-testid={`settings-tab-error-${tab.key}`}
                                                className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-100 animate-pulse"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex-1 w-full">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className={activeTab === 'general' ? 'block' : 'hidden'}>
                                    <GeneralSettings />
                                </div>
                                <div className={activeTab === 'brand' ? 'block' : 'hidden'}>
                                    <BrandSettings />
                                </div>
                                <div className={activeTab === 'social' ? 'block' : 'hidden'}>
                                    <SocialSettings />
                                </div>
                                <div className={activeTab === 'payment' ? 'block' : 'hidden'}>
                                    <PaymentSettings />
                                </div>
                                <div className={activeTab === 'policy' ? 'block' : 'hidden'}>
                                    <PolicySettings />
                                </div>
                                <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
                                    <SEOSettings />
                                </div>

                                <SaveBar
                                    isVisible={isDirty}
                                    isSubmitting={updateSettingsMutation.isPending}
                                    onDiscard={handleDiscard}
                                    onSave={handleSubmit(onSubmit)}
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
};

export default Settings;
