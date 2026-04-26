import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import type { RowSelectionState } from '@tanstack/react-table';
import { useToursQuery, useTourStatsQuery, useTourMutations, useTourCategoriesQuery } from '@/hooks/useTourQueries';
import type { TourFilters } from '@/dataHelper/tour.dataHelper';
import TourHeader from './components/TourHeader';
import TourStats from './components/TourStats';
import TourFilter from './components/TourFilter';
import TourTable from './components/TourTable';
import TourDeleteDialog from './components/TourDeleteDialog';
import TourDetailModal from './components/TourDetailModal';
import { ROUTES } from '@/routes/routes';
import { toast } from 'sonner';
import type { TourItem } from '@/dataHelper/tour.dataHelper';

const TourList = () => {
    const { t } = useTranslation('tour');
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    
    // View state
    const [viewTour, setViewTour] = useState<TourItem | null>(null);

    const [filters, setFilters] = useState<TourFilters>({
        q: '',
        tour_category_id: 'all',
        status: 'all',
        type: 'all',
        sort: 'created_at',
        order: 'desc'
    });

    const [deleteConfig, setDeleteConfig] = useState<{
        ids: number[];
        name: string;
        isBulk: boolean;
    } | null>(null);

    // Queries
    const { data: listData, isLoading: isListLoading, refetch: refetchTours, isFetching: isToursFetching } = useToursQuery(filters, page, limit);
    const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useTourStatsQuery();
    const { data: categoriesData } = useTourCategoriesQuery();

    // Mutations
    const {
        statusMutation,
        featuredMutation,
        hotMutation,
        deleteMutation,
        exportMutation
    } = useTourMutations();

    const tours = useMemo(() => listData?.data || [], [listData]);
    const total = listData?.total || 0;
    const categories = useMemo(() => categoriesData || [], [categoriesData]);

    const handleFilterChange = (newFilters: TourFilters) => {
        setFilters(newFilters);
        setPage(1);
        setRowSelection({});
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
        setRowSelection({});
    };

    const handleDeleteClick = (id: number, name: string) => {
        setDeleteConfig({ ids: [id], name, isBulk: false });
    };

    const handleBulkDeleteClick = (ids: number[]) => {
        setDeleteConfig({ ids, name: '', isBulk: true });
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfig) return;

        try {
            if (deleteConfig.isBulk) {
                // Individual deletes as API doesn't have bulk endpoint currently
                await Promise.all(deleteConfig.ids.map(id => deleteMutation.mutateAsync(id)));
                toast.success(t('messages.delete_success', { count: deleteConfig.ids.length }));
            } else {
                await deleteMutation.mutateAsync(deleteConfig.ids[0]);
                toast.success(t('messages.delete_success', { count: 1 }));
            }
            setDeleteConfig(null);
            setRowSelection({}); // Clear selection after successful delete
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(t('messages.delete_error'));
        }
    };

    const handleBulkStatusChange = async (ids: number[], status: 'active' | 'inactive' | 'sold_out') => {
        try {
            await Promise.all(ids.map(id => statusMutation.mutateAsync({ id, status })));
            toast.success(t('messages.status_update_success', { count: ids.length }));
            setRowSelection({});
        } catch (error) {
            console.error('Bulk status error:', error);
            toast.error(t('messages.status_update_error'));
        }
    };

    const handleRefresh = () => {
        refetchTours();
        refetchStats();
    };

    return (
        <div className="p-4 lg:p-10 mx-auto min-h-screen bg-white font-sans">
            <TourHeader
                onExport={() => exportMutation.mutate(filters)}
                isExporting={exportMutation.isPending}
            />

            <TourStats
                stats={statsData}
                isLoading={isStatsLoading}
            />

            <TourFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
            />

            <TourTable
                data={tours}
                categories={categories}
                isLoading={isListLoading}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={handleLimitChange}
                onRefresh={handleRefresh}
                isRefreshing={isToursFetching && !isListLoading}
                onEdit={(id) => navigate(`${ROUTES.TOURS_EDIT.replace(':id', id.toString())}`)}
                onView={setViewTour}
                onDelete={handleDeleteClick}
                onToggleFeatured={(id, value) => {
                    featuredMutation.mutate({ id, is_featured: value });
                }}
                onToggleHot={(id, value) => {
                    hotMutation.mutate({ id, is_hot: value });
                }}
                onStatusChange={(id, status) => {
                    statusMutation.mutate({ id, status });
                }}
                onBulkDelete={handleBulkDeleteClick}
                onBulkStatusChange={handleBulkStatusChange}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
            />

            <TourDeleteDialog
                isOpen={!!deleteConfig}
                tourName={deleteConfig?.name || ''}
                isBulk={deleteConfig?.isBulk}
                count={deleteConfig?.ids.length}
                onClose={() => setDeleteConfig(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={deleteMutation.isPending}
            />

            <TourDetailModal
                isOpen={!!viewTour}
                onClose={() => setViewTour(null)}
                tour={viewTour}
                onEdit={(id) => {
                    setViewTour(null);
                    navigate(`${ROUTES.TOURS_EDIT.replace(':id', id.toString())}`);
                }}
            />
        </div>
    );
};

export default TourList;
