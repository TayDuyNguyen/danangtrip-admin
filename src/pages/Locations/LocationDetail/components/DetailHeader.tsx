import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/routes/routes';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { useState } from 'react';
import DeleteLocationModal from '@/pages/Locations/components/DeleteLocationModal';
import { useDeleteLocationMutation } from '@/hooks/useLocationQueries';
import { useAuth } from '@/store';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400 mb-1">
                    <button 
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                        className="hover:text-primary transition-colors"
                    >
                        {t('common:sidebar.dashboard')}
                    </button>
                    <span>/</span>
                    <button 
                        onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                        className="hover:text-primary transition-colors"
                    >
                        {t('title')}
                    </button>
                    <span>/</span>
                    <span className="text-slate-600 truncate max-w-[200px]">{name}</span>
                </nav>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(ROUTES.LOCATIONS_LIST)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                        title={t('detail.back_to_list')}
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {name}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {user?.role === 'admin' && (
                    <>
                        <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2 h-10 px-4"
                            onClick={() => navigate(ROUTES.LOCATIONS_EDIT.replace(':id', id.toString()))}
                        >
                            <FiEdit3 size={16} />
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
    );
};

export default DetailHeader;
