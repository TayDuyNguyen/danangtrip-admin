import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/routes/routes';
import { useLocationDetailRawQuery, useDeleteLocationMutation } from '@/hooks/useLocationQueries';
import LocationForm from '../components/LocationForm';
import LocationFormSkeleton from '../components/LocationFormSkeleton';
import { mapLocationToFormInput } from '@/dataHelper/location.mapper';
import { useState } from 'react';
import DeleteLocationModal from '../components/DeleteLocationModal';
import { useAuth } from '@/store/useUserStore';
import Breadcrumbs from '@/components/common/Breadcrumbs';

const LocationEdit = () => {
    const { t } = useTranslation(['location', 'common']);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAdmin = user?.role === 'admin';

    const { data: rawLocation, isLoading, isError } = useLocationDetailRawQuery(id);
    const deleteMutation = useDeleteLocationMutation();

    const locationData = rawLocation ? mapLocationToFormInput(rawLocation) : null;

    const handleDelete = () => {
        if (id) {
            deleteMutation.mutate(Number(id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    navigate(ROUTES.LOCATIONS_LIST);
                }
            });
        }
    };

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Location Not Found</h2>
                    <p className="text-slate-500 mb-8">
                        The location you are looking for might have been deleted or the ID is incorrect.
                    </p>
                    <Button 
                        onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                        className="w-full rounded-xl bg-[#14b8a6] hover:bg-[#0d9488]"
                    >
                        Return to List
                    </Button>
                </div>
            </div>
        );
    }

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
                                        { label: 'breadcrumb.edit' }
                                    ]}
                                />
                            </div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                {t('edit_title', { defaultValue: 'Chỉnh sửa Địa điểm' })}
                            </h1>
                            {locationData && (
                                <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[400px] mt-1 select-all">
                                    {locationData.name}
                                </p>
                            )}
                        </div>
                    </div>

                    {!isLoading && locationData && (
                        <div className="hidden md:flex items-center gap-3">
                            {isAdmin && (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        className="rounded-xl text-red-500 hover:bg-red-50 font-semibold"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {t('actions.delete')}
                                    </Button>
                                    <div className="w-px h-6 bg-slate-200 mx-2" />
                                </>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold h-10"
                            >
                                {t('actions.cancel')}
                            </Button>
                            <Button
                                form="location-form"
                                type="submit"
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                                className="rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white px-8 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.02] active:scale-95 h-10"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('form.actions.update_location')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-8">
                {isLoading ? (
                    <LocationFormSkeleton />
                ) : (
                    <>

                        {locationData && (
                            <LocationForm 
                                isEdit 
                                initialData={locationData}
                                onSubmittingChange={setIsSubmitting}
                                onSuccess={() => {
                                    navigate(ROUTES.LOCATIONS_DETAIL.replace(':id', id || ''));
                                }}
                            />
                        )}
                    </>
                )}
            </div>

            <DeleteLocationModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                locationName={locationData?.name || ''}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
};

export default LocationEdit;
