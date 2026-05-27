import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import LocationForm from '../components/LocationForm';
import Breadcrumbs from '@/components/common/Breadcrumbs';

const LocationCreate = () => {
    const { t } = useTranslation('location');
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="rounded-full w-10 h-10 p-0 hover:bg-slate-100"
                            onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Button>
                        <div>
                            <div className="mb-1">
                                <Breadcrumbs
                                    icon={MapPin}
                                    items={[
                                        { label: 'sidebar.locations', path: ROUTES.LOCATIONS_LIST },
                                        { label: 'sidebar.location_list', path: ROUTES.LOCATIONS_LIST },
                                        { label: 'breadcrumb.add' }
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                {t('actions.add')}
                            </h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            form="location-form"
                            type="submit"
                            isLoading={isSubmitting}
                            className="rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white px-8 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('form.actions.create_location')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {t('form.sections.basic')}
                    </h2>
                    <p className="text-slate-500 max-w-2xl">
                        {t('form.page_subtitle')}
                    </p>
                </div>

                <LocationForm onSubmittingChange={setIsSubmitting} />
            </div>
        </div>
    );
};

export default LocationCreate;
