import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, MapPin, RefreshCw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';

import { ROUTES } from '@/routes/routes';
import type { LocationFilters } from '@/dataHelper/location.dataHelper';

import LocationStats from './components/LocationStats';
import LocationFilter from './components/LocationFilter';
import LocationTable from './components/LocationTable';
import DeleteLocationModal from '../components/DeleteLocationModal';

import {
    useLocationsQuery,
    useLocationStatsQuery,
    useDeleteLocationMutation,
    useUpdateLocationFeaturedMutation,
    useBulkLocationActionsMutation,
    useLocationExportMutation,
} from '@/hooks/useLocationQueries';

type DeleteModalState = {
    isOpen: boolean;
    mode: 'single' | 'bulk';
    id: number | null;
    name: string;
};

const LocationListPage = () => {
    const { t } = useTranslation(['location', 'common']);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState<LocationFilters>({
        q: '',
        category_id: 'all',
        district: 'all',
        price_level: 'all',
        status: 'all',
        page: 1,
        per_page: 10,
    });

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
        isOpen: false,
        mode: 'single',
        id: null,
        name: '',
    });

    const urlCategoryId = useMemo(() => {
        const categoryId = searchParams.get('category_id');
        if (!categoryId || categoryId === 'all') return null;
        const parsed = Number(categoryId);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }, [searchParams]);

    const queryFilters = useMemo((): LocationFilters => {
        if (urlCategoryId == null) return filters;
        return { ...filters, category_id: urlCategoryId };
    }, [filters, urlCategoryId]);

    const {
        data,
        isLoading,
        isFetching,
        isError: isListError,
        refetch,
    } = useLocationsQuery(queryFilters);
    const {
        data: statsData,
        isLoading: isStatsLoading,
        isError: isStatsError,
    } = useLocationStatsQuery();
    const deleteMutation = useDeleteLocationMutation();
    const updateFeaturedMutation = useUpdateLocationFeaturedMutation();
    const bulkMutation = useBulkLocationActionsMutation();
    const exportMutation = useLocationExportMutation();

    const closeDeleteModal = useCallback(() => {
        setDeleteModal({ isOpen: false, mode: 'single', id: null, name: '' });
    }, []);

    const handleFilterChange = useCallback((key: keyof LocationFilters, value: string | number | null | undefined) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? (value as number) : 1,
        }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({
            q: '',
            category_id: 'all',
            district: 'all',
            price_level: 'all',
            status: 'all',
            page: 1,
            per_page: 10,
        });
    }, []);

    const handleSelectRow = useCallback((id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!data) return;
        setSelectedIds((prev) => (prev.length === data.items.length ? [] : data.items.map((i) => i.id)));
    }, [data]);

    const handleToggleFeatured = useCallback(
        (id: number, enabled: boolean) => {
            updateFeaturedMutation.mutate({ id, isFeatured: enabled });
        },
        [updateFeaturedMutation]
    );

    const handleDeleteClick = useCallback(
        (id: number) => {
            const item = data?.items.find((i) => i.id === id);
            if (item) {
                setDeleteModal({ isOpen: true, mode: 'single', id, name: item.name });
            }
        },
        [data]
    );

    const handleConfirmDelete = useCallback(() => {
        if (deleteModal.mode === 'bulk') {
            if (selectedIds.length === 0) return;
            bulkMutation.mutate(
                { ids: selectedIds, action: 'delete' },
                {
                    onSuccess: () => {
                        closeDeleteModal();
                        setSelectedIds([]);
                    },
                }
            );
            return;
        }

        if (deleteModal.id) {
            deleteMutation.mutate(deleteModal.id, {
                onSuccess: () => closeDeleteModal(),
            });
        }
    }, [deleteModal, deleteMutation, bulkMutation, selectedIds, closeDeleteModal]);

    const handleBulkAction = useCallback(
        (action: 'active' | 'inactive' | 'delete') => {
            if (selectedIds.length === 0) return;
            if (action === 'delete') {
                setDeleteModal({ isOpen: true, mode: 'bulk', id: null, name: '' });
                return;
            }
            bulkMutation.mutate({ ids: selectedIds, action }, { onSuccess: () => setSelectedIds([]) });
        },
        [selectedIds, bulkMutation]
    );

    const handleRefresh = useCallback(() => {
        void refetch();
    }, [refetch]);

    const handleExport = useCallback(() => {
        exportMutation.mutate(queryFilters);
    }, [exportMutation, queryFilters]);

    const isDeleting = deleteModal.mode === 'bulk' ? bulkMutation.isPending : deleteMutation.isPending;

    return (
        <div className="w-full px-4 sm:px-6 lg:px-10 py-1 sm:py-2">
            <div className="flex flex-col gap-3 mb-6">
                <Breadcrumbs
                    icon={MapPin}
                    items={[
                        { label: 'sidebar.locations', path: ROUTES.LOCATIONS_LIST },
                        { label: 'sidebar.location_list' },
                    ]}
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            {t('location:title')}
                        </h1>
                        <p className="text-sm font-semibold text-slate-400 mt-1.5">{t('location:subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={exportMutation.isPending}
                            className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 h-11 shrink-0"
                        >
                            <Download size={16} className={exportMutation.isPending ? 'animate-bounce' : ''} />
                            {t('location:actions.export')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.LOCATIONS_CREATE)}
                            className="px-5 py-3 bg-[#14b8a6] hover:bg-[#0f766e] text-white rounded-2xl transition-all duration-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-md shadow-[#14b8a6]/20 h-11 shrink-0"
                        >
                            <Plus size={16} />
                            {t('common:breadcrumb.add')}
                        </button>
                    </div>
                </div>
            </div>

            <LocationStats
                stats={
                    statsData
                        ? {
                              total: statsData.total,
                              active: statsData.active,
                              featured: statsData.featured,
                              views:
                                  statsData.total_views >= 1000
                                      ? `${(statsData.total_views / 1000).toFixed(1)}K`
                                      : `${statsData.total_views}`,
                          }
                        : data?.stats
                }
                isLoading={isStatsLoading && !data}
                isError={isStatsError && !data}
            />

            <LocationFilter filters={queryFilters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

            {isListError ? (
                <div
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center text-center"
                    data-testid="location-list-error"
                >
                    <EmptyState
                        title={t('location:messages.list_load_error')}
                        description={t('location:messages.list_load_error_desc')}
                    />
                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('common:actions.retry', 'Thử lại')}
                    </button>
                </div>
            ) : (
                <LocationTable
                    items={data?.items ?? []}
                    isLoading={isLoading}
                    selectedIds={selectedIds}
                    page={queryFilters.page}
                    limit={queryFilters.per_page}
                    total={data?.pagination.total ?? 0}
                    onPageChange={(page) => handleFilterChange('page', page)}
                    onLimitChange={(size) => handleFilterChange('per_page', size)}
                    onRefresh={handleRefresh}
                    isRefreshing={isFetching && !isLoading}
                    onSelectRow={handleSelectRow}
                    onSelectAll={handleSelectAll}
                    onToggleFeatured={handleToggleFeatured}
                    onView={(id) => navigate(ROUTES.LOCATIONS_DETAIL.replace(':id', id.toString()))}
                    onEdit={(id) => navigate(ROUTES.LOCATIONS_EDIT.replace(':id', id.toString()))}
                    onDelete={handleDeleteClick}
                    onBulkAction={handleBulkAction}
                    isBulkMutating={bulkMutation.isPending}
                />
            )}

            <DeleteLocationModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                locationName={deleteModal.name}
                isDeleting={isDeleting}
                isBulk={deleteModal.mode === 'bulk'}
                count={selectedIds.length}
            />
        </div>
    );
};

export default LocationListPage;
