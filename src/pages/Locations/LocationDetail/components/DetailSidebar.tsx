import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Eye,
    Heart,
    Info,
    Settings,
    ToggleRight,
    Trash2,
} from 'lucide-react';

import StatCard from '@/components/common/StatCard';
import CustomSelect, { type Option } from '@/components/ui/CustomSelect';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import type { LocationViewModel } from '@/dataHelper/location.dataHelper';
import {
    useBulkLocationActionsMutation,
    useDeleteLocationMutation,
    useUpdateLocationFeaturedMutation,
} from '@/hooks/useLocationQueries';
import DeleteLocationModal from '@/pages/Locations/components/DeleteLocationModal';
import { ROUTES } from '@/routes/routes';
import { useAuth } from '@/store';

interface DetailSidebarProps {
    location: LocationViewModel;
}

const DetailSidebar = ({ location }: DetailSidebarProps) => {
    const { t } = useTranslation('location');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { mutate: toggleFeatured } = useUpdateLocationFeaturedMutation();
    const { mutate: bulkAction } = useBulkLocationActionsMutation();
    const { mutate: deleteLocation, isPending: isDeleting } = useDeleteLocationMutation();

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleStatusChange = (option: Option | null) => {
        const nextStatus = option?.value;
        if (nextStatus !== 'active' && nextStatus !== 'inactive') {
            return;
        }
        setIsUpdatingStatus(true);
        bulkAction(
            { ids: [location.id], action: nextStatus },
            { onSettled: () => setIsUpdatingStatus(false) }
        );
    };

    const handleDelete = () => {
        deleteLocation(location.id, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                navigate(ROUTES.LOCATIONS_LIST);
            },
        });
    };

    return (
        <div className="space-y-6 lg:sticky lg:top-6">
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    title={t('detail.stats.views')}
                    value={location.viewCountStr}
                    icon={Eye}
                    accent="secondary"
                />
                <StatCard
                    title={t('detail.stats.favorites')}
                    value={location.favoriteCountStr}
                    icon={Heart}
                    accent="rose"
                />
            </div>

            {user?.role === 'admin' && (
                <>
                    {/* Management Card */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                            <div className="p-2.5 rounded-xl bg-slate-50 text-slate-500">
                                <Settings size={18} />
                            </div>
                            <h3 className="font-bold text-slate-900 tracking-tight">
                                {t('detail.management.title')}
                            </h3>
                        </div>

                        {/* Status Control */}
                        <div className="space-y-2">
                            <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider px-1">
                                {t('detail.management.status')}
                            </label>
                            <div className={isUpdatingStatus ? 'opacity-50 pointer-events-none transition-opacity' : ''}>
                                <CustomSelect
                                    value={{
                                        value: location.status,
                                        label: t(`status.${location.status}`),
                                    }}
                                    onChange={handleStatusChange}
                                    options={[
                                        { value: 'active', label: t('status.active') },
                                        { value: 'inactive', label: t('status.inactive') },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Featured Toggle */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <ToggleRight size={16} className={location.isFeatured ? 'text-amber-500' : 'text-slate-400'} />
                                    <span className="text-[14px] font-bold text-slate-800">
                                        {t('detail.management.featured')}
                                    </span>
                                </div>
                                <p className="text-[12px] text-slate-400 leading-tight">
                                    {t('detail.management.featured_desc')}
                                </p>
                            </div>
                            <ToggleSwitch
                                enabled={location.isFeatured}
                                onChange={(enabled: boolean) => toggleFeatured({ id: location.id, isFeatured: enabled })}
                            />
                        </div>

                        {/* Info Tip */}
                        <div className="flex gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50 text-indigo-700">
                            <Info size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="text-[13px] font-medium leading-relaxed">
                                {t('detail.management.status_tip')}
                            </p>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/30 rounded-[32px] p-6 border border-red-100 shadow-sm border-dashed">
                        <h3 className="text-[13px] font-bold text-red-600 uppercase tracking-wider mb-4 px-1">
                            {t('detail.management.danger_zone')}
                        </h3>
                        <p className="text-[12px] text-red-500/70 mb-4 px-1 leading-relaxed">
                            {t('detail.management.delete_desc')}
                        </p>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-full py-3.5 px-4 rounded-2xl bg-white border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-red-100/50"
                        >
                            <Trash2 size={16} />
                            {t('detail.delete')}
                        </button>
                    </div>
                </>
            )}

            <DeleteLocationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                locationName={location.name}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default DetailSidebar;
