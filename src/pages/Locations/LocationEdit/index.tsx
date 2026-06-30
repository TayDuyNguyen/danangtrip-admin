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
import { useMainScrollCollapse } from '@/hooks/useMainScrollCollapse';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/Skeleton';

const LocationEdit = () => {
    const { t } = useTranslation(['location', 'common']);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isScrolled = useMainScrollCollapse();

    const isAdmin = user?.role === 'admin';

    const { data: rawLocation, isLoading, isError } = useLocationDetailRawQuery(id);
    const deleteMutation = useDeleteLocationMutation();

    const locationData = rawLocation ? mapLocationToFormInput(rawLocation) : null;

    const goToList = () => navigate(ROUTES.LOCATIONS_LIST);

    const handleDelete = () => {
        if (id) {
            deleteMutation.mutate(Number(id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    navigate(ROUTES.LOCATIONS_LIST);
                },
            });
        }
    };

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc]">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {t('location:detail.not_found')}
                    </h2>
                    <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">
                        {t('location:detail.not_found_desc')}
                    </p>
                    <Button
                        onClick={goToList}
                        className="w-full rounded-xl bg-[#14b8a6] hover:bg-[#0d9488]"
                    >
                        {t('location:detail.back_to_list')}
                    </Button>
                </div>
            </div>
        );
    }

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
                            onClick={goToList}
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
                                        { label: 'breadcrumb.edit' },
                                    ]}
                                />
                            </div>
                            <h1
                                className={cn(
                                    'font-bold text-slate-900 tracking-tight leading-tight flex flex-wrap items-center gap-x-2 gap-y-1 transition-all duration-300',
                                    isScrolled ? 'text-base' : 'text-xl'
                                )}
                            >
                                <span className="whitespace-nowrap">{t('location:edit_title')}</span>
                                {isScrolled && (
                                    <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 animate-in fade-in slide-in-from-left-2 duration-300">
                                        {t('common:breadcrumb.edit')}
                                    </span>
                                )}
                            </h1>
                            {isLoading ? (
                                <div
                                    className={cn(
                                        'transition-all duration-300',
                                        isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                    )}
                                >
                                    <Skeleton className="h-3 w-48 rounded-md" />
                                </div>
                            ) : (
                                locationData && (
                                    <p
                                        className={cn(
                                            'text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[400px] select-all transition-all duration-300',
                                            isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                        )}
                                    >
                                        {locationData.name}
                                    </p>
                                )
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex shrink-0 items-center gap-3">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-10 w-24 rounded-xl" />
                                <Skeleton className="h-10 w-28 rounded-xl" />
                            </>
                        ) : (
                            locationData && (
                                <>
                                    {isAdmin && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setIsDeleteDialogOpen(true)}
                                                className="rounded-xl text-red-500 hover:bg-red-50 font-semibold"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {t('location:actions.delete')}
                                            </Button>
                                            <div className="w-px h-6 bg-slate-200 mx-2" />
                                        </>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={goToList}
                                        className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold h-10"
                                    >
                                        {t('location:actions.cancel')}
                                    </Button>
                                    <Button
                                        form="location-form"
                                        type="submit"
                                        isLoading={isSubmitting}
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] text-white px-8 font-bold shadow-lg shadow-[#14b8a6]/20 transition-all hover:scale-[1.02] active:scale-95 h-10"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        {t('location:form.actions.update_location')}
                                    </Button>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full px-4 sm:px-6 lg:px-10 mt-8">
                {isLoading ? (
                    <LocationFormSkeleton />
                ) : (
                    locationData && (
                        <LocationForm
                            isEdit
                            initialData={locationData}
                            onSubmittingChange={setIsSubmitting}
                            onCancel={goToList}
                            onDelete={isAdmin ? () => setIsDeleteDialogOpen(true) : undefined}
                            onSuccess={() => {
                                navigate(ROUTES.LOCATIONS_DETAIL.replace(':id', id || ''));
                            }}
                        />
                    )
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
