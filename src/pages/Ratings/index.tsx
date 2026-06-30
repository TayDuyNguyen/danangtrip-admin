import React, { useState } from 'react';
import { Star, Trash2, Download, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Common Components
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';
import { reportApi } from '@/api/reportApi';

// Queries & Mutations hooks
import { useRatingsReportQuery } from '@/hooks/useReportQueries';
import { useAdminRatingsListQuery, useAdminRatingMutations } from '@/hooks/useRatingQueries';
import type { RatingsListFilters, RatingViewModel } from '@/dataHelper/rating.dataHelper';
import type { RatingsReportFilters } from '@/dataHelper/report.dataHelper';

// Subcomponents
import RatingStatsCards from './components/RatingStatsCards';
import RatingFilterBar from './components/RatingFilterBar';
import RatingTable from './components/RatingTable';
import RejectRatingDialog from './components/RejectRatingDialog';
import RatingDeleteDialog from './components/RatingDeleteDialog';

const Ratings: React.FC = () => {
    const { t } = useTranslation(['ratings', 'common']);
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Manage current filters state
    const [filters, setFilters] = useState<RatingsListFilters>({
        status: 'all',
        is_new: searchParams.get('is_new') === '1'
            ? true
            : searchParams.get('is_new') === '0'
                ? false
                : undefined,
        type: 'all',
        search: '',
        page: 1,
        per_page: 10,
    });

    // 2. Selection states
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // 3. Dialog states
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [rejectItem, setRejectItem] = useState<RatingViewModel | null>(null);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    const toRatingsReportFilters = React.useCallback((value: RatingsListFilters): RatingsReportFilters => ({
        ...value,
        location_id: typeof value.location_id === 'string' ? Number(value.location_id) || undefined : value.location_id,
        tour_id: typeof value.tour_id === 'string' ? Number(value.tour_id) || undefined : value.tour_id,
        from: value.date_from,
        to: value.date_to,
    }), []);

    // 4. Fetch data in parallel
    // KPI Stats (overall review counts)
    const { 
        data: reportData, 
        isLoading: isReportLoading,
        isError: isReportError,
        refetch: refetchReport 
    } = useRatingsReportQuery(toRatingsReportFilters(filters));

    // Rating management list
    const { 
        data: ratingsData, 
        isLoading: isListLoading,
        isFetching: isListFetching,
        isError: isListError,
        refetch: refetchList 
    } = useAdminRatingsListQuery(filters);

    // Mutations
    const { 
        rejectMutation, 
        deleteMutation, 
        exportMutation,
        markViewedMutation,
        invalidateRatingQueries,
    } = useAdminRatingMutations();

    const pruneBulkSelection = React.useCallback((
        ids: number[],
        results: PromiseSettledResult<unknown>[],
    ) => {
        setSelectedIds((prev) =>
            prev.filter((id) => {
                const index = ids.indexOf(id);
                if (index === -1) return true;
                return results[index].status !== 'fulfilled';
            })
        );
    }, []);

    // 5. Compute derived counts for stats row
    const stats = reportData
        ? {
            total: reportData.stats.total || 0,
            new: reportData.stats.new || 0,
            viewed: reportData.stats.viewed || 0,
            rejected: reportData.charts.statuses.find((status) => status.status === 'rejected')?.count || 0,
        }
        : undefined;

    // 6. Bulk Selection Helpers
    const ratingsItems = ratingsData?.items || [];
    const isSelectedAll = ratingsItems.length > 0 && ratingsItems.every(item => selectedIds.includes(item.id));

    const handleSelectAllChange = (checked: boolean) => {
        if (checked) {
            const allIds = ratingsItems.map(item => item.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
        } else {
            const listIds = ratingsItems.map(item => item.id);
            setSelectedIds(prev => prev.filter(id => !listIds.includes(id)));
        }
    };

    const handleSelectToggle = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    // 7. Individual Management Actions
    const handleMarkViewed = (id: number) => {
        markViewedMutation.mutate(id, {
            onSuccess: () => {
                refetchReport();
                refetchList();
            }
        });
    };

    const handleRejectClick = (item: RatingViewModel) => {
        setRejectItem(item);
        setIsRejectOpen(true);
    };

    const handleRejectSubmit = (reason: string) => {
        if (rejectItem) {
            // Single reject
            rejectMutation.mutate({ id: rejectItem.id, rejected_reason: reason }, {
                onSuccess: () => {
                    setSelectedIds(prev => prev.filter(selected => selected !== rejectItem.id));
                    setIsRejectOpen(false);
                    setRejectItem(null);
                    refetchReport();
                    refetchList();
                }
            });
        } else {
            // Bulk reject
            if (selectedIds.length === 0) return;
            const bulkIds = [...selectedIds];
            const bulkCount = bulkIds.length;
            setIsBulkLoading(true);

            toast.promise(
                (async () => {
                    try {
                        const results = await Promise.allSettled(
                            bulkIds.map((id) =>
                                reportApi.rejectRating(id, { rejected_reason: reason })
                            )
                        );

                        invalidateRatingQueries();
                        pruneBulkSelection(bulkIds, results);
                        setIsRejectOpen(false);
                        refetchReport();
                        refetchList();

                        const succeeded = results.filter((result) => result.status === 'fulfilled').length;
                        const failed = bulkCount - succeeded;

                        if (failed === 0) {
                            return t('success.hide_bulk_success', 'Đã ẩn thành công {{count}} đánh giá.', { count: bulkCount });
                        }
                        if (succeeded === 0) {
                            throw new Error(t('error.update_bulk', 'Cập nhật hàng loạt thất bại.'));
                        }
                        return t('success.hide_bulk_partial', 'Đã ẩn {{success}}/{{total}} đánh giá. {{failed}} thất bại.', {
                            success: succeeded,
                            total: bulkCount,
                            failed,
                        });
                    } finally {
                        setIsBulkLoading(false);
                    }
                })(),
                {
                    loading: t('actions.processing', 'Đang xử lý...'),
                    success: (message) => message,
                    error: (err) => err?.message || t('error.update_bulk', 'Cập nhật hàng loạt thất bại.'),
                }
            );
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
    };

    const handleDeleteConfirm = () => {
        if (deleteId) {
            deleteMutation.mutate(deleteId, {
                onSuccess: () => {
                    setSelectedIds(prev => prev.filter(selected => selected !== deleteId));
                    setDeleteId(null);
                    refetchReport();
                    refetchList();
                }
            });
        }
    };

    // 8. Bulk Management Action Triggers
    const handleBulkRejectClick = () => {
        setRejectItem(null); // Null triggers bulk UI in dialog
        setIsRejectOpen(true);
    };

    const handleBulkDeleteClick = () => {
        setIsBulkDeleteOpen(true);
    };

    const handleBulkDeleteConfirm = async () => {
        if (selectedIds.length === 0) return;
        const bulkIds = [...selectedIds];
        const bulkCount = bulkIds.length;
        setIsBulkLoading(true);

        toast.promise(
            (async () => {
                try {
                    const results = await Promise.allSettled(
                        bulkIds.map((id) => reportApi.deleteRating(id))
                    );

                    invalidateRatingQueries();
                    pruneBulkSelection(bulkIds, results);
                    setIsBulkDeleteOpen(false);
                    refetchReport();
                    refetchList();

                    const succeeded = results.filter((result) => result.status === 'fulfilled').length;
                    const failed = bulkCount - succeeded;

                    if (failed === 0) {
                        return t('success.delete_bulk_success', 'Đã xóa vĩnh viễn thành công {{count}} đánh giá.', { count: bulkCount });
                    }
                    if (succeeded === 0) {
                        throw new Error(t('error.delete_bulk', 'Xóa hàng loạt thất bại.'));
                    }
                    return t('success.delete_bulk_partial', 'Đã xóa {{success}}/{{total}} đánh giá. {{failed}} thất bại.', {
                        success: succeeded,
                        total: bulkCount,
                        failed,
                    });
                } finally {
                    setIsBulkLoading(false);
                }
            })(),
            {
                loading: t('actions.processing', 'Đang xử lý...'),
                success: (message) => message,
                error: (err) => err?.message || t('error.delete_bulk', 'Xóa hàng loạt thất bại.'),
            }
        );
    };

    // 9. Filter Handlers
    const handleFilterChange = React.useCallback((newFilters: RatingsListFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
        }));
        setSelectedIds([]);

        if (Object.prototype.hasOwnProperty.call(newFilters, 'is_new')) {
            const nextParams = new URLSearchParams(searchParams);
            if (newFilters.is_new === undefined) {
                nextParams.delete('is_new');
            } else {
                nextParams.set('is_new', newFilters.is_new ? '1' : '0');
            }
            setSearchParams(nextParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleLimitChange = React.useCallback((perPage: number) => {
        setFilters(prev => ({
            ...prev,
            per_page: perPage,
            page: 1,
        }));
        setSelectedIds([]);
    }, []);

    const handleReset = React.useCallback(() => {
        setFilters(prev => ({
            status: 'all',
            is_new: undefined,
            type: 'all',
            search: '',
            page: 1,
            per_page: prev.per_page || 10,
        }));
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('is_new');
        setSearchParams(nextParams, { replace: true });
        setSelectedIds([]);
        toast.success(t('filter.toast.reset_success', 'Đã thiết lập lại bộ lọc.'));
    }, [searchParams, setSearchParams, t]);

    // 10. Excel Export Handler
    const handleExport = () => {
        const exportParams = { ...filters };
        delete exportParams.page;
        delete exportParams.per_page;
        
        toast.promise(
            exportMutation.mutateAsync({
                params: toRatingsReportFilters(exportParams),
                fallbackFilename: `ratings_management_export_${new Date().toISOString().slice(0,10)}.xlsx`,
            }),
            {
                loading: t('toast.exporting_excel', 'Đang chuẩn bị file Excel...'),
                success: t('toast.export_success', 'Xuất báo cáo Excel thành công!'),
                error: t('toast.export_failed', 'Xuất file Excel thất bại.'),
            }
        );
    };

    const isMutating = 
        markViewedMutation.isPending ||
        rejectMutation.isPending || 
        deleteMutation.isPending || 
        isBulkLoading;

    // Retrieve active delete user name
    const deletingItem = ratingsItems.find(item => item.id === deleteId);
    const deletingUserName = deletingItem?.userName || '';

    return (
        <main className="p-1 sm:p-2 max-w-[1600px] mx-auto flex flex-col gap-6 font-sans">
            {/* Page Header */}
            <div className="flex flex-col gap-3">
                <Breadcrumbs
                    icon={Star}
                    items={[
                        { label: 'sidebar.ratings' }
                    ]}
                />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {t('table.details_title', 'Danh sách Đánh giá')}
                        </h1>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                            {t('table.details_subtitle', 'Theo dõi, tìm kiếm, duyệt ẩn và xóa đánh giá của khách hàng.')}
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        className="flex items-center justify-center gap-2 bg-[#14B8A6] hover:bg-[#0f766e] text-white disabled:opacity-50 rounded-xl py-2.5 px-5 text-sm font-bold shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl hover:shadow-[#14B8A6]/30 transition-all duration-200 cursor-pointer self-start md:self-auto"
                    >
                        <Download size={16} className={exportMutation.isPending ? "animate-bounce" : ""} />
                        <span>
                            {exportMutation.isPending
                                ? t('actions.exporting', 'Đang xuất...')
                                : t('actions.export_excel', 'Xuất báo cáo Excel')}
                        </span>
                    </button>
                </div>
            </div>

            {/* Statistics Summary */}
            <RatingStatsCards 
                stats={stats} 
                isLoading={isReportLoading}
                isError={isReportError}
                onRetry={refetchReport}
            />

            {/* Advanced Filters */}
            <RatingFilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                onExport={handleExport}
                isExporting={exportMutation.isPending}
            />

            {/* Ratings Records Table */}
            {isListError ? (
                <div
                    className="bg-white border border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center text-center"
                    data-testid="rating-list-error"
                >
                    <EmptyState
                        title={t('messages.list_load_error')}
                        description={t('messages.list_load_error_desc')}
                    />
                    <button
                        type="button"
                        onClick={() => void refetchList()}
                        className="mt-2 px-6 py-2.5 bg-[#14b8a6] text-white rounded-xl text-[13px] font-bold hover:bg-[#0f766e] transition-colors inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('actions.retry', { ns: 'common', defaultValue: 'Thử lại' })}
                    </button>
                </div>
            ) : (
                <RatingTable
                    ratings={ratingsItems}
                    isLoading={isListLoading}
                    isRefreshing={isListFetching}
                    selectedIds={selectedIds}
                    onSelectToggle={handleSelectToggle}
                    isSelectedAll={isSelectedAll}
                    onSelectAllChange={handleSelectAllChange}
                    onMarkViewed={handleMarkViewed}
                    onRejectClick={handleRejectClick}
                    onDelete={handleDeleteClick}
                    page={filters.page || 1}
                    limit={filters.per_page || 10}
                    total={ratingsData?.total || 0}
                    onPageChange={(page) => handleFilterChange({ page })}
                    onLimitChange={handleLimitChange}
                    onRefresh={refetchList}
                    isMutating={isMutating}
                    onBulkReject={handleBulkRejectClick}
                    onBulkDelete={handleBulkDeleteClick}
                />
            )}

            {/* Rejection / Hidden Input Dialog Portal */}
            <RejectRatingDialog
                rating={rejectItem}
                selectedCount={selectedIds.length}
                isOpen={isRejectOpen}
                onClose={() => {
                    setIsRejectOpen(false);
                    setRejectItem(null);
                }}
                onSubmit={handleRejectSubmit}
                isSubmitting={rejectMutation.isPending || isBulkLoading}
            />

            {/* Delete Confirmation Modal */}
            <RatingDeleteDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteConfirm}
                isDeleting={deleteMutation.isPending}
                userName={deletingUserName}
            />

            {/* Bulk Delete Confirmation Modal */}
            {isBulkDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsBulkDeleteOpen(false)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-[440px] p-6 shadow-2xl border border-slate-100 z-10 mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                                {t('actions.delete_bulk_confirm_title', 'Xóa hàng loạt đánh giá?')}
                            </h3>
                            <p className="text-sm font-semibold text-[#64748B] mt-2.5 leading-relaxed">
                                {t('actions.delete_bulk_confirm_body', 'Bạn có chắc chắn muốn xóa vĩnh viễn {{count}} đánh giá đã chọn? Hành động này không thể khôi phục.', { count: selectedIds.length })}
                            </p>
                            <div className="flex gap-3 w-full mt-6">
                                <button
                                    onClick={() => setIsBulkDeleteOpen(false)}
                                    disabled={isMutating}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 font-black text-sm cursor-pointer bg-white"
                                >
                                    {t('actions.cancel', 'Hủy bỏ')}
                                </button>
                                <button
                                    onClick={handleBulkDeleteConfirm}
                                    disabled={isMutating}
                                    className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    <Trash2 size={16} />
                                    <span>{isMutating ? t('actions.processing', 'Đang xử lý...') : t('actions.delete', 'Xóa')}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Ratings;
