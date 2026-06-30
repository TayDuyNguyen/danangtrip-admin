import { useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { MapPin } from 'lucide-react';

import { useLocationDetailQuery, useDeleteLocationMutation } from '@/hooks/useLocationQueries';

import { useMainScrollCollapse } from '@/hooks/useMainScrollCollapse';

import { ROUTES } from '@/routes/routes';

import { Button } from '@/components/ui/Button';

import { isLocationDetailNotFoundError } from '@/utils/locationDetailError';



import DetailHeader from './components/DetailHeader';

import DetailHero from './components/DetailHero';

import DetailSidebar from './components/DetailSidebar';

import DetailTabs from './components/DetailTabs';

import LocationDetailSkeleton from '@/components/loading/LocationDetailSkeleton';

import ErrorWidget from '@/components/common/ErrorWidget';

import DeleteLocationModal from '@/pages/Locations/components/DeleteLocationModal';



const LocationDetail = () => {

    const { id } = useParams<{ id: string }>();

    const { t } = useTranslation('location');

    const navigate = useNavigate();

    const isScrolled = useMainScrollCollapse();

    const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'map'>('info');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);



    const { data: location, isLoading, isError, error, refetch } = useLocationDetailQuery(id);

    const { mutate: deleteLocation, isPending: isDeleting } = useDeleteLocationMutation();



    const goToList = () => navigate(ROUTES.LOCATIONS_LIST);



    const handleDelete = () => {

        if (!location) return;

        deleteLocation(location.id, {

            onSuccess: () => {

                setIsDeleteModalOpen(false);

                goToList();

            },

        });

    };



    const isNotFound = isError && isLocationDetailNotFoundError(error);

    const showStickyShell = !isNotFound;



    return (

        <div className="min-h-screen bg-[#F8FAFC] pb-10 font-sans">

            {showStickyShell && (

                <DetailHeader

                    isScrolled={isScrolled}

                    isLoading={isLoading}

                    name={location?.name}

                    district={location?.district}

                    id={location?.id}

                    onDeleteClick={() => setIsDeleteModalOpen(true)}

                />

            )}



            {isLoading ? (

                <LocationDetailSkeleton />

            ) : isNotFound ? (

                <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col items-center justify-center py-20">

                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center">

                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">

                            <MapPin className="w-8 h-8" />

                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 mb-2">

                            {t('detail.not_found')}

                        </h2>

                        <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">

                            {t('detail.not_found_desc')}

                        </p>

                        <Button onClick={goToList} className="w-full rounded-xl">

                            {t('detail.back_to_list')}

                        </Button>

                    </div>

                </div>

            ) : isError || !location ? (

                <div className="w-full px-4 sm:px-6 lg:px-10 py-20">

                    <ErrorWidget

                        message={t('messages.load_error')}

                        onRetry={refetch}

                        onBack={goToList}

                        backLabel={t('detail.back_to_list')}

                    />

                </div>

            ) : (

                <div className="w-full px-4 sm:px-6 lg:px-10 space-y-6">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        <div className="lg:col-span-8 space-y-6">

                            <DetailHero location={location} />

                            <DetailTabs

                                location={location}

                                activeTab={activeTab}

                                setActiveTab={setActiveTab}

                            />

                        </div>



                        <div className="lg:col-span-4">

                            <DetailSidebar

                                location={location}

                                onDeleteClick={() => setIsDeleteModalOpen(true)}

                            />

                        </div>

                    </div>



                    <DeleteLocationModal

                        isOpen={isDeleteModalOpen}

                        onClose={() => setIsDeleteModalOpen(false)}

                        onConfirm={handleDelete}

                        locationName={location.name}

                        isDeleting={isDeleting}

                    />

                </div>

            )}

        </div>

    );

};



export default LocationDetail;


