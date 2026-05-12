import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocationDetailQuery } from '@/hooks/useLocationQueries';
import { ROUTES } from '@/routes/routes';

// Components
import DetailHeader from './components/DetailHeader';
import DetailHero from './components/DetailHero';
import DetailSidebar from './components/DetailSidebar';
import DetailTabs from './components/DetailTabs';
import LocationDetailSkeleton from '@/components/loading/LocationDetailSkeleton';
import ErrorWidget from '@/components/common/ErrorWidget';

const LocationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation('location');
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'map'>('info');

    const { data: location, isLoading, isError, refetch } = useLocationDetailQuery(id);

    if (isLoading) {
        return <LocationDetailSkeleton />;
    }

    if (isError || !location) {
        return (
            <div className="py-20">
                <ErrorWidget 
                    message={t('messages.load_error')} 
                    onRetry={refetch} 
                    onBack={() => navigate(ROUTES.LOCATIONS_LIST)}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Page Header with Breadcrumbs & Actions */}
            <DetailHeader 
                name={location.name} 
                id={location.id} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content Area (Left) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Visual Impact: Hero Media */}
                    <DetailHero location={location} />

                    {/* Tabbed Content: Details, Reviews, Map */}
                    <DetailTabs 
                        location={location} 
                        activeTab={activeTab} 
                        setActiveTab={setActiveTab} 
                    />
                </div>

                {/* Management Sidebar (Right) */}
                <div className="lg:col-span-4">
                    <DetailSidebar location={location} />
                </div>
            </div>
        </div>
    );
};

export default LocationDetail;
