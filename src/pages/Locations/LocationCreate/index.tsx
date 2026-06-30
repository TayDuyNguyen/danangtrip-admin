import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import LocationForm from '../components/LocationForm';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { useMainScrollCollapse } from '@/hooks/useMainScrollCollapse';
import { cn } from '@/utils';

const LocationCreate = () => {
    const { t } = useTranslation(['location', 'common']);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isScrolled = useMainScrollCollapse();

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
                <div
                    className={cn(
                        'w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 transition-all duration-300',
                        isScrolled ? 'py-2' : 'min-h-20 py-3'
                    )}
                >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                        <Button
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 shrink-0"
                            aria-label={t('location:detail.back_to_list')}
                            onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div className="min-w-0 flex-1">
                            <div
                                className={cn(
                                    'transition-all duration-300',
                                    isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-1'
                                )}
                            >
                                <Breadcrumbs
                                    icon={MapPin}
                                    items={[
                                        { label: 'sidebar.locations', path: ROUTES.LOCATIONS_LIST },
                                        { label: 'sidebar.location_list', path: ROUTES.LOCATIONS_LIST },
                                        { label: 'breadcrumb.add' },
                                    ]}
                                />
                            </div>
                            <h1
                                className={cn(
                                    'font-bold text-slate-900 tracking-tight leading-tight flex flex-wrap items-center gap-x-2 gap-y-1 transition-all duration-300',
                                    isScrolled ? 'text-base' : 'text-xl'
                                )}
                            >
                                <span className="whitespace-nowrap">{t('location:actions.add')}</span>
                                {isScrolled && (
                                    <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 animate-in fade-in slide-in-from-left-2 duration-300">
                                        {t('common:breadcrumb.add')}
                                    </span>
                                )}
                            </h1>
                            <p
                                className={cn(
                                    'text-xs text-slate-400 font-medium transition-all duration-300',
                                    isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                )}
                            >
                                {t('location:form.page_subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex shrink-0 items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                        >
                            {t('location:actions.cancel')}
                        </Button>
                        <Button
                            form="location-form"
                            type="submit"
                            isLoading={isSubmitting}
                            className="rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white px-8 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('location:form.actions.create_location')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-10 mt-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {t('location:form.sections.basic')}
                    </h2>
                    <p className="text-slate-500 max-w-2xl">
                        {t('location:form.page_subtitle')}
                    </p>
                </div>

                <LocationForm
                    onSubmittingChange={setIsSubmitting}
                    onCancel={() => navigate(ROUTES.LOCATIONS_LIST)}
                    onSuccess={(id) => {
                        if (id != null) {
                            navigate(ROUTES.LOCATIONS_EDIT.replace(':id', String(id)));
                        } else {
                            navigate(ROUTES.LOCATIONS_LIST);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default LocationCreate;
