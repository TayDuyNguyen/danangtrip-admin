import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import DetailedPagination from '@/components/pagination/DetailedPagination';
import { ROUTES } from '@/routes/routes';
import type { LocationFilters } from '@/dataHelper/location.dataHelper';

import LocationStats from './components/LocationStats';
import LocationFilter from './components/LocationFilter';
import LocationTable from './components/LocationTable';
import DeleteLocationModal from './components/DeleteLocationModal';

import { 
    useLocationsQuery, 
    useDeleteLocationMutation,
    useUpdateLocationFeaturedMutation,
    useBulkUpdateLocationStatusMutation
} from '@/hooks/useLocationQueries';

const LocationListPage = () => {
    const { t } = useTranslation(['location', 'common']);
    const navigate = useNavigate();

    // -- State --
    const [filters, setFilters] = useState<LocationFilters>({
        q: '',
        category_id: 'all',
        district_id: 'all',
        price_level: 'all',
        status: 'all',
        page: 1,
        per_page: 10
    });

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; name: string }>({
        isOpen: false,
        id: null,
        name: ''
    });

    // -- Queries --
    const { data, isLoading, isError } = useLocationsQuery(filters);
    const deleteMutation = useDeleteLocationMutation();
    const updateFeaturedMutation = useUpdateLocationFeaturedMutation();
    const bulkUpdateMutation = useBulkUpdateLocationStatusMutation();

    // -- Handlers --
    const handleFilterChange = useCallback((key: keyof LocationFilters, value: string | number | null | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({
            q: '',
            category_id: 'all',
            district_id: 'all',
            price_level: 'all',
            status: 'all',
            page: 1,
            per_page: 10
        });
    }, []);

    const handleSelectRow = useCallback((id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        if (!data) return;
        setSelectedIds(prev => 
            prev.length === data.items.length ? [] : data.items.map(i => i.id)
        );
    }, [data]);

    const handleToggleFeatured = useCallback((id: number, enabled: boolean) => {
        updateFeaturedMutation.mutate({ id, isFeatured: enabled });
    }, [updateFeaturedMutation]);

    const handleDeleteClick = useCallback((id: number) => {
        const item = data?.items.find(i => i.id === id);
        if (item) {
            setDeleteModal({ isOpen: true, id, name: item.name });
        }
    }, [data]);

    const handleConfirmDelete = useCallback(() => {
        if (deleteModal.id) {
            deleteMutation.mutate(deleteModal.id, {
                onSuccess: () => setDeleteModal({ isOpen: false, id: null, name: '' })
            });
        }
    }, [deleteModal.id, deleteMutation]);

    const handleBulkAction = useCallback((status: string) => {
        if (selectedIds.length === 0) return;
        bulkUpdateMutation.mutate({ ids: selectedIds, status }, {
            onSuccess: () => setSelectedIds([])
        });
    }, [selectedIds, bulkUpdateMutation]);

    // -- Render --
    return (
        <div className="p-1 sm:p-2 max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{t('location:filters.category')}</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{t('location:title')}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{t('location:title')}</h1>
                    <p className="text-slate-400 font-bold text-sm mt-1">{t('location:subtitle')}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="bg-white border-slate-100 rounded-xl px-5 font-bold h-12 shadow-sm flex items-center gap-2"
                    >
                        <Download size={18} />
                        {t('location:actions.export')}
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate(ROUTES.LOCATIONS_CREATE)}
                        className="bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-xl px-6 font-bold h-12 shadow-lg shadow-[#14b8a6]/20 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        {t('location:actions.add')}
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <LocationStats stats={data?.stats} isLoading={isLoading} isError={isError} />

            {/* Filter Section */}
            <LocationFilter 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onReset={handleResetFilters} 
            />

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between bg-[#f0fdfa] border border-[#14b8a6]/20 rounded-2xl p-4 mb-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-[#0f766e]">
                            {t('location:actions.selected', { count: selectedIds.length })}
                        </span>
                        <div className="h-6 w-px bg-[#14b8a6]/20"></div>
                        <div className="flex gap-2">
                            <Button 
                                className="bg-[#14b8a6] text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider h-auto"
                                onClick={() => handleBulkAction('active')}
                            >
                                {t('location:actions.activate')}
                            </Button>
                            <Button 
                                variant="outline"
                                className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider h-auto bg-amber-50 text-amber-600 border-amber-200"
                                onClick={() => handleBulkAction('inactive')}
                            >
                                {t('location:actions.deactivate')}
                            </Button>
                            <Button 
                                variant="danger"
                                className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider h-auto"
                                onClick={() => handleBulkAction('delete')}
                            >
                                {t('location:actions.delete')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <LocationTable 
                items={data?.items ?? []} 
                isLoading={isLoading} 
                selectedIds={selectedIds}
                onSelectRow={handleSelectRow}
                onSelectAll={handleSelectAll}
                onToggleFeatured={handleToggleFeatured}
                onView={(id) => navigate(ROUTES.LOCATIONS_EDIT.replace(':id', id.toString()))}
                onEdit={(id) => navigate(ROUTES.LOCATIONS_EDIT.replace(':id', id.toString()))}
                onDelete={handleDeleteClick}
            />

            {/* Pagination Area */}
            {data && data.pagination.total > 0 && (
                <DetailedPagination 
                    currentPage={filters.page}
                    totalPages={data.pagination.lastPage}
                    pageSize={filters.per_page}
                    totalItems={data.pagination.total}
                    onPageChange={(page) => handleFilterChange('page', page)}
                    onPageSizeChange={(size) => handleFilterChange('per_page', size)}
                />
            )}

            {/* Delete Confirmation */}
            <DeleteLocationModal 
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleConfirmDelete}
                locationName={deleteModal.name}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
};

export default LocationListPage;
