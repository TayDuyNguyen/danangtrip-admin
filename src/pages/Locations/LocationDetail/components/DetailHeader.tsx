import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/routes/routes';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useState } from 'react';
import DeleteLocationModal from '@/pages/Locations/components/DeleteLocationModal';
import { useDeleteLocationMutation } from '@/hooks/useLocationQueries';
import { useAuth } from '@/store';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { MapPin } from 'lucide-react';

interface DetailHeaderProps {
    name: string;
    id: number;
}

const DetailHeader = ({ name, id }: DetailHeaderProps) => {
    const { t } = useTranslation(['location', 'common']);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { mutate: deleteLocation, isPending: isDeleting } = useDeleteLocationMutation();

    const handleDelete = () => {
        deleteLocation(id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                navigate(ROUTES.LOCATIONS_LIST);
            }
        });
    };

    return (
        <div className="flex flex-col gap-3 mb-[24px]">
            {/* Breadcrumb */}
            <Breadcrumbs
                icon={MapPin}
                items={[
                    { label: 'sidebar.locations', path: ROUTES.LOCATIONS_LIST },
                    { label: 'sidebar.location_list', path: ROUTES.LOCATIONS_LIST },
                    { label: 'breadcrumb.view' }
                ]}
            />

            {/* Title row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 lg:-ml-12"
                        title={t('detail.back_to_list')}
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {name}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {user?.role === 'admin' && (
                        <>
                            <Button
                                variant="primary"
                                className="rounded-xl gap-2 h-10 px-4"
                                onClick={() => navigate(ROUTES.LOCATIONS_EDIT.replace(':id', id.toString()))}
                            >
                                <FiEdit2 size={16} />
                                <span className="hidden sm:inline">{t('detail.edit')}</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-2 h-10 px-4"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <FiTrash2 size={16} />
                                <span className="hidden sm:inline">{t('detail.delete')}</span>
                            </Button>
                        </>
                    )}

                    <DeleteLocationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={handleDelete}
                        locationName={name}
                        isDeleting={isDeleting}
                    />
                </div>
            </div>
        </div>
    );
};

export default DetailHeader;
